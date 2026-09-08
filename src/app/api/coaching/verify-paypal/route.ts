import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getPayPalAccessToken, capturePayPalOrder } from '@/lib/api/paypal'
import { coachingOffers } from '@/lib/data/coaching-offers'
import { recordCoachingPayment } from '@/services/payments/coaching-bookings'

function slugFor(offerName: string): string {
  return offerName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
}

/**
 * Coaching bookings are not account-gated (matching donations, not
 * books/teachings), so there is no session identity to defer to. PayPal's
 * own reported payer identity is the trust boundary here, same reasoning
 * as the donation capture path.
 */
export async function GET(request: NextRequest) {
  const clientId = process.env.PAYPAL_CLIENT_ID
  const secret = process.env.PAYPAL_CLIENT_SECRET
  if (!clientId || !secret) {
    return NextResponse.json({ error: 'PayPal verification is unavailable.' }, { status: 503 })
  }

  const orderId = request.nextUrl.searchParams.get('token')
  const offerName = request.nextUrl.searchParams.get('offerName')
  if (!orderId || !offerName) {
    return NextResponse.json({ error: 'Missing PayPal order reference.' }, { status: 400 })
  }

  const offer = coachingOffers.find((o) => o.name === offerName)
  if (!offer) {
    return NextResponse.json({ error: 'Unknown session.' }, { status: 404 })
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
  if (captured.referenceId !== `coaching:${slugFor(offer.name)}`) {
    return NextResponse.json({ error: 'This payment does not match this session.' }, { status: 403 })
  }
  if (!captured.payerEmail) {
    return NextResponse.json({ error: 'PayPal did not provide a payer email.' }, { status: 502 })
  }

  const session = await getServerSession(authOptions)
  const sessionUserId = (session?.user as { id?: string } | undefined)?.id

  await recordCoachingPayment({
    offerName: offer.name,
    reference: captured.captureId,
    provider: 'paypal',
    amountMinor: Math.round(parseFloat(captured.amountValue) * 100),
    currency: 'USD',
    email: captured.payerEmail,
    name: captured.payerName || captured.payerEmail,
    userId: sessionUserId,
  })

  return NextResponse.json({
    status: 'confirmed',
    offerName: offer.name,
    email: captured.payerEmail,
    name: captured.payerName || captured.payerEmail,
    paymentReference: captured.captureId,
  })
}
