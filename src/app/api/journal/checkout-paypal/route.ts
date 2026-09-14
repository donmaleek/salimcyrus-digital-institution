import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getPayPalAccessToken, createPayPalOrder } from '@/lib/api/paypal'
import { JOURNAL_SUBSCRIPTION_PRICE_USD } from '@/services/payments/journal-subscriptions'

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
    return NextResponse.json({ error: 'Sign in to subscribe to the Journal.' }, { status: 401 })
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? request.nextUrl.origin
  const returnUrl = new URL('/journal', siteUrl).toString()

  try {
    const accessToken = await getPayPalAccessToken(clientId, secret)
    const order = await createPayPalOrder({
      amountUsd: JOURNAL_SUBSCRIPTION_PRICE_USD,
      description: 'Journal Membership (1 month), by Salim Cyrus',
      referenceId: `journal:${userId}`,
      returnUrl,
      cancelUrl: returnUrl,
      accessToken,
    })
    console.info('PayPal journal checkout initialized', { orderId: order.id, userId })
    return NextResponse.json({ approvalUrl: order.approveUrl })
  } catch (error) {
    console.error('PayPal journal checkout failed to initialize', { userId, error })
    return NextResponse.json(
      { error: 'PayPal could not start checkout. Please try again or use another method.' },
      { status: 502 }
    )
  }
}
