import { NextRequest, NextResponse } from 'next/server'
import { getPayPalAccessToken, capturePayPalOrder } from '@/lib/api/paypal'
import { recordDonation } from '@/services/payments/donations'

/**
 * Donations aren't gated behind an account, so (unlike the book capture
 * path) there's no session to be the authoritative identity. PayPal's own
 * payer info IS the identity here, same trust boundary as the Paystack
 * donation webhook already uses for Paystack's reported customer email.
 */
export async function GET(request: NextRequest) {
  const clientId = process.env.PAYPAL_CLIENT_ID
  const secret = process.env.PAYPAL_CLIENT_SECRET
  if (!clientId || !secret) {
    return NextResponse.json({ error: 'PayPal verification is unavailable.' }, { status: 503 })
  }

  const orderId = request.nextUrl.searchParams.get('token')
  if (!orderId) {
    return NextResponse.json({ error: 'Missing PayPal order reference.' }, { status: 400 })
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
  if (captured.referenceId !== 'donation:support-the-mission') {
    return NextResponse.json({ error: 'This payment does not match a donation.' }, { status: 403 })
  }
  if (!captured.payerEmail) {
    return NextResponse.json({ error: 'PayPal did not share a payer email.' }, { status: 502 })
  }

  const { isNew } = await recordDonation({
    reference: captured.captureId,
    provider: 'paypal',
    amountMinor: Math.round(parseFloat(captured.amountValue) * 100),
    currency: 'USD',
    email: captured.payerEmail,
    name: captured.payerName || captured.payerEmail,
  })

  return NextResponse.json({ status: 'confirmed', isNew })
}
