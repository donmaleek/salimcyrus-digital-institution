import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { contactDisplayName, normalizeEmail, normalizePhone } from '@/services/crm/normalization'
import { coachingCategories } from '@/lib/data/coaching-offers'

/**
 * Lead capture for the coaching tiers with no fixed price (international
 * individual/couples coaching, groups of 200-1,000, and VIP Summit
 * speaking): too situational to quote without a conversation, so this
 * records the request instead of taking a payment. Mirrors /api/contact's
 * CrmContact -> CrmActivity -> CrmTask shape exactly, just scoped to
 * coaching and always high priority, since every tier that reaches this
 * route is inherently a large, time-sensitive booking.
 */
const requestQuoteSchema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().email(),
  whatsapp: z.string().max(40).optional(),
  category: z.enum(['individual', 'couples', 'group', 'vip-summit']),
  tierLabel: z.string().trim().min(2).max(200),
  message: z.string().trim().min(20).max(1500),
})

export async function POST(request: Request) {
  const parsed = requestQuoteSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Check your name, email and message.' }, { status: 400 })
  }
  const data = parsed.data
  const categoryName = coachingCategories.find((c) => c.slug === data.category)?.name ?? data.category
  const subject = `Coaching quote request: ${categoryName}, ${data.tierLabel}`
  const normalizedEmail = normalizeEmail(data.email)!

  await db.$transaction(async (tx) => {
    let contact = await tx.crmContact.findFirst({ where: { normalizedEmail, deletedAt: null } })
    if (!contact) {
      const parts = data.name.split(/\s+/)
      contact = await tx.crmContact.create({
        data: {
          firstName: parts[0],
          lastName: parts.slice(1).join(' ') || null,
          displayName: contactDisplayName(parts[0], parts.slice(1).join(' ')),
          primaryEmail: data.email,
          normalizedEmail,
          primaryPhone: data.whatsapp || null,
          normalizedPhone: normalizePhone(data.whatsapp),
          lifecycleStage: 'lead',
          relationshipTypes: ['lead'],
          source: 'coaching-quote-request',
          nextActionAt: new Date(Date.now() + 4 * 60 * 60 * 1000),
        },
      })
    }

    await tx.crmActivity.create({
      data: {
        contactId: contact.id,
        type: 'enquiry',
        direction: 'inbound',
        subject,
        body: data.message,
        channel: 'website',
        metadata: { category: data.category, tierLabel: data.tierLabel },
      },
    })
    await tx.crmTask.create({
      data: {
        title: `Respond to coaching quote: ${data.name}`,
        description: `${subject}\n\n${data.message}`,
        dueAt: new Date(Date.now() + 4 * 60 * 60 * 1000),
        priority: 'high',
        contactId: contact.id,
      },
    })
    await tx.crmContact.update({
      where: { id: contact.id },
      data: { lastActivityAt: new Date(), nextActionAt: new Date(Date.now() + 4 * 60 * 60 * 1000) },
    })
  })

  return NextResponse.json({ status: 'ok' }, { status: 201 })
}
