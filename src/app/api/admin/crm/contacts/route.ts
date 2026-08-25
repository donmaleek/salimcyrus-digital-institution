import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireCrmApi } from '@/services/crm/access'
import {
  contactDisplayName,
  normalizeEmail,
  normalizePhone,
} from '@/services/crm/normalization'

const input = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().max(80).optional(),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().max(30).optional(),
  lifecycleStage: z.string().max(30).default('lead'),
  source: z.string().max(40).default('manual'),
})

export async function GET(request: Request) {
  if (!(await requireCrmApi('contacts:read')))
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const query = new URL(request.url).searchParams.get('q')?.trim() || ''
  const contacts = await db.crmContact.findMany({
    where: {
      deletedAt: null,
      ...(query
        ? {
            OR: [
              { displayName: { contains: query, mode: 'insensitive' } },
              { primaryEmail: { contains: query, mode: 'insensitive' } },
              { primaryPhone: { contains: query } },
            ],
          }
        : {}),
    },
    orderBy: { updatedAt: 'desc' },
    take: 50,
  })
  return NextResponse.json({ data: contacts })
}

export async function POST(request: Request) {
  const principal = await requireCrmApi('contacts:write')
  if (!principal)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const parsed = input.safeParse(await request.json())
  if (!parsed.success)
    return NextResponse.json(
      { error: 'Check the contact details.', issues: parsed.error.flatten() },
      { status: 400 }
    )
  const normalizedEmail = normalizeEmail(parsed.data.email)
  const normalizedPhone = normalizePhone(parsed.data.phone)
  const duplicate = await db.crmContact.findFirst({
    where: {
      deletedAt: null,
      OR: [
        ...(normalizedEmail ? [{ normalizedEmail }] : []),
        ...(normalizedPhone ? [{ normalizedPhone }] : []),
      ],
    },
  })
  if (duplicate && (normalizedEmail || normalizedPhone))
    return NextResponse.json(
      {
        error: `A matching relationship already exists: ${duplicate.displayName}`,
        duplicateId: duplicate.id,
      },
      { status: 409 }
    )
  const contact = await db.$transaction(async (tx) => {
    const created = await tx.crmContact.create({
      data: {
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName || null,
        displayName: contactDisplayName(
          parsed.data.firstName,
          parsed.data.lastName
        ),
        primaryEmail: parsed.data.email || null,
        normalizedEmail,
        primaryPhone: parsed.data.phone || null,
        normalizedPhone,
        lifecycleStage: parsed.data.lifecycleStage,
        relationshipTypes: [parsed.data.lifecycleStage],
        source: parsed.data.source,
        ownerId: principal.id,
        nextActionAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    })
    await tx.crmAuditEvent.create({
      data: {
        actorId: principal.id,
        action: 'create',
        entityType: 'CrmContact',
        entityId: created.id,
        summary: `Created relationship ${created.displayName}`,
        after: created,
      },
    })
    return created
  })
  return NextResponse.json({ data: contact }, { status: 201 })
}
