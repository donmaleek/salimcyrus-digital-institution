import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireCrmApi } from '@/services/crm/access'

const input = z.object({
  title: z.string().trim().min(2).max(160),
  businessLine: z.string().min(2).max(40),
  amount: z.coerce.number().nonnegative(),
  pipelineId: z.string().cuid(),
  stageId: z.string().cuid(),
  expectedCloseAt: z.coerce.date().optional(),
  contactId: z.string().cuid().optional(),
})

export async function POST(request: Request) {
  const principal = await requireCrmApi('opportunities:write')
  if (!principal)
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const parsed = input.safeParse(await request.json())
  if (!parsed.success)
    return NextResponse.json(
      { error: 'Complete the opportunity, value, pipeline and stage.' },
      { status: 400 }
    )
  const stage = await db.crmPipelineStage.findFirst({
    where: { id: parsed.data.stageId, pipelineId: parsed.data.pipelineId },
  })
  if (!stage)
    return NextResponse.json(
      { error: 'The selected stage does not belong to this pipeline.' },
      { status: 400 }
    )
  const opportunity = await db.$transaction(async (tx) => {
    const created = await tx.crmOpportunity.create({
      data: {
        title: parsed.data.title,
        businessLine: parsed.data.businessLine,
        amountMinor: Math.round(parsed.data.amount * 100),
        pipelineId: parsed.data.pipelineId,
        stageId: parsed.data.stageId,
        probability: stage.probability,
        ownerId: principal.id,
        contactId: parsed.data.contactId || null,
        expectedCloseAt: parsed.data.expectedCloseAt,
        nextActionAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    })
    await tx.crmTask.create({
      data: {
        title: `Follow up: ${created.title}`,
        priority: 'normal',
        dueAt: created.nextActionAt!,
        assigneeId: principal.id,
        opportunityId: created.id,
        contactId: created.contactId,
      },
    })
    await tx.crmAuditEvent.create({
      data: {
        actorId: principal.id,
        action: 'create',
        entityType: 'CrmOpportunity',
        entityId: created.id,
        summary: `Created opportunity ${created.title}`,
        after: created,
      },
    })
    return created
  })
  return NextResponse.json({ data: opportunity }, { status: 201 })
}
