import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { getPayPalAccessToken, createPayPalOrder } from '@/lib/api/paypal'

const requestSchema = z.object({
  teachingId: z.string().trim().min(1).max(200),
})

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
    return NextResponse.json({ error: 'Sign in to buy this teaching.' }, { status: 401 })
  }

  const parsed = requestSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const teaching = await db.teaching.findUnique({ where: { id: parsed.data.teachingId } })
  if (!teaching || teaching.status !== 'published') {
    return NextResponse.json({ error: 'This teaching is not available for purchase.' }, { status: 404 })
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? request.nextUrl.origin
  const returnUrl = new URL(`/teachings/${teaching.slug}`, siteUrl).toString()

  try {
    const accessToken = await getPayPalAccessToken(clientId, secret)
    const order = await createPayPalOrder({
      amountUsd: teaching.priceUsd,
      description: `${teaching.title}, by Salim Cyrus`,
      referenceId: `teaching:${teaching.id}:${userId}`,
      returnUrl,
      cancelUrl: returnUrl,
      accessToken,
    })
    console.info('PayPal teaching checkout initialized', { orderId: order.id, teachingId: teaching.id })
    return NextResponse.json({ approvalUrl: order.approveUrl })
  } catch (error) {
    console.error('PayPal teaching checkout failed to initialize', { teachingId: teaching.id, error })
    return NextResponse.json(
      { error: 'PayPal could not start checkout. Please try again or use another method.' },
      { status: 502 }
    )
  }
}
