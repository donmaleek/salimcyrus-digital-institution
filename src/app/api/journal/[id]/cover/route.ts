import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireCrmApi } from '@/services/crm/access'

export const dynamic = 'force-dynamic'

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const entry = await db.journalEntry.findUnique({
    where: { id: params.id },
    select: { status: true, coverImageData: true, coverImageMime: true, updatedAt: true },
  })

  if (!entry?.coverImageData || !entry.coverImageMime) {
    return new NextResponse(null, { status: 404 })
  }
  if (entry.status !== 'published' && !(await requireCrmApi('content:write'))) {
    return new NextResponse(null, { status: 404 })
  }

  return new NextResponse(entry.coverImageData, {
    headers: {
      'Content-Type': entry.coverImageMime,
      'Cache-Control': entry.status === 'published' ? 'public, max-age=3600, stale-while-revalidate=86400' : 'private, no-store',
      'Last-Modified': entry.updatedAt.toUTCString(),
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
