import { NextRequest, NextResponse } from 'next/server'
import { verifyPaystackSignature, matchOfferByAmount } from '@/lib/api/paystack'
import { db } from '@/lib/db'
import { normalizeEmail } from '@/services/crm/normalization'
import { z } from 'zod'
import {
  slugFromBookOfferName,
  recordBookPurchase,
  createDownloadGrant,
  downloadUrlFor,
} from '@/services/payments/book-purchases'
import { slugFromTeachingOfferName, recordTeachingPurchase } from '@/services/payments/teaching-purchases'
import { sendEmail, bookDownloadEmailHtml } from '@/lib/api/email'

async function handleBookPurchase({
  slug,
  reference,
  amount,
  customer,
  name,
}: {
  slug: string
  reference: string
  amount: number
  customer: { email: string }
  name: string
}) {
  const result = await recordBookPurchase({
    slug,
    reference,
    provider: 'paystack',
    amountKobo: amount,
    currency: 'KES',
    email: customer.email,
    name,
  })
  if (!result) {
    console.error('Paystack webhook: book purchase for unknown slug', { slug, reference })
    return
  }
  if (!result.isNew) return

  const { rawToken, expiresAt } = await createDownloadGrant(result.purchaseId)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
  const downloadUrl = downloadUrlFor(rawToken, siteUrl)

  const emailResult = await sendEmail({
    to: customer.email,
    subject: `Your download: ${result.book.title}`,
    html: bookDownloadEmailHtml({ bookTitle: result.book.title, downloadUrl, expiresAt }),
  })
  if (emailResult.sent) {
    await db.bookPurchase.update({
      where: { id: result.purchaseId },
      data: { emailSentAt: new Date() },
    })
  } else {
    console.warn('Book purchase email not sent (buyer can still use the return-page download link)', {
      reference,
      reason: emailResult.reason,
    })
  }
}

async function handleTeachingPurchase({
  slug,
  reference,
  amount,
  customer,
  name,
  userId,
}: {
  slug: string
  reference: string
  amount: number
  customer: { email: string }
  name: string
  userId?: string
}) {
  if (!userId) {
    console.error('Paystack webhook: teaching purchase missing user_id metadata', { slug, reference })
    return
  }
  const teaching = await db.teaching.findUnique({ where: { slug } })
  if (!teaching) {
    console.error('Paystack webhook: teaching purchase for unknown slug', { slug, reference })
    return
  }
  const result = await recordTeachingPurchase({
    teachingId: teaching.id,
    reference,
    provider: 'paystack',
    amountKobo: amount,
    currency: 'KES',
    userId,
    email: customer.email,
    name,
  })
  if (!result) {
    console.error('Paystack webhook: teaching purchase failed to record', { slug, reference })
  }
}

const paystackEventSchema = z.object({
  event: z.string(),
  data: z.object({
    reference: z.string().trim().min(1).max(100),
    amount: z.number().int().positive(),
    customer: z.object({
      email: z.string().trim().email().max(254),
      first_name: z.string().max(120).optional(),
      last_name: z.string().max(120).optional(),
    }),
    metadata: z
      .object({
        offer_name: z.string().max(200).optional(),
        teaching_id: z.string().max(200).optional(),
        user_id: z.string().max(200).optional(),
      })
      .nullable()
      .optional(),
  }),
})

