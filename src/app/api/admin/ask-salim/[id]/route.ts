import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { slugify } from '@/lib/utils/slugify'
import { requireCrmApi } from '@/services/crm/access'

const updateSchema = z.object({
  answer: z.string().min(10).optional(),
  publish: z.boolean().optional(),
})

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireCrmApi('content:write'))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const parsed = updateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const existing = await db.askSalimQuestion.findUnique({ where: { id: params.id } })
  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const answer = parsed.data.answer ?? existing.answer
  if (!answer) {
    return NextResponse.json({ error: 'Cannot publish without an answer' }, { status: 400 })
  }

  const shouldPublish =
    parsed.data.publish === true && existing.publicationPreference !== 'private'
  const shouldUnpublish = parsed.data.publish === false

  let slug = existing.slug
  if (shouldPublish && !slug) {
    const baseSlug = slugify(existing.question).split('-').slice(0, 12).join('-') || 'question'
    slug = baseSlug
    let suffix = 2
    while (await db.askSalimQuestion.findFirst({ where: { slug, NOT: { id: existing.id } } })) {
      slug = `${baseSlug}-${suffix}`
      suffix += 1
    }
  }

  const question = await db.askSalimQuestion.update({
    where: { id: params.id },
    data: {
      answer,
      status: 'answered',
      answeredAt: existing.answeredAt ?? new Date(),
      slug,
      publishedAt: shouldPublish ? new Date() : shouldUnpublish ? null : existing.publishedAt,
    },
  })

  return NextResponse.json({ question })
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireCrmApi('content:write'))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const existing = await db.askSalimQuestion.findUnique({ where: { id: params.id } })
  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await db.askSalimQuestion.delete({ where: { id: params.id } })
  return NextResponse.json({ status: 'ok' })
}
