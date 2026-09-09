import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { getBookBySlug } from '@/lib/data/book-catalog'
import { PaymentClaimManager } from '@/components/dashboard/PaymentClaimManager'
import { requireCrmPage } from '@/services/crm/access'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Payment Claims',
}

export default async function AdminPaymentClaimsPage() {
  await requireCrmPage('finance:read')

  const claims = await db.paymentClaim.findMany({ orderBy: { createdAt: 'desc' } })

  const teachingIds = claims.map((c) => c.teachingId).filter((id): id is string => Boolean(id))
  const teachings = teachingIds.length
    ? await db.teaching.findMany({ where: { id: { in: teachingIds } }, select: { id: true, title: true } })
    : []
  const teachingTitleById = new Map(teachings.map((t) => [t.id, t.title]))

  const initialClaims = await Promise.all(
    claims.map(async (claim) => ({
      id: claim.id,
      offerType: claim.offerType,
      offerTitle:
        claim.offerType === 'book'
          ? (claim.bookSlug ? (await getBookBySlug(claim.bookSlug))?.title : undefined) ?? claim.bookSlug ?? 'Unknown book'
          : claim.offerType === 'teaching'
            ? teachingTitleById.get(claim.teachingId ?? '') ?? claim.teachingId ?? 'Unknown teaching'
            : claim.offerType === 'coaching'
              ? claim.coachingOfferName ?? 'Unknown session'
              : 'Support the Mission',
      email: claim.email,
      name: claim.name,
      amountKes: claim.amountKes,
      mpesaCode: claim.mpesaCode,
      hasEvidence: Boolean(claim.evidenceFileName),
      status: claim.status,
      createdAt: claim.createdAt.toISOString(),
    }))
  )

  return (
    <div>
      <div className="rounded-3xl bg-navy px-6 py-8 text-white sm:px-10">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">Finance</p>
        <h1 className="mt-3 font-heading text-3xl font-bold">Paybill Payment Claims</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">
          Review M-Pesa Paybill payments buyers have self-reported. Approving one records a real purchase and
          unlocks access; nothing unlocks until you approve it.
        </p>
      </div>
      <div className="mt-8">
        <PaymentClaimManager initialClaims={initialClaims} />
      </div>
    </div>
  )
}
