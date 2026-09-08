import { NextRequest, NextResponse } from 'next/server'
import { verifyPaystackTransaction } from '@/lib/api/paystack'
import { books } from '@/lib/data/books'
import {
  bookOfferName,
  recordBookPurchase,
  createDownloadGrant,
  downloadUrlFor,
} from '@/services/payments/book-purchases'

/**
 * Confirms a book purchase on the buyer's return trip from Paystack and
 * hands back a fresh, working download link — independent of whether the
 * webhook has landed yet. Never trusts the query string alone: the
 * reference is re-verified directly against Paystack, server-to-server.
 */
export async function GET(request: NextRequest) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY
  if (!secretKey) {
    return NextResponse.json({ error: 'Payment verification is unavailable.' }, { status: 503 })
  }

  const reference = request.nextUrl.searchParams.get('reference')
  const slug = request.nextUrl.searchParams.get('slug')
  if (!reference || !slug) {
    return NextResponse.json({ error: 'Missing payment reference.' }, { status: 400 })
  }

  const book = books.find((b) => b.slug === slug)
  if (!book) {
    return NextResponse.json({ error: 'Unknown book.' }, { status: 404 })
  }

  const verification = await verifyPaystackTransaction(reference, secretKey)
  const data = verification.data
  if (!verification.status || !data || data.status !== 'success') {
    return NextResponse.json({ error: 'Payment was not completed.' }, { status: 402 })
  }

  // Cross-check the verified payment actually matches THIS book, not just
  // any successful reference the caller happened to pass in.
  if (data.metadata?.offer_name !== bookOfferName(slug)) {
    return NextResponse.json({ error: 'This payment does not match this book.' }, { status: 403 })
  }

  const result = await recordBookPurchase({
    slug,
    reference,
    provider: 'paystack',
    amountKobo: data.amount,
    currency: 'KES',
    email: data.customer.email,
    name: data.customer.email,
  })
  if (!result) {
    return NextResponse.json({ error: 'Unknown book.' }, { status: 404 })
  }

  const { rawToken } = await createDownloadGrant(result.purchaseId)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? request.nextUrl.origin
  const downloadUrl = downloadUrlFor(rawToken, siteUrl)

  return NextResponse.json({ downloadUrl, bookTitle: result.book.title })
}
