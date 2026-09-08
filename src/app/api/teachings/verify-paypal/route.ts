import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getPayPalAccessToken, capturePayPalOrder } from '@/lib/api/paypal'
import { db } from '@/lib/db'
import { recordTeachingPurchase } from '@/services/payments/teaching-purchases'

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
  const teachingId = request.nextUrl.searchParams.get('teachingId')
  if (!orderId || !teachingId) {
    return NextResponse.json({ error: 'Missing PayPal order reference.' }, { status: 400 })
  }

  const teaching = await db.teaching.findUnique({ where: { id: teachingId } })
  if (!teaching) {
    return NextResponse.json({ error: 'Unknown teaching.' }, { status: 404 })
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
  if (captured.referenceId !== `teaching:${teachingId}:${userId}`) {
    return NextResponse.json({ error: 'This payment does not match this teaching or account.' }, { status: 403 })
  }

  const result = await recordTeachingPurchase({
    teachingId: teaching.id,
    reference: captured.captureId,
    provider: 'paypal',
    amountKobo: Math.round(parseFloat(captured.amountValue) * 100),
    currency: 'USD',
    userId,
    email: session.user.email,
    name: session.user.name ?? session.user.email,
  })
  if (!result) {
    return NextResponse.json({ error: 'Unknown teaching.' }, { status: 404 })
  }

  return NextResponse.json({ status: 'confirmed', teachingTitle: teaching.title })
}
