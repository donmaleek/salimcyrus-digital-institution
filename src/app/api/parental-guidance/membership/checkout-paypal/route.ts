import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getPayPalAccessToken, createPayPalOrder } from '@/lib/api/paypal'
import { PARENT_MEMBERSHIP_PRICE_USD } from '@/services/payments/parent-membership'

export async function POST(request: NextRequest) {
  const clientId = process.env.PAYPAL_CLIENT_ID
  const secret = process.env.PAYPAL_CLIENT_SECRET
  if (!clientId || !secret) {
    return NextResponse.json(
      { error: 'PayPal checkout is temporarily unavailable. Please use another payment method.' },
      { status: 503 }
    )
  }

  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId || !session?.user?.email) {
    return NextResponse.json({ error: 'Sign in to join Parent Membership.' }, { status: 401 })
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? request.nextUrl.origin
  const returnUrl = new URL('/parental-guidance/membership', siteUrl).toString()

  try {
    const accessToken = await getPayPalAccessToken(clientId, secret)
    const order = await createPayPalOrder({
      amountUsd: PARENT_MEMBERSHIP_PRICE_USD,
      description: 'Parent Membership (1 month), by Salim Cyrus',
      referenceId: `parent-membership:${userId}`,
      returnUrl,
      cancelUrl: returnUrl,
      accessToken,
    })
    console.info('PayPal parent membership checkout initialized', { orderId: order.id, userId })
    return NextResponse.json({ approvalUrl: order.approveUrl })
  } catch (error) {
    console.error('PayPal parent membership checkout failed to initialize', { userId, error })
    return NextResponse.json(
      { error: 'PayPal could not start checkout. Please try again or use another method.' },
      { status: 502 }
    )
  }
}
