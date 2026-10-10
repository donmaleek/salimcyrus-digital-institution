import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { contactDisplayName, normalizeEmail, normalizePhone } from '@/services/crm/normalization'

/**
 * Lead capture for the School/Organization Package (workshops, group
 * education, tailored resources): a consultative, institution-level
 * engagement with no fixed price, so this records the request instead of
 * taking a payment. Mirrors /api/contact and /api/coaching/request-quote's
 * CrmContact -> CrmActivity -> CrmTask shape exactly, high priority since
 * an institutional booking is always time-sensitive.
 */
const schoolRequestSchema = z.object({
  organizationName: z.string().trim().min(2).max(200),
  contactName: z.string().trim().min(2).max(100),
  email: z.string().email(),
  phone: z.string().max(40).optional(),
  message: z.string().trim().min(20).max(1500),
})

export async function POST(request: Request) {
  const parsed = schoolRequestSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Check your details and message.' }, { status: 400 })
  }
  const data = parsed.data
  const subject = `Parental Guidance school/org request: ${data.organizationName}`
  const normalizedEmail = normalizeEmail(data.email)!

  await db.$transaction(async (tx) => {
    let contact = await tx.crmContact.findFirst({ where: { normalizedEmail, deletedAt: null } })
    if (!contact) {
      const parts = data.contactName.split(/\s+/)
      contact = await tx.crmContact.create({
        data: {
          firstName: parts[0],
          lastName: parts.slice(1).join(' ') || null,
          displayName: contactDisplayName(parts[0], parts.slice(1).join(' ')),
          primaryEmail: data.email,
          normalizedEmail,
          primaryPhone: data.phone || null,
          normalizedPhone: normalizePhone(data.phone),
          lifecycleStage: 'lead',
          relationshipTypes: ['lead'],
          source: 'parental-guidance-school-request',
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
        metadata: { organizationName: data.organizationName },
      },
    })
    await tx.crmTask.create({
      data: {
        title: `Respond to school/org request: ${data.organizationName}`,
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
