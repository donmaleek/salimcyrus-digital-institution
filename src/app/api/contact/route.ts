import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import {
  contactDisplayName,
  normalizeEmail,
  normalizePhone,
} from '@/services/crm/normalization'

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().email(),
  whatsapp: z.string().max(40).optional(),
  organization: z.string().max(160).optional(),
  enquiryType: z.string().min(2).max(100),
  message: z.string().min(20).max(1500),
})
export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null))
  if (!parsed.success)
    return NextResponse.json(
      { error: 'Check your name, email and message.' },
      { status: 400 }
    )
  const data = parsed.data
  const email = normalizeEmail(data.email)!
  await db.$transaction(async (tx) => {
    let contact = await tx.crmContact.findFirst({
      where: { normalizedEmail: email, deletedAt: null },
    })
    let organization = null
    if (data.organization) {
      organization = await tx.crmOrganization.findFirst({
        where: {
          name: { equals: data.organization, mode: 'insensitive' },
          deletedAt: null,
        },
      })
      if (!organization)
        organization = await tx.crmOrganization.create({
          data: {
            name: data.organization,
            type: data.enquiryType.includes('Partnership')
              ? 'partner'
              : 'business',
          },
        })
    }
    if (!contact) {
      const parts = data.name.split(/\s+/)
      contact = await tx.crmContact.create({
        data: {
          firstName: parts[0],
          lastName: parts.slice(1).join(' ') || null,
          displayName: contactDisplayName(parts[0], parts.slice(1).join(' ')),
          primaryEmail: data.email,
          normalizedEmail: email,
          primaryPhone: data.whatsapp || null,
          normalizedPhone: normalizePhone(data.whatsapp),
          lifecycleStage: 'lead',
          relationshipTypes: [
            data.enquiryType.includes('Media') ? 'media' : 'lead',
          ],
          source: 'contact-form',
          organizationId: organization?.id,
          nextActionAt: new Date(Date.now() + 4 * 60 * 60 * 1000),
        },
      })
    } else if (organization && !contact.organizationId) {
      contact = await tx.crmContact.update({
        where: { id: contact.id },
        data: { organizationId: organization.id },
      })
    }
    await tx.crmActivity.create({
      data: {
        contactId: contact.id,
        type: 'enquiry',
        direction: 'inbound',
        subject: data.enquiryType,
        body: data.message,
        channel: 'website',
      },
    })
    await tx.crmTask.create({
      data: {
        title: `Respond to ${data.enquiryType}: ${data.name}`,
        description: data.message,
        dueAt: new Date(Date.now() + 4 * 60 * 60 * 1000),
        priority:
          data.enquiryType.includes('Media') ||
          data.enquiryType.includes('Partnership')
            ? 'high'
            : 'normal',
        contactId: contact.id,
      },
    })
    await tx.crmContact.update({
      where: { id: contact.id },
      data: {
        lastActivityAt: new Date(),
        nextActionAt: new Date(Date.now() + 4 * 60 * 60 * 1000),
      },
    })
  })
  return NextResponse.json({ status: 'ok' }, { status: 201 })
}
