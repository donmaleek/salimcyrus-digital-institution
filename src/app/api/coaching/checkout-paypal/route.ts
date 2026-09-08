import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getPayPalAccessToken, createPayPalOrder } from '@/lib/api/paypal'
import { coachingOffers } from '@/lib/data/coaching-offers'

const requestSchema = z.object({
  offerName: z.string().trim().min(1).max(200),
})

function slugFor(offerName: string): string {
  return offerName.toLowerCase().replace(/[^a-z0-9]+/g, '-')
}

export async function POST(request: NextRequest) {
  const clientId = process.env.PAYPAL_CLIENT_ID
  const secret = process.env.PAYPAL_CLIENT_SECRET
  if (!clientId || !secret) {
    return NextResponse.json(
      { error: 'PayPal checkout is temporarily unavailable. Please use another payment method.' },
      { status: 503 }
    )
  }

  const parsed = requestSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const offer = coachingOffers.find((o) => o.name === parsed.data.offerName)
  if (!offer) {
    return NextResponse.json({ error: 'This session is not available for booking.' }, { status: 404 })
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? request.nextUrl.origin
  const returnUrl = new URL(
    `/book-now/confirm?offerName=${encodeURIComponent(offer.name)}`,
    siteUrl
  ).toString()

  try {
    const accessToken = await getPayPalAccessToken(clientId, secret)
    const order = await createPayPalOrder({
      amountUsd: offer.priceUsd,
      description: `${offer.name}, coaching with Salim Cyrus`,
      referenceId: `coaching:${slugFor(offer.name)}`,
      returnUrl,
      cancelUrl: returnUrl,
      accessToken,
    })
    console.info('PayPal coaching checkout initialized', { orderId: order.id, offerName: offer.name })
    return NextResponse.json({ approvalUrl: order.approveUrl })
  } catch (error) {
    console.error('PayPal coaching checkout failed to initialize', { offerName: offer.name, error })
    return NextResponse.json(
      { error: 'PayPal could not start checkout. Please try again or use another method.' },
      { status: 502 }
    )
  }
}
