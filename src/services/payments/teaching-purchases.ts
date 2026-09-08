import { db } from '@/lib/db'
import { normalizeEmail } from '@/services/crm/normalization'
import type { PaymentProvider } from '@/services/payments/book-purchases'

export const TEACHING_OFFER_PREFIX = 'teaching:'

export function teachingOfferName(slug: string): string {
  return `${TEACHING_OFFER_PREFIX}${slug}`
}

export function slugFromTeachingOfferName(offerName: string): string | null {
  return offerName.startsWith(TEACHING_OFFER_PREFIX)
    ? offerName.slice(TEACHING_OFFER_PREFIX.length)
    : null
}

export interface RecordTeachingPurchaseInput {
  teachingId: string
  reference: string
  provider: PaymentProvider
  amountKobo: number
  currency: 'KES' | 'USD'
  userId: string
  email: string
  name: string
}

/**
 * Idempotently records a paid teaching purchase. Unlike BookPurchase,
 * userId is required, not optional. Teachings shipped after the
 * account-required checkout gate existed, so there's no historical case of
 * a purchase without a matching account to handle.
 */
export async function recordTeachingPurchase({
  teachingId,
  reference,
  provider,
  amountKobo,
  currency,
  userId,
  email,
  name,
}: RecordTeachingPurchaseInput): Promise<{ purchaseId: string; isNew: boolean } | null> {
  const teaching = await db.teaching.findUnique({ where: { id: teachingId } })
  if (!teaching) return null

  const existing = await db.teachingPurchase.findUnique({
    where: { provider_externalReference: { provider, externalReference: reference } },
  })
  if (existing) return { purchaseId: existing.id, isNew: false }

  const normalizedEmail = normalizeEmail(email)!
  const purchase = await db.teachingPurchase.create({
    data: { teachingId, userId, email, name, provider, externalReference: reference, amountKobo, currency },
  })

  const contact = await db.crmContact.findFirst({ where: { normalizedEmail, deletedAt: null } })
  if (contact) {
    await db.crmActivity.create({
      data: {
        contactId: contact.id,
        type: 'payment',
        direction: 'inbound',
        subject: `Teaching purchase: ${teaching.title}`,
        channel: provider,
        externalId: reference,
        metadata: { amount: amountKobo, teachingId },
      },
    })
  }

  return { purchaseId: purchase.id, isNew: true }
}
