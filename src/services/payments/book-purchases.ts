import { db } from '@/lib/db'
import { books, type BookEntry } from '@/lib/data/books'
import { normalizeEmail } from '@/services/crm/normalization'
import {
  generateDownloadToken,
  tokenExpiryDate,
  MAX_DOWNLOADS_PER_PURCHASE,
} from '@/lib/api/book-download-tokens'

export const BOOK_OFFER_PREFIX = 'book:'

export function bookOfferName(slug: string): string {
  return `${BOOK_OFFER_PREFIX}${slug}`
}

export function slugFromBookOfferName(offerName: string): string | null {
  return offerName.startsWith(BOOK_OFFER_PREFIX)
    ? offerName.slice(BOOK_OFFER_PREFIX.length)
    : null
}

export type PaymentProvider = 'paystack' | 'paypal'

export interface RecordBookPurchaseInput {
  slug: string
  reference: string
  provider: PaymentProvider
  amountKobo: number
  /** Currency of amountKobo. Paystack charges are KES; PayPal charges are
   * USD (PayPal doesn't support KES — see src/lib/api/paypal.ts). */
  currency: 'KES' | 'USD'
  email: string
  name: string
}

/**
 * Idempotently records a paid book purchase (by unique [provider,
 * externalReference]) and its CRM trail. Safe to call from both the webhook
 * (fast path) and the buyer's return-to-site page (fallback path, in case
 * the webhook hasn't landed yet) — whichever runs first wins, the other is
 * a no-op.
 */
export async function recordBookPurchase({
  slug,
  reference,
  provider,
  amountKobo,
  currency,
  email,
  name,
}: RecordBookPurchaseInput): Promise<{ purchaseId: string; book: BookEntry; isNew: boolean } | null> {
  const book = books.find((b) => b.slug === slug)
  if (!book) return null

  const normalizedEmail = normalizeEmail(email)!
  const matchingUser = await db.user.findFirst({
    where: { email: { equals: normalizedEmail, mode: 'insensitive' } },
  })

  const result = await db.$transaction(async (tx) => {
    const existing = await tx.bookPurchase.findUnique({
      where: { provider_externalReference: { provider, externalReference: reference } },
    })
    if (existing) return { purchaseId: existing.id, isNew: false }

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
          lifecycleStage: 'client',
          relationshipTypes: ['client', 'reader'],
          source: `${provider}_checkout`,
        },
      })
    }

    const purchase = await tx.bookPurchase.create({
      data: {
        bookSlug: slug,
        email,
        name,
        userId: matchingUser?.id,
        externalReference: reference,
        provider,
        amountKobo,
        currency,
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
        businessLine: 'books',
        grossMinor: amountKobo,
        netMinor: amountKobo,
        currency,
        paidAt: new Date(),
        metadata: { bookSlug: slug, bookTitle: book.title, purchaseId: purchase.id },
      },
    })
    await tx.crmActivity.create({
      data: {
        contactId: contact.id,
        type: 'payment',
        direction: 'inbound',
        subject: `Book purchase: ${book.title}`,
        channel: provider,
        externalId: reference,
        metadata: { amount: amountKobo, bookSlug: slug },
      },
    })
    await tx.crmAuditEvent.create({
      data: {
        action: 'webhook',
        entityType: 'BookPurchase',
        entityId: purchase.id,
        summary: `Recorded book purchase "${book.title}" (${reference})`,
      },
    })

    return { purchaseId: purchase.id, isNew: true }
  }, { isolationLevel: 'Serializable' })

  return { ...result, book }
}

export async function createDownloadGrant(
  purchaseId: string
): Promise<{ rawToken: string; expiresAt: Date }> {
  const { rawToken, tokenHash } = generateDownloadToken()
  const expiresAt = tokenExpiryDate()
  await db.bookDownloadGrant.create({
    data: {
      purchaseId,
      tokenHash,
      expiresAt,
      maxDownloads: MAX_DOWNLOADS_PER_PURCHASE,
    },
  })
  return { rawToken, expiresAt }
}

export function downloadUrlFor(rawToken: string, siteUrl: string): string {
  return new URL(`/api/books/download/${rawToken}`, siteUrl).toString()
}
