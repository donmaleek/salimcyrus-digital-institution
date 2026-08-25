import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { slugify } from '@/lib/utils/slugify'
import { requireCrmApi } from '@/services/crm/access'

export async function GET() {
  const principal = await requireCrmApi('content:write')
  if (!principal) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const entries = await db.journalEntry.findMany({
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
  })

  return NextResponse.json({ entries })
}

const createEntrySchema = z.object({
  title: z.string().min(3),
  subtitle: z.string().optional(),
  category: z.string().min(1),
  summary: z.string().min(10),
  thesis: z.string().optional(),
  body: z.string().min(50),
  readingTime: z.string().optional(),
  status: z.enum(['draft', 'published']).default('draft'),
})

export async function POST(request: NextRequest) {
  const principal = await requireCrmApi('content:write')
  if (!principal) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const parsed = createEntrySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
  }

  const baseSlug = slugify(parsed.data.title)
  if (!baseSlug) {
    return NextResponse.json({ error: 'Title must contain letters or numbers' }, { status: 400 })
  }

  let slug = baseSlug
  let suffix = 2
  while (await db.journalEntry.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${suffix}`
    suffix += 1
  }

  const entry = await db.journalEntry.create({
    data: {
      ...parsed.data,
      slug,
      authorId: principal.id,
      publishedAt: parsed.data.status === 'published' ? new Date() : null,
    },
  })

  return NextResponse.json({ entry }, { status: 201 })
}
