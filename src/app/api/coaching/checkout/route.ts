import { NextRequest, NextResponse } from 'next/server'
import { coachingOffers } from '@/lib/data/coaching-offers'
import {
  coachingCheckoutRequestSchema,
  initializePaystackCoachingCheckout,
} from '@/services/payments/paystack'

export async function POST(request: NextRequest) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY
  if (!secretKey) {
    return NextResponse.json(
      { error: 'Paystack checkout is temporarily unavailable. Please use another payment method.' },
      { status: 503 }
    )
  }

  const parsed = coachingCheckoutRequestSchema.safeParse(
    await request.json().catch(() => null)
  )
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Enter a valid email address to continue.' },
      { status: 400 }
    )
  }

  const offer = coachingOffers.find(
    (candidate) => candidate.name === parsed.data.offerName
  )
  if (!offer) {
    return NextResponse.json(
      { error: 'This session is not available for booking.' },
      { status: 404 }
    )
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? request.nextUrl.origin
  const callbackUrl = new URL(
    `/book-now/confirm?offerName=${encodeURIComponent(offer.name)}`,
    siteUrl
  ).toString()

  try {
    const checkout = await initializePaystackCoachingCheckout({
      email: parsed.data.email,
      offerName: offer.name,
      secretKey,
      callbackUrl,
    })
    console.info('Paystack coaching checkout initialized', {
      reference: checkout.reference,
      offerName: offer.name,
    })
    return NextResponse.json(checkout)
  } catch (error) {
    console.error('Paystack coaching checkout failed to initialize', {
      offerName: offer.name,
      error,
    })
    return NextResponse.json(
      { error: 'Paystack could not start checkout. Please try again or use another method.' },
      { status: 502 }
    )
  }
}
