import { NextRequest, NextResponse } from 'next/server'
import { requireCrmApi } from '@/services/crm/access'
import { db } from '@/lib/db'
import { getBookBySlug } from '@/lib/data/book-catalog'

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

  const enriched = await Promise.all(
    claims.map(async (claim) => ({
      ...claim,
      offerTitle:
        claim.offerType === 'book'
          ? (claim.bookSlug ? (await getBookBySlug(claim.bookSlug))?.title : undefined) ?? claim.bookSlug
          : claim.offerType === 'teaching'
            ? teachingTitleById.get(claim.teachingId ?? '') ?? claim.teachingId
            : claim.offerType === 'coaching'
              ? claim.coachingOfferName ?? 'Unknown session'
              : 'Support the Mission',
    }))
  )

  return NextResponse.json({ claims: enriched })
}
