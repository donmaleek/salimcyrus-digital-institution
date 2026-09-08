import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { verifyPaystackTransaction } from '@/lib/api/paystack'
import { db } from '@/lib/db'
import { teachingOfferName, recordTeachingPurchase } from '@/services/payments/teaching-purchases'

export async function GET(request: NextRequest) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY
  if (!secretKey) {
    return NextResponse.json({ error: 'Payment verification is unavailable.' }, { status: 503 })
  }

  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId || !session?.user?.email) {
    return NextResponse.json({ error: 'Sign in to complete this purchase.' }, { status: 401 })
  }

  const reference = request.nextUrl.searchParams.get('reference')
  const teachingId = request.nextUrl.searchParams.get('teachingId')
  if (!reference || !teachingId) {
    return NextResponse.json({ error: 'Missing payment reference.' }, { status: 400 })
  }

  const teaching = await db.teaching.findUnique({ where: { id: teachingId } })
  if (!teaching) {
    return NextResponse.json({ error: 'Unknown teaching.' }, { status: 404 })
  }

  const verification = await verifyPaystackTransaction(reference, secretKey)
  const data = verification.data
  if (!verification.status || !data || data.status !== 'success') {
    return NextResponse.json({ error: 'Payment was not completed.' }, { status: 402 })
  }
  if (data.metadata?.offer_name !== teachingOfferName(teaching.slug)) {
    return NextResponse.json({ error: 'This payment does not match this teaching.' }, { status: 403 })
  }
  if (data.metadata?.user_id !== userId) {
    return NextResponse.json({ error: 'This payment does not match this account.' }, { status: 403 })
  }

  const result = await recordTeachingPurchase({
    teachingId: teaching.id,
    reference,
    provider: 'paystack',
    amountKobo: data.amount,
    currency: 'KES',
    userId,
    email: session.user.email,
    name: session.user.name ?? session.user.email,
  })
  if (!result) {
    return NextResponse.json({ error: 'Unknown teaching.' }, { status: 404 })
  }

  return NextResponse.json({ status: 'confirmed', teachingTitle: teaching.title })
}
