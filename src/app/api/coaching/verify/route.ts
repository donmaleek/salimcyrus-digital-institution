import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { verifyPaystackTransaction } from '@/lib/api/paystack'
import { coachingOffers } from '@/lib/data/coaching-offers'
import { recordCoachingPayment } from '@/services/payments/coaching-bookings'

export async function GET(request: NextRequest) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY
  if (!secretKey) {
    return NextResponse.json({ error: 'Paystack verification is unavailable.' }, { status: 503 })
  }

  const reference = request.nextUrl.searchParams.get('reference')
  const offerName = request.nextUrl.searchParams.get('offerName')
  if (!reference || !offerName) {
    return NextResponse.json({ error: 'Missing Paystack payment reference.' }, { status: 400 })
  }

  const offer = coachingOffers.find((candidate) => candidate.name === offerName)
  if (!offer) return NextResponse.json({ error: 'Unknown session.' }, { status: 404 })

  const verification = await verifyPaystackTransaction(reference, secretKey)
  const data = verification.data
  if (!verification.status || !data || data.status !== 'success') {
    return NextResponse.json({ error: 'Paystack payment was not completed.' }, { status: 402 })
  }
  if (data.metadata?.offer_name !== offer.name || data.amount !== offer.priceKes * 100) {
    return NextResponse.json({ error: 'This payment does not match this session.' }, { status: 403 })
  }

  const session = await getServerSession(authOptions)
  const sessionUserId = (session?.user as { id?: string } | undefined)?.id
  const email = data.customer.email
  await recordCoachingPayment({
    offerName: offer.name,
    reference: data.reference,
    provider: 'paystack',
    amountMinor: data.amount,
    currency: 'KES',
    email,
    name: email,
    userId: sessionUserId,
  })

  return NextResponse.json({
    status: 'confirmed',
    offerName: offer.name,
    email,
    name: email,
    paymentReference: data.reference,
  })
}
