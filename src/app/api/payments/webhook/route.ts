import { NextRequest, NextResponse } from 'next/server'
import { verifyPaystackSignature, matchOfferByAmount } from '@/lib/api/paystack'
import { db } from '@/lib/db'

interface PaystackChargeSuccessEvent {
  event: string
  data: {
    reference: string
    amount: number
    customer: { email: string; first_name?: string; last_name?: string }
    metadata?: { offer_name?: string } | null
  }
}

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const signature = request.headers.get('x-paystack-signature')

  if (!verifyPaystackSignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const payload = JSON.parse(rawBody) as PaystackChargeSuccessEvent

  if (payload.event !== 'charge.success') {
    return NextResponse.json({ status: 'ignored' })
  }

  const { reference, amount, customer, metadata } = payload.data
  const name = [customer.first_name, customer.last_name].filter(Boolean).join(' ') || customer.email
  const offerName = metadata?.offer_name ?? matchOfferByAmount(amount) ?? 'Payment received (unmatched offer)'

  const matchingUser = await db.user.findUnique({ where: { email: customer.email } })

  await db.booking.upsert({
    where: { paystackReference: reference },
    update: {},
    create: {
      name,
      email: customer.email,
      offerName,
      status: 'confirmed',
      source: 'paystack_webhook',
      amountKobo: amount,
      paystackReference: reference,
      userId: matchingUser?.id,
      notes: `Automatically recorded from Paystack payment ${reference}.`,
    },
  })

  return NextResponse.json({ status: 'ok' })
}
