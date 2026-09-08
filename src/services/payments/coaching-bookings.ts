import { db } from '@/lib/db'
import { normalizeEmail } from '@/services/crm/normalization'
import type { PaymentProvider } from '@/services/payments/book-purchases'

export interface RecordCoachingPaymentInput {
  offerName: string
  reference: string
  provider: PaymentProvider
  amountMinor: number
  currency: 'KES' | 'USD'
  email: string
  name: string
  userId?: string
}

/**
 * Records a paid-but-unscheduled coaching booking for PayPal/Paybill,
 * mirroring the shape the Paystack webhook already creates for its own
 * (amount-matched or generic) coaching payments. Booking.source marks how
 * it was paid; /api/booking/confirm treats any of the known paid sources
 * as real evidence and only ever updates this row, never creates a
 * second one, so the buyer's later "pick a time" step works identically
 * regardless of which provider they used.
 */
export async function recordCoachingPayment({
  offerName,
  reference,
  provider,
  amountMinor,
  currency,
  email,
  name,
  userId,
}: RecordCoachingPaymentInput): Promise<{ isNew: boolean }> {
  const normalizedEmail = normalizeEmail(email)!
  const matchingUser = userId
    ? await db.user.findUnique({ where: { id: userId } })
    : await db.user.findFirst({ where: { email: { equals: normalizedEmail, mode: 'insensitive' } } })

  return db.$transaction(async (tx) => {
    const [existingBooking, existingTransaction] = await Promise.all([
      tx.booking.findUnique({ where: { paystackReference: reference } }),
      tx.crmTransaction.findUnique({ where: { externalReference: reference } }),
    ])
    if (existingBooking || existingTransaction) return { isNew: false }

    let contact = await tx.crmContact.findFirst({ where: { normalizedEmail, deletedAt: null } })
    if (!contact) {
      const parts = name.trim().split(/\s+/)
      contact = await tx.crmContact.create({
        data: {
          firstName: parts[0],
          lastName: parts.slice(1).join(' ') || null,
          displayName: name,
          primaryEmail: email,
          normalizedEmail,
          lifecycleStage: 'client',
          relationshipTypes: ['client'],
          source: `${provider}_checkout`,
        },
      })
    }

    const booking = await tx.booking.create({
      data: {
        name,
        email,
        offerName,
        status: 'paid',
        source: `${provider}_checkout`,
        amountKobo: amountMinor,
        paystackReference: reference,
        userId: matchingUser?.id,
        notes: `Automatically recorded from ${provider} payment ${reference}.`,
      },
    })
    await tx.crmTransaction.create({
      data: {
        externalReference: reference,
        contactId: contact.id,
        provider,
        method: 'online_checkout',
        status: 'successful',
        reconciliationStatus: 'reconciled',
        businessLine: 'coaching',
        grossMinor: amountMinor,
        netMinor: amountMinor,
        currency,
        paidAt: new Date(),
        metadata: { bookingId: booking.id, offerName },
      },
    })
    await tx.crmActivity.create({
      data: {
        contactId: contact.id,
        type: 'payment',
        direction: 'inbound',
        subject: `${offerName} payment received`,
        channel: provider,
        externalId: reference,
        metadata: { amount: amountMinor, bookingId: booking.id },
      },
    })
    await tx.crmAuditEvent.create({
      data: {
        action: provider === 'paypal' ? 'paypal_capture' : 'paybill_claim_approved',
        entityType: 'CrmTransaction',
        entityId: reference,
        summary: `Recorded ${provider} coaching payment ${reference}`,
      },
    })

    return { isNew: true }
  }, { isolationLevel: 'Serializable' })
}
