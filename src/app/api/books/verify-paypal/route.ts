import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getPayPalAccessToken, capturePayPalOrder } from '@/lib/api/paypal'
import { books } from '@/lib/data/books'
import { recordBookPurchase, createDownloadGrant, downloadUrlFor } from '@/services/payments/book-purchases'

/**
 * Captures a PayPal order on the buyer's return trip. Unlike Paystack (which
 * confirms via a separate GET to /transaction/verify), PayPal's own capture
 * call IS the confirmation. A successful capture response is PayPal
 * directly telling us the money moved, not something we infer.
 *
 * The account identity is the caller's own session, never PayPal's payer
 * info, same rule as the Paystack path (see /api/books/checkout). The
 * reference_id set at order-creation time must also match this exact
 * session + book, so a signed-in user can't capture an order that was
 * created for someone else or a different book by editing the query string.
 */
export async function GET(request: NextRequest) {
  const clientId = process.env.PAYPAL_CLIENT_ID
  const secret = process.env.PAYPAL_CLIENT_SECRET
  if (!clientId || !secret) {
    return NextResponse.json({ error: 'PayPal verification is unavailable.' }, { status: 503 })
  }

  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId || !session?.user?.email) {
    return NextResponse.json({ error: 'Sign in to complete this purchase.' }, { status: 401 })
  }

  const orderId = request.nextUrl.searchParams.get('token')
  const slug = request.nextUrl.searchParams.get('slug')
  if (!orderId || !slug) {
    return NextResponse.json({ error: 'Missing PayPal order reference.' }, { status: 400 })
  }

  const book = books.find((b) => b.slug === slug)
  if (!book) {
    return NextResponse.json({ error: 'Unknown book.' }, { status: 404 })
  }

  let captured
  try {
    const accessToken = await getPayPalAccessToken(clientId, secret)
    captured = await capturePayPalOrder(orderId, accessToken)
  } catch {
    return NextResponse.json({ error: 'PayPal payment was not completed.' }, { status: 402 })
  }

  if (captured.status !== 'COMPLETED') {
    return NextResponse.json({ error: 'PayPal payment was not completed.' }, { status: 402 })
  }
  if (captured.referenceId !== `book:${slug}:${userId}`) {
    return NextResponse.json({ error: 'This payment does not match this book or account.' }, { status: 403 })
  }

  const result = await recordBookPurchase({
    slug,
    reference: captured.captureId,
    provider: 'paypal',
    amountKobo: Math.round(parseFloat(captured.amountValue) * 100),
    currency: 'USD',
    email: session.user.email,
    name: session.user.name ?? session.user.email,
  })
  if (!result) {
    return NextResponse.json({ error: 'Unknown book.' }, { status: 404 })
  }

  const { rawToken } = await createDownloadGrant(result.purchaseId)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? request.nextUrl.origin
  const downloadUrl = downloadUrlFor(rawToken, siteUrl)

  return NextResponse.json({ downloadUrl, bookTitle: result.book.title })
}
