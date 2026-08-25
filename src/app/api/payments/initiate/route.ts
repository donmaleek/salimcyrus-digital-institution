import { NextRequest, NextResponse } from 'next/server'
import {
  donationRequestSchema,
  initializePaystackDonation,
} from '@/services/payments/paystack'

export async function POST(request: NextRequest) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY
  if (!secretKey) {
    return NextResponse.json(
      {
        error:
          'Online checkout is temporarily unavailable. Please use M-Pesa or PayPal.',
      },
      { status: 503 }
    )
  }

  const parsed = donationRequestSchema.safeParse(
    await request.json().catch(() => null)
  )
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Enter a valid email and an amount of at least KES 100.' },
      { status: 400 }
    )
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? request.nextUrl.origin
  const callbackUrl = new URL(
    '/support-the-mission?payment=returned',
    siteUrl
  ).toString()

  try {
    const checkout = await initializePaystackDonation({
      ...parsed.data,
      secretKey,
      callbackUrl,
    })
    console.info('Paystack mission-support checkout initialized', {
      reference: checkout.reference,
      amountKes: parsed.data.amountKes,
    })
    return NextResponse.json(checkout)
  } catch {
    return NextResponse.json(
      {
        error:
          'Paystack could not start checkout. Please try again or use another method.',
      },
      { status: 502 }
    )
  }
}
