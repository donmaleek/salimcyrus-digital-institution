import { db } from '@/lib/db'
import { normalizeEmail } from '@/services/crm/normalization'
import type { PaymentProvider } from '@/services/payments/book-purchases'

export interface RecordDonationInput {
  reference: string
  provider: PaymentProvider
  amountMinor: number
  currency: 'KES' | 'USD'
  email: string
  name: string
}

/**
 * Idempotently records a "Support the Mission" donation across Booking (the
 * legacy tracking surface every donation has ridden on since the Paystack
 * path shipped, My Bookings shows it, so a new provider has to land in the
 * same place), CrmTransaction, and CrmDonation. Shared by both the Paystack
 * webhook and the PayPal capture-on-return path so the two providers can
 * never silently diverge in what gets recorded.
 */
export async function recordDonation({
  reference,
  provider,
  amountMinor,
  currency,
  email,
  name,
}: RecordDonationInput): Promise<{ isNew: boolean }> {
  const normalizedEmail = normalizeEmail(email)!
  const matchingUser = await db.user.findFirst({
    where: { email: { equals: normalizedEmail, mode: 'insensitive' } },
  })

  return db.$transaction(async (tx) => {
    const [existingBooking, existingTransaction] = await Promise.all([
      tx.booking.findUnique({ where: { paystackReference: reference } }),
      tx.crmTransaction.findUnique({ where: { externalReference: reference } }),
    ])
    if (existingBooking || existingTransaction) return { isNew: false }

    let contact = await tx.crmContact.findFirst({ where: { normalizedEmail, deletedAt: null } })
    if (!contact) {
      const parts = name.split(/\s+/)
      contact = await tx.crmContact.create({
        data: {
          firstName: parts[0],
          lastName: parts.slice(1).join(' ') || null,
          displayName: name,
          primaryEmail: email,
          normalizedEmail,
          lifecycleStage: 'donor',
          relationshipTypes: ['donor', 'supporter'],
          source: `${provider}_checkout`,
        },
      })
    }

    const booking = await tx.booking.create({
      data: {
        name,
        email,
        offerName: 'Support the Mission',
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
        businessLine: 'donations',
        grossMinor: amountMinor,
        netMinor: amountMinor,
        currency,
        paidAt: new Date(),
        metadata: { bookingId: booking.id, offerName: 'Support the Mission' },
      },
    })
    await tx.crmDonation.create({
      data: { contactId: contact.id, campaign: 'Support the Mission', amountMinor, currency, status: 'received' },
    })
    await tx.crmActivity.create({
      data: {
        contactId: contact.id,
        type: 'payment',
        direction: 'inbound',
        subject: 'Support the Mission payment received',
        channel: provider,
        externalId: reference,
        metadata: { amount: amountMinor, bookingId: booking.id },
      },
    })
    await tx.crmAuditEvent.create({
      data: {
        action: provider === 'paystack' ? 'webhook' : provider === 'paypal' ? 'paypal_capture' : 'paybill_claim_approved',
        entityType: 'CrmTransaction',
        entityId: reference,
        summary: `Recorded ${provider} donation ${reference}`,
      },
    })

    return { isNew: true }
  }, { isolationLevel: 'Serializable' })
}
