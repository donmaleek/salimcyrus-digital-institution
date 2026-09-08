import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { normalizeEmail } from '@/services/crm/normalization'
import { coachingOffers } from '@/lib/data/coaching-offers'

const offerNames = new Set(coachingOffers.map((offer) => offer.name))
// A booking counts as "really paid" only if it was created by a server that
// independently verified the payment (the Paystack webhook, or a PayPal
// capture / Paybill claim approval), never by /api/booking/confirm itself,
// which only ever updates one of these rows and can't create one.
const VERIFIED_BOOKING_SOURCES = new Set(['paystack_webhook', 'paypal_checkout', 'paybill_checkout'])
const VERIFIED_PROVIDERS = new Set(['paystack', 'paypal', 'paybill'])

const bookingSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(254),
  offerName: z.string().refine((value) => offerNames.has(value)),
  paymentReference: z.string().trim().min(3).max(100).regex(/^[A-Za-z0-9._-]+$/),
  notes: z.string().trim().max(2000).optional(),
  slotId: z.string().trim().max(100).optional(),
})

class BookingConfirmationError extends Error {
  constructor(
    public code: 'PAYMENT_NOT_VERIFIED' | 'SLOT_UNAVAILABLE' | 'ALREADY_CONFIRMED'
  ) {
    super(code)
  }
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null)
  const parsed = bookingSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const session = await getServerSession(authOptions)
  const sessionUserId = (session?.user as { id?: string } | undefined)?.id
  const { slotId, paymentReference, ...data } = parsed.data
  const normalizedEmail = normalizeEmail(data.email)!

  try {
    const booking = await db.$transaction(async (tx) => {
      const [paidBooking, transaction, sessionUser] = await Promise.all([
        tx.booking.findUnique({ where: { paystackReference: paymentReference } }),
        tx.crmTransaction.findUnique({ where: { externalReference: paymentReference } }),
        sessionUserId ? tx.user.findUnique({ where: { id: sessionUserId } }) : null,
      ])

      const paidEmail = normalizeEmail(paidBooking?.email)
      const recordedOffer = paidBooking?.offerName
      const offerMatches =
        recordedOffer === data.offerName || recordedOffer === 'Payment received (unmatched offer)'

      if (
        !paidBooking ||
        !VERIFIED_BOOKING_SOURCES.has(paidBooking.source) ||
        !transaction ||
        !VERIFIED_PROVIDERS.has(transaction.provider) ||
        transaction.status !== 'successful' ||
        paidEmail !== normalizedEmail ||
        !offerMatches
      ) {
        throw new BookingConfirmationError('PAYMENT_NOT_VERIFIED')
      }

      if (paidBooking.confirmedAt) {
        const sameConfirmation =
          paidBooking.slotId === (slotId || null) && paidBooking.offerName === data.offerName
        if (!sameConfirmation) throw new BookingConfirmationError('ALREADY_CONFIRMED')
        return paidBooking
      }

      if (slotId) {
        const claimed = await tx.availabilitySlot.updateMany({
          where: { id: slotId, isBooked: false, startTime: { gt: new Date() } },
          data: { isBooked: true },
        })
        if (claimed.count !== 1) throw new BookingConfirmationError('SLOT_UNAVAILABLE')
      }

      const userId =
        sessionUser && normalizeEmail(sessionUser.email) === normalizedEmail
          ? sessionUser.id
          : paidBooking.userId
      const confirmedAt = new Date()
      const confirmedBooking = await tx.booking.update({
        where: { id: paidBooking.id },
        data: {
          ...data,
          offerName: data.offerName,
          status: 'confirmed',
          userId,
          slotId: slotId || null,
          confirmedAt,
        },
      })
      let contact = await tx.crmContact.findFirst({ where: { normalizedEmail, deletedAt: null } })
      if (!contact) {
        const parts = data.name.trim().split(/\s+/)
        contact = await tx.crmContact.create({ data: { firstName: parts[0], lastName: parts.slice(1).join(' ') || null, displayName: data.name, primaryEmail: data.email, normalizedEmail, lifecycleStage: 'client', relationshipTypes: ['client'], source: 'booking' } })
      }
      await tx.crmActivity.create({ data: { contactId: contact.id, type: 'booking', direction: 'inbound', subject: `Confirmed ${data.offerName}`, body: data.notes, externalId: `booking-confirm:${paymentReference}`, metadata: { bookingId: confirmedBooking.id, slotId } } })
      const dueAt = new Date(Date.now() + 4 * 60 * 60 * 1000)
      await tx.crmTask.create({ data: { title: slotId ? `Prepare session: ${data.name}` : `Schedule session: ${data.name}`, description: `${data.offerName}${data.notes ? ` · ${data.notes}` : ''}`, dueAt, priority: slotId ? 'normal' : 'high', contactId: contact.id } })
      await tx.crmContact.update({ where: { id: contact.id }, data: { lifecycleStage: 'client', lastActivityAt: confirmedAt, nextActionAt: dueAt } })
      return confirmedBooking
    }, { isolationLevel: 'Serializable' })

    return NextResponse.json(
      {
        booking: {
          id: booking.id,
          status: booking.status,
          slotId: booking.slotId,
          accountLinked: Boolean(booking.userId),
        },
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof BookingConfirmationError && error.code === 'SLOT_UNAVAILABLE') {
      return NextResponse.json({ error: 'That time slot is no longer available.' }, { status: 409 })
    }
    if (error instanceof BookingConfirmationError && error.code === 'ALREADY_CONFIRMED') {
      return NextResponse.json({ error: 'This payment has already been used to confirm a booking.' }, { status: 409 })
    }
    if (error instanceof BookingConfirmationError && error.code === 'PAYMENT_NOT_VERIFIED') {
      return NextResponse.json({ error: 'We could not verify that payment. Check the email and payment reference, then try again.' }, { status: 422 })
    }
    throw error
  }
}
