import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { normalizeEmail } from '@/services/crm/normalization'

const subscribeSchema = z.object({ email: z.string().email() })

export async function POST(request: NextRequest) {
  const body = await request.json()
  const parsed = subscribeSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  await db.$transaction(async (tx) => {
    const email = normalizeEmail(parsed.data.email)!
    await tx.newsletterSubscriber.upsert({ where: { email }, update: {}, create: { email } })
    const existing = await tx.crmContact.findFirst({ where: { normalizedEmail: email, deletedAt: null } })
    if (existing) {
      await tx.crmContact.update({ where: { id: existing.id }, data: { emailConsent: true, consentCapturedAt: new Date(), relationshipTypes: { push: 'subscriber' }, lastActivityAt: new Date() } })
      await tx.crmActivity.create({ data: { contactId: existing.id, type: 'consent', direction: 'inbound', subject: 'Subscribed to the Salim Cyrus newsletter', channel: 'website' } })
    } else {
      const contact = await tx.crmContact.create({ data: { firstName: email.split('@')[0], displayName: email, primaryEmail: email, normalizedEmail: email, lifecycleStage: 'subscriber', relationshipTypes: ['subscriber'], source: 'newsletter', emailConsent: true, consentCapturedAt: new Date(), lastActivityAt: new Date() } })
      await tx.crmActivity.create({ data: { contactId: contact.id, type: 'consent', direction: 'inbound', subject: 'Subscribed to the Salim Cyrus newsletter', channel: 'website' } })
    }
  })

  return NextResponse.json({ status: 'ok' })
}
