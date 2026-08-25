import { NextRequest, NextResponse } from 'next/server'
import { verifyPaystackSignature, matchOfferByAmount } from '@/lib/api/paystack'
import { db } from '@/lib/db'
import { normalizeEmail } from '@/services/crm/normalization'

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

  await db.$transaction(async (tx) => {
    const email = normalizeEmail(customer.email)!
    let contact = await tx.crmContact.findFirst({ where: { normalizedEmail: email, deletedAt: null } })
    if (!contact) {
      const parts = name.split(/\s+/)
      contact = await tx.crmContact.create({ data: { firstName: parts[0], lastName: parts.slice(1).join(' ') || null, displayName: name, primaryEmail: customer.email, normalizedEmail: email, lifecycleStage: offerName === 'Support the Mission' ? 'donor' : 'client', relationshipTypes: offerName === 'Support the Mission' ? ['donor','supporter'] : ['client'], source: 'paystack_webhook' } })
    }
    const isDonation = offerName === 'Support the Mission'
    const booking = await tx.booking.upsert({
      where: { paystackReference: reference }, update: {},
      create: { name, email: customer.email, offerName, status: 'confirmed', source: 'paystack_webhook', amountKobo: amount, paystackReference: reference, userId: matchingUser?.id, notes: `Automatically recorded from Paystack payment ${reference}.` },
    })
    await tx.crmTransaction.upsert({ where: { externalReference: reference }, update: { status: 'successful', paidAt: new Date(), contactId: contact.id, reconciliationStatus: 'reconciled' }, create: { externalReference: reference, contactId: contact.id, provider: 'paystack', method: 'online_checkout', status: 'successful', reconciliationStatus: 'reconciled', businessLine: isDonation ? 'donations' : 'coaching', grossMinor: amount, netMinor: amount, paidAt: new Date(), metadata: { bookingId: booking.id, offerName } } })
    if (isDonation) {
      const prior = await tx.crmDonation.findFirst({ where: { contactId: contact.id, amountMinor: amount, receivedAt: { gte: new Date(Date.now() - 5 * 60 * 1000) } } })
      if (!prior) await tx.crmDonation.create({ data: { contactId: contact.id, campaign: 'Support the Mission', amountMinor: amount, status: 'received' } })
    }
    await tx.crmActivity.create({ data: { contactId: contact.id, type: 'payment', direction: 'inbound', subject: `${offerName} payment received`, channel: 'paystack', externalId: reference, metadata: { amount, bookingId: booking.id } } })
    await tx.crmAuditEvent.create({ data: { action: 'webhook', entityType: 'CrmTransaction', entityId: reference, summary: `Recorded Paystack payment ${reference}` } })
  })

  return NextResponse.json({ status: 'ok' })
}
