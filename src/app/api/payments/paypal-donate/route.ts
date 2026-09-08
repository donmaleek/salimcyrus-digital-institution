import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getPayPalAccessToken, createPayPalOrder } from '@/lib/api/paypal'

const requestSchema = z.object({
  amountUsd: z.coerce.number().min(1).max(100_000),
})

export async function POST(request: NextRequest) {
  const clientId = process.env.PAYPAL_CLIENT_ID
  const secret = process.env.PAYPAL_CLIENT_SECRET
  if (!clientId || !secret) {
    return NextResponse.json(
      { error: 'PayPal is temporarily unavailable. Please use Paystack or M-Pesa.' },
      { status: 503 }
    )
  }

  const parsed = requestSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Enter an amount of at least $1.' }, { status: 400 })
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? request.nextUrl.origin
  const returnUrl = new URL('/support-the-mission?payment=returned', siteUrl).toString()

  try {
    const accessToken = await getPayPalAccessToken(clientId, secret)
    const order = await createPayPalOrder({
      amountUsd: parsed.data.amountUsd,
      description: 'Support the Mission, Halisi Hub Connect',
      referenceId: 'donation:support-the-mission',
      returnUrl,
      cancelUrl: returnUrl,
      accessToken,
    })
    console.info('PayPal donation checkout initialized', { orderId: order.id })
    return NextResponse.json({ approvalUrl: order.approveUrl })
  } catch (error) {
    console.error('PayPal donation checkout failed to initialize', error)
    return NextResponse.json(
      { error: 'PayPal could not start checkout. Please try again or use another method.' },
      { status: 502 }
    )
  }
}
