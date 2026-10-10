import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { verifyPaystackTransaction } from '@/lib/api/paystack'
import { parentMembershipOfferName } from '@/services/payments/paystack'
import {
  PARENT_MEMBERSHIP_PRICE_KES,
  recordParentMembership,
} from '@/services/payments/parent-membership'

export async function GET(request: NextRequest) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY
  if (!secretKey) {
    return NextResponse.json({ error: 'Payment verification is unavailable.' }, { status: 503 })
  }

  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) {
    return NextResponse.json({ error: 'Sign in to complete this membership.' }, { status: 401 })
  }

  const reference = request.nextUrl.searchParams.get('reference')
  if (!reference) {
    return NextResponse.json({ error: 'Missing Paystack payment reference.' }, { status: 400 })
  }

  const verification = await verifyPaystackTransaction(reference, secretKey)
  const data = verification.data
  if (!verification.status || !data || data.status !== 'success') {
    return NextResponse.json({ error: 'Paystack payment was not completed.' }, { status: 402 })
  }
  if (data.metadata?.offer_name !== parentMembershipOfferName(userId) || data.metadata?.user_id !== userId) {
    return NextResponse.json({ error: 'This payment does not match this account.' }, { status: 403 })
  }
  if (data.amount !== PARENT_MEMBERSHIP_PRICE_KES * 100) {
    return NextResponse.json(
      { error: 'The payment amount does not match a Parent Membership.' },
      { status: 403 }
    )
  }

  const { expiresAt } = await recordParentMembership({
    userId,
    reference: data.reference,
    provider: 'paystack',
    amountMinor: data.amount,
    currency: 'KES',
  })
  console.info('Parent membership granted', { userId, provider: 'paystack', expiresAt })
  return NextResponse.json({ status: 'confirmed', expiresAt })
}
