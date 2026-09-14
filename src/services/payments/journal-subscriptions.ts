import { db } from '@/lib/db'

export const JOURNAL_SUBSCRIPTION_PRICE_KES = 500
/** Same fixed ~129.4 KES/USD rate used for books, teachings, and courses;
 * see src/lib/data/books.ts for the rationale. */
export const JOURNAL_SUBSCRIPTION_PRICE_USD = 4
export const JOURNAL_SUBSCRIPTION_PERIOD_DAYS = 30

export interface RecordJournalSubscriptionInput {
  userId: string
  reference: string
  provider: 'paypal' | 'paybill'
  amountMinor: number
  currency: 'KES' | 'USD'
}

/**
 * Idempotently records one paid month of Journal access (by [provider,
 * externalReference], same replay-safety as every other payment type).
 * Unlike a one-time purchase, this never upserts a single row per user:
 * each payment appends its own 30-day-wide row, and access is "does the
 * user have any row still in the future" (see getActiveJournalSubscription).
 * A renewal made while still active stacks onto the current expiry rather
 * than today, so paying early or an admin taking time to approve a Paybill
 * claim never costs the subscriber time they already paid for.
 */
export async function recordJournalSubscription({
  userId,
  reference,
  provider,
  amountMinor,
  currency,
}: RecordJournalSubscriptionInput): Promise<{ subscriptionId: string; expiresAt: Date; isNew: boolean }> {
  const existing = await db.journalSubscription.findUnique({
    where: { provider_externalReference: { provider, externalReference: reference } },
  })
  if (existing) {
    return { subscriptionId: existing.id, expiresAt: existing.expiresAt, isNew: false }
  }

  const active = await getActiveJournalSubscription(userId)
  const base = active && active.expiresAt.getTime() > Date.now() ? active.expiresAt : new Date()
  const expiresAt = new Date(base.getTime() + JOURNAL_SUBSCRIPTION_PERIOD_DAYS * 24 * 60 * 60 * 1000)

  const subscription = await db.journalSubscription.create({
    data: {
      userId,
      provider,
      externalReference: reference,
      amountMinor,
      currency,
      expiresAt,
    },
  })

  return { subscriptionId: subscription.id, expiresAt: subscription.expiresAt, isNew: true }
}

/** Most recent still-active subscription row, or null if the user has never
 * paid or their access has lapsed. */
export async function getActiveJournalSubscription(userId: string) {
  return db.journalSubscription.findFirst({
    where: { userId, expiresAt: { gt: new Date() } },
    orderBy: { expiresAt: 'desc' },
  })
}

export async function hasActiveJournalSubscription(userId: string): Promise<boolean> {
  return (await getActiveJournalSubscription(userId)) !== null
}
