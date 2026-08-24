import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  const isAdmin = (session?.user as { isAdmin?: boolean } | undefined)?.isAdmin
  return isAdmin === true
}

const updateEntrySchema = z.object({
  title: z.string().min(3).optional(),
  subtitle: z.string().optional(),
  category: z.string().min(1).optional(),
  summary: z.string().min(10).optional(),
  thesis: z.string().optional(),
  body: z.string().min(50).optional(),
  readingTime: z.string().optional(),
  status: z.enum(['draft', 'published']).optional(),
})

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) {
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

  const entry = await db.journalEntry.update({
    where: { id: params.id },
    data: {
      ...parsed.data,
      publishedAt: becomingPublished ? new Date() : undefined,
    },
  })

  return NextResponse.json({ entry })
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const existing = await db.journalEntry.findUnique({ where: { id: params.id } })
  if (!existing) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  await db.journalEntry.delete({ where: { id: params.id } })
  return NextResponse.json({ status: 'ok' })
}
