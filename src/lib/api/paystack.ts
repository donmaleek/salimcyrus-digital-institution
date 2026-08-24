import { createHmac, timingSafeEqual } from 'crypto'
import { programs } from '@/lib/data/programs'
import { books } from '@/lib/data/books'

/**
 * Verifies a Paystack webhook request came from Paystack, per their documented
 * scheme: HMAC-SHA512 of the raw request body, keyed with the secret key.
 * https://paystack.com/docs/payments/webhooks/#verifying-events
 */
export function verifyPaystackSignature(rawBody: string, signature: string | null): boolean {
  const secretKey = process.env.PAYSTACK_SECRET_KEY
  if (!secretKey || !signature) return false

  const expected = createHmac('sha512', secretKey).update(rawBody).digest('hex')

  const expectedBuffer = Buffer.from(expected, 'utf8')
  const signatureBuffer = Buffer.from(signature, 'utf8')
  if (expectedBuffer.length !== signatureBuffer.length) return false

  return timingSafeEqual(expectedBuffer, signatureBuffer)
}

/**
 * Paystack payment links carry no reliable custom metadata by default, so we
 * reconcile a successful charge back to a known offer by matching the amount
 * paid (in the smallest currency unit) against published program and book
 * prices — the only offers whose prices are tracked in our own data.
 * Coaching session prices live only on the Paystack checkout page itself
 * (by design, see /book-now), so they can't be matched this way; those
 * bookings are recorded with a generic label instead of a guessed one.
 */
export function matchOfferByAmount(amountSmallestUnit: number): string | null {
  const amountWhole = amountSmallestUnit / 100

  for (const program of programs) {
    if (program.priceKes === amountWhole || program.priceUsd === amountWhole) return program.name
  }
  for (const book of books) {
    if (book.priceKes === amountWhole) return book.title
  }

  return null
}
