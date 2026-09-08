import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { teachingCheckoutRequestSchema, initializePaystackTeachingCheckout } from '@/services/payments/paystack'

export async function POST(request: NextRequest) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY
  if (!secretKey) {
    return NextResponse.json(
      { error: 'Online checkout is temporarily unavailable. Please try again later.' },
      { status: 503 }
    )
  }

  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId || !session?.user?.email) {
    return NextResponse.json({ error: 'Sign in to buy this teaching.' }, { status: 401 })
  }

  const parsed = teachingCheckoutRequestSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const teaching = await db.teaching.findUnique({ where: { id: parsed.data.teachingId } })
  if (!teaching || teaching.status !== 'published') {
    return NextResponse.json({ error: 'This teaching is not available for purchase.' }, { status: 404 })
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? request.nextUrl.origin
  const callbackUrl = new URL(`/teachings/${teaching.slug}`, siteUrl).toString()

  try {
    const checkout = await initializePaystackTeachingCheckout({
      email: session.user.email,
      teachingId: teaching.id,
      userId,
      slug: teaching.slug,
      title: teaching.title,
      priceKes: teaching.priceKes,
      secretKey,
      callbackUrl,
    })
    console.info('Paystack teaching checkout initialized', {
      reference: checkout.reference,
      teachingId: teaching.id,
    })
    return NextResponse.json(checkout)
  } catch {
    return NextResponse.json(
      { error: 'Paystack could not start checkout. Please try again.' },
      { status: 502 }
    )
  }
}
