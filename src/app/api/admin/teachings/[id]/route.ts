import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { requireCrmApi } from '@/services/crm/access'
import { db } from '@/lib/db'

const updateSchema = z.object({
  status: z.enum(['draft', 'published']),
})

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireCrmApi('content:write'))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const parsed = updateSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const existing = await db.teaching.findUnique({ where: { id: params.id } })
  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const teaching = await db.teaching.update({
    where: { id: params.id },
    data: { status: parsed.data.status },
  })

  return NextResponse.json({ teaching })
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireCrmApi('content:write'))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const existing = await db.teaching.findUnique({ where: { id: params.id } })
  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await db.teaching.delete({ where: { id: params.id } })
  return NextResponse.json({ status: 'ok' })
}
