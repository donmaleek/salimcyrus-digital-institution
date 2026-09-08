import { NextRequest, NextResponse } from 'next/server'
import { requireCrmApi } from '@/services/crm/access'
import { db } from '@/lib/db'
import { books } from '@/lib/data/books'

export async function GET(request: NextRequest) {
  if (!(await requireCrmApi('finance:read'))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const status = request.nextUrl.searchParams.get('status')
  const claims = await db.paymentClaim.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: 'desc' },
  })

  const teachingIds = claims.map((c) => c.teachingId).filter((id): id is string => Boolean(id))
  const teachings = teachingIds.length
    ? await db.teaching.findMany({ where: { id: { in: teachingIds } }, select: { id: true, title: true } })
    : []
  const teachingTitleById = new Map(teachings.map((t) => [t.id, t.title]))

  const enriched = claims.map((claim) => ({
    ...claim,
    offerTitle:
      claim.offerType === 'book'
        ? books.find((b) => b.slug === claim.bookSlug)?.title ?? claim.bookSlug
        : claim.offerType === 'teaching'
          ? teachingTitleById.get(claim.teachingId ?? '') ?? claim.teachingId
          : 'Support the Mission',
  }))

  return NextResponse.json({ claims: enriched })
}