export async function POST(request: NextRequest) {
  const rawBody = await request.text()
  const signature = request.headers.get('x-paystack-signature')

  if (!verifyPaystackSignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  let decoded: unknown
  try {
    decoded = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Invalid event' }, { status: 400 })
  }
  const parsed = paystackEventSchema.safeParse(decoded)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid event' }, { status: 400 })
  }
  const payload = parsed.data

  if (payload.event !== 'charge.success') {
    return NextResponse.json({ status: 'ignored' })
  }

  const { reference, amount, customer, metadata } = payload.data
  const name = [customer.first_name, customer.last_name].filter(Boolean).join(' ') || customer.email
  const rawOfferName = metadata?.offer_name
  const bookSlug = rawOfferName ? slugFromBookOfferName(rawOfferName) : null

  if (bookSlug) {
    await handleBookPurchase({ slug: bookSlug, reference, amount, customer, name })
    return NextResponse.json({ status: 'ok' })
  }

  const teachingSlug = rawOfferName ? slugFromTeachingOfferName(rawOfferName) : null
  if (teachingSlug) {
    await handleTeachingPurchase({ slug: teachingSlug, reference, amount, customer, name, userId: metadata?.user_id })
    return NextResponse.json({ status: 'ok' })
  }

  const offerName = rawOfferName ?? matchOfferByAmount(amount) ?? 'Payment received (unmatched offer)'

  const normalizedEmail = normalizeEmail(customer.email)!
  const matchingUser = await db.user.findFirst({
    where: { email: { equals: normalizedEmail, mode: 'insensitive' } },
  })

  await db.$transaction(async (tx) => {
    const [existingBooking, existingTransaction] = await Promise.all([
      tx.booking.findUnique({ where: { paystackReference: reference } }),
      tx.crmTransaction.findUnique({ where: { externalReference: reference } }),
    ])
    if (
      (existingBooking && existingBooking.source !== 'paystack_webhook') ||
      (existingTransaction && existingTransaction.provider !== 'paystack')
    ) {
      throw new Error('PAYMENT_REFERENCE_COLLISION')
    }

    let contact = await tx.crmContact.findFirst({ where: { normalizedEmail, deletedAt: null } })
    if (!contact) {
      const parts = name.split(/\s+/)
      contact = await tx.crmContact.create({ data: { firstName: parts[0], lastName: parts.slice(1).join(' ') || null, displayName: name, primaryEmail: customer.email, normalizedEmail, lifecycleStage: offerName === 'Support the Mission' ? 'donor' : 'client', relationshipTypes: offerName === 'Support the Mission' ? ['donor','supporter'] : ['client'], source: 'paystack_webhook' } })
    }
    const isDonation = offerName === 'Support the Mission'
    const booking = await tx.booking.upsert({
      where: { paystackReference: reference }, update: {},
      create: { name, email: customer.email, offerName, status: 'paid', source: 'paystack_webhook', amountKobo: amount, paystackReference: reference, userId: matchingUser?.id, notes: `Automatically recorded from Paystack payment ${reference}.` },
    })
    await tx.crmTransaction.upsert({ where: { externalReference: reference }, update: { status: 'successful', paidAt: new Date(), contactId: contact.id, reconciliationStatus: 'reconciled' }, create: { externalReference: reference, contactId: contact.id, provider: 'paystack', method: 'online_checkout', status: 'successful', reconciliationStatus: 'reconciled', businessLine: isDonation ? 'donations' : 'coaching', grossMinor: amount, netMinor: amount, paidAt: new Date(), metadata: { bookingId: booking.id, offerName } } })
    if (isDonation) {
      const prior = await tx.crmDonation.findFirst({ where: { contactId: contact.id, amountMinor: amount, receivedAt: { gte: new Date(Date.now() - 5 * 60 * 1000) } } })
      if (!prior) await tx.crmDonation.create({ data: { contactId: contact.id, campaign: 'Support the Mission', amountMinor: amount, status: 'received' } })
    }
    if (!existingTransaction) {
      await tx.crmActivity.create({ data: { contactId: contact.id, type: 'payment', direction: 'inbound', subject: `${offerName} payment received`, channel: 'paystack', externalId: reference, metadata: { amount, bookingId: booking.id } } })
      await tx.crmAuditEvent.create({ data: { action: 'webhook', entityType: 'CrmTransaction', entityId: reference, summary: `Recorded Paystack payment ${reference}` } })
    }
  }, { isolationLevel: 'Serializable' })

  return NextResponse.json({ status: 'ok' })
}
