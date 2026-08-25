import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { normalizeEmail } from '@/services/crm/normalization'

const bookingSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  offerName: z.string().min(1),
  notes: z.string().optional(),
  slotId: z.string().optional(),
})

export async function POST(request: NextRequest) {
  const body = await request.json()
  const parsed = bookingSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  const { slotId, ...data } = parsed.data

  try {
    const booking = await db.$transaction(async (tx) => {
      if (slotId) {
        const slot = await tx.availabilitySlot.findUnique({ where: { id: slotId } })
        if (!slot || slot.isBooked) {
          throw new Error('SLOT_UNAVAILABLE')
        }
        await tx.availabilitySlot.update({ where: { id: slotId }, data: { isBooked: true } })
      }

      const booking = await tx.booking.create({ data: { ...data, userId, slotId } })
      const email = normalizeEmail(data.email)!
      let contact = await tx.crmContact.findFirst({ where: { normalizedEmail: email, deletedAt: null } })
      if (!contact) {
        const parts = data.name.trim().split(/\s+/)
        contact = await tx.crmContact.create({ data: { firstName: parts[0], lastName: parts.slice(1).join(' ') || null, displayName: data.name, primaryEmail: data.email, normalizedEmail: email, lifecycleStage: 'lead', relationshipTypes: ['lead'], source: 'booking', nextActionAt: new Date(Date.now() + 24 * 60 * 60 * 1000) } })
      }
      await tx.crmActivity.create({ data: { contactId: contact.id, type: 'booking', direction: 'inbound', subject: `Requested ${data.offerName}`, body: data.notes, metadata: { bookingId: booking.id, slotId } } })
      await tx.crmTask.create({ data: { title: `Confirm booking: ${data.name}`, description: `${data.offerName}${data.notes ? ` · ${data.notes}` : ''}`, dueAt: new Date(Date.now() + 4 * 60 * 60 * 1000), priority: 'high', contactId: contact.id } })
      await tx.crmContact.update({ where: { id: contact.id }, data: { lastActivityAt: new Date(), nextActionAt: new Date(Date.now() + 4 * 60 * 60 * 1000) } })
      return booking
    })

    return NextResponse.json({ booking }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'SLOT_UNAVAILABLE') {
      return NextResponse.json({ error: 'That time slot is no longer available.' }, { status: 409 })
    }
    throw error
  }
}
