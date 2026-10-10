import { db } from '@/lib/db'

export const PARENT_MEMBERSHIP_PRICE_KES = 1500
/** Same fixed ~129.4 KES/USD rate used for books, teachings, courses, and
 * the Journal; see src/lib/data/books.ts for the rationale. */
export const PARENT_MEMBERSHIP_PRICE_USD = 12
export const PARENT_MEMBERSHIP_PERIOD_DAYS = 30
export const PARENT_MEMBERSHIP_COURSE_CATEGORY = 'Parental Guidance'

export interface RecordParentMembershipInput {
  userId: string
  reference: string
  provider: 'paystack' | 'paypal' | 'paybill'
  amountMinor: number
  currency: 'KES' | 'USD'
}

/**
 * Idempotently records one paid month of Parent Membership access (by
 * [provider, externalReference], same replay-safety as every other payment
 * type). Structured identically to recordJournalSubscription: no recurring
 * billing exists in this codebase, so each payment appends its own
 * 30-day-wide row rather than upserting a single mutable record, and access
 * is "does the user have any row still in the future" (see
 * getActiveParentMembership). A renewal made while still active stacks onto
 * the current expiry rather than today, so paying early or an admin taking
 * time to approve a Paybill claim never costs the member time they already
 * paid for.
 */
export async function recordParentMembership({
  userId,
  reference,
  provider,
  amountMinor,
  currency,
}: RecordParentMembershipInput): Promise<{ membershipId: string; expiresAt: Date; isNew: boolean }> {
  const existing = await db.parentMembership.findUnique({
    where: { provider_externalReference: { provider, externalReference: reference } },
  })
  if (existing) {
    return { membershipId: existing.id, expiresAt: existing.expiresAt, isNew: false }
  }

  const active = await getActiveParentMembership(userId)
  const base = active && active.expiresAt.getTime() > Date.now() ? active.expiresAt : new Date()
  const expiresAt = new Date(base.getTime() + PARENT_MEMBERSHIP_PERIOD_DAYS * 24 * 60 * 60 * 1000)

  const membership = await db.parentMembership.create({
    data: {
      userId,
      provider,
      externalReference: reference,
      amountMinor,
      currency,
      expiresAt,
    },
  })

  return { membershipId: membership.id, expiresAt: membership.expiresAt, isNew: true }
}

/** Most recent still-active membership row, or null if the user has never
 * paid or their access has lapsed. */
export async function getActiveParentMembership(userId: string) {
  return db.parentMembership.findFirst({
    where: { userId, expiresAt: { gt: new Date() } },
    orderBy: { expiresAt: 'desc' },
  })
}

export async function hasActiveParentMembership(userId: string): Promise<boolean> {
  return (await getActiveParentMembership(userId)) !== null
}
