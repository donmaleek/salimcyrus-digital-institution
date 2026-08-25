import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireCrmApi } from '@/services/crm/access'

const input = z.object({
  title: z.string().trim().min(2).max(160),
  description: z.string().max(2000).optional(),
  dueAt: z.coerce.date(),
  priority: z.enum(['normal', 'high', 'urgent']).default('normal'),
  contactId: z.string().cuid().optional(),
})

export async function POST(request: Request) {
  const principal = await requireCrmApi('tasks:write')
  if (!principal)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const parsed = input.safeParse(await request.json())
  if (!parsed.success)
    return NextResponse.json(
      { error: 'A title and valid due date are required.' },
      { status: 400 }
    )
  const task = await db.$transaction(async (tx) => {
    const created = await tx.crmTask.create({
      data: {
        ...parsed.data,
        description: parsed.data.description || null,
        contactId: parsed.data.contactId || null,
        assigneeId: principal.id,
      },
    })
    await tx.crmAuditEvent.create({
      data: {
        actorId: principal.id,
        action: 'create',
        entityType: 'CrmTask',
        entityId: created.id,
        summary: `Created task ${created.title}`,
        after: created,
      },
    })
    return created
  })
  return NextResponse.json({ data: task }, { status: 201 })
}

export async function PATCH(request: Request) {
  const principal = await requireCrmApi('tasks:write')
  if (!principal)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const parsed = z
    .object({
      id: z.string().cuid(),
      status: z.enum(['open', 'in_progress', 'completed']),
      completionNote: z.string().max(1000).optional(),
    })
    .safeParse(await request.json())
  if (!parsed.success)
    return NextResponse.json({ error: 'Invalid task update.' }, { status: 400 })
  const task = await db.$transaction(async (tx) => {
    const before = await tx.crmTask.findUniqueOrThrow({
      where: { id: parsed.data.id },
    })
    const updated = await tx.crmTask.update({
      where: { id: parsed.data.id },
      data: {
        status: parsed.data.status,
        completionNote: parsed.data.completionNote,
        completedAt: parsed.data.status === 'completed' ? new Date() : null,
      },
    })
    await tx.crmAuditEvent.create({
      data: {
        actorId: principal.id,
        action: 'update',
        entityType: 'CrmTask',
        entityId: updated.id,
        summary: `Changed task ${updated.title} to ${updated.status}`,
        before,
        after: updated,
      },
    })
    return updated
  })
  return NextResponse.json({ data: task })
}
