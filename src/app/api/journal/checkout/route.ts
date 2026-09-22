import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { initializePaystackJournalCheckout } from '@/services/payments/paystack'

export async function POST(request: NextRequest) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY
  if (!secretKey) {
    return NextResponse.json(
      { error: 'Paystack checkout is temporarily unavailable. Please use another payment method.' },
      { status: 503 }
    )
  }

  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId || !session?.user?.email) {
    return NextResponse.json({ error: 'Sign in to subscribe to the Journal.' }, { status: 401 })
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? request.nextUrl.origin
  const callbackUrl = new URL('/journal', siteUrl).toString()

  try {
    const checkout = await initializePaystackJournalCheckout({
      email: session.user.email,
      userId,
      secretKey,
      callbackUrl,
    })
    console.info('Paystack journal checkout initialized', { reference: checkout.reference, userId })
    return NextResponse.json(checkout)
  } catch (error) {
    console.error('Paystack journal checkout failed to initialize', { userId, error })
    return NextResponse.json(
      { error: 'Paystack could not start checkout. Please try again or use another method.' },
      { status: 502 }
    )
  }
}
