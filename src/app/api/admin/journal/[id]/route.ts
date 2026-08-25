import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireCrmApi } from '@/services/crm/access'
import { decodeJournalImage } from '@/lib/journal/image'

const updateEntrySchema = z.object({
  title: z.string().min(3).optional(),
  subtitle: z.string().optional(),
  category: z.string().min(1).optional(),
  summary: z.string().min(10).optional(),
  thesis: z.string().optional(),
  body: z.string().min(50).optional(),
  readingTime: z.string().optional(),
  status: z.enum(['draft', 'published']).optional(),
  coverImage: z.object({
    dataUrl: z.string(),
    alt: z.string(),
    caption: z.string().optional(),
  }).nullable().optional(),
})

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireCrmApi('content:write'))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const parsed = updateEntrySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const existing = await db.journalEntry.findUnique({ where: { id: params.id } })
  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const becomingPublished = parsed.data.status === 'published' && existing.status !== 'published'
  let coverImage = {}
  try {
    coverImage = parsed.data.coverImage === null
      ? { coverImageData: null, coverImageMime: null, coverImageAlt: null, coverImageCaption: null }
      : parsed.data.coverImage
        ? decodeJournalImage(parsed.data.coverImage)
        : {}
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Invalid journal image.' },
      { status: 400 }
    )
  }

  const { coverImage: _coverImage, ...entryData } = parsed.data

  const entry = await db.journalEntry.update({
    where: { id: params.id },
    data: {
      ...entryData,
      ...coverImage,
      publishedAt: becomingPublished ? new Date() : undefined,
    },
  })

  return NextResponse.json({ entry })
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireCrmApi('content:write'))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const existing = await db.journalEntry.findUnique({ where: { id: params.id } })
  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await db.journalEntry.delete({ where: { id: params.id } })
  return NextResponse.json({ status: 'ok' })
}
