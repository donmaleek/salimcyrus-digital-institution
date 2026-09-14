import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getPayPalAccessToken, capturePayPalOrder } from '@/lib/api/paypal'
import { recordJournalSubscription, JOURNAL_SUBSCRIPTION_PRICE_USD } from '@/services/payments/journal-subscriptions'

export async function GET(request: NextRequest) {
  const clientId = process.env.PAYPAL_CLIENT_ID
  const secret = process.env.PAYPAL_CLIENT_SECRET
  if (!clientId || !secret) {
    return NextResponse.json({ error: 'PayPal verification is unavailable.' }, { status: 503 })
  }

  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) {
    return NextResponse.json({ error: 'Sign in to complete this subscription.' }, { status: 401 })
  }

  const orderId = request.nextUrl.searchParams.get('token')
  if (!orderId) {
    return NextResponse.json({ error: 'Missing PayPal order reference.' }, { status: 400 })
  }

  try {
    const captured = await capturePayPalOrder(orderId, await getPayPalAccessToken(clientId, secret))
    if (captured.status !== 'COMPLETED') {
      return NextResponse.json({ error: 'PayPal payment was not completed.' }, { status: 402 })
    }
    if (captured.referenceId !== `journal:${userId}`) {
      return NextResponse.json({ error: 'This payment does not match this account.' }, { status: 403 })
    }
    if (
      captured.currencyCode !== 'USD' ||
      Math.round(parseFloat(captured.amountValue) * 100) !== JOURNAL_SUBSCRIPTION_PRICE_USD * 100
    ) {
      return NextResponse.json({ error: 'The payment amount does not match a Journal subscription.' }, { status: 403 })
    }

    const { expiresAt } = await recordJournalSubscription({
      userId,
      reference: captured.captureId,
      provider: 'paypal',
      amountMinor: Math.round(parseFloat(captured.amountValue) * 100),
      currency: 'USD',
    })

    console.info('Journal subscription granted', { userId, provider: 'paypal', expiresAt })
    return NextResponse.json({ status: 'confirmed', expiresAt })
  } catch {
    return NextResponse.json({ error: 'PayPal payment was not completed.' }, { status: 402 })
  }
}
