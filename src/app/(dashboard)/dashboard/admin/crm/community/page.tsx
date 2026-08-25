import { db } from '@/lib/db'
import { requireCrmPage } from '@/services/crm/access'
import {
  CrmPageHeader,
  MetricCard,
  StatusBadge,
  money,
} from '@/components/dashboard/crm/CrmUi'
export const dynamic = 'force-dynamic'
export default async function CommunityPage() {
  await requireCrmPage()
  const [members, donations, partners] = await Promise.all([
    db.crmContact.count({
      where: {
        deletedAt: null,
        relationshipTypes: {
          hasSome: ['community', 'volunteer', 'beneficiary', 'supporter'],
        },
      },
    }),
    db.crmDonation.findMany({
      include: { contact: true },
      orderBy: { receivedAt: 'desc' },
      take: 80,
    }),
    db.crmOrganization.findMany({
      where: { type: { in: ['partner', 'sponsor', 'church'] } },
      orderBy: { updatedAt: 'desc' },
    }),
  ])
  const received = donations
    .filter((d) => d.status === 'received')
    .reduce((s, d) => s + d.amountMinor, 0)
  return (
    <div className="mx-auto max-w-[1500px]">
      <CrmPageHeader
        eyebrow="Halisi Hub Connect"
        title="Community, partnerships and impact"
        description="Keep commercial revenue separate from mission support while making every donor, volunteer, partner and beneficiary relationship visible."
      />
      <div className="mt-7 grid gap-4 sm:grid-cols-3">
        <MetricCard
          label="Community relationships"
          value={String(members)}
          detail="Members, volunteers, supporters and beneficiaries"
        />
        <MetricCard
          label="Mission support"
          value={money(received)}
          detail="Recorded donations and restricted support"
          tone="green"
        />
        <MetricCard
          label="Partner organizations"
          value={String(partners.length)}
          detail="Partners, sponsors and churches"
          tone="gold"
        />
      </div>
      <div className="mt-7 grid gap-7 xl:grid-cols-2">
        <section className="rounded-3xl border border-navy-100 bg-white p-5">
          <h2 className="font-heading text-xl font-bold text-navy">
            Recent support
          </h2>
          <div className="mt-4 space-y-3">
            {donations.map((d) => (
              <article
                key={d.id}
                className="flex justify-between rounded-2xl bg-cream p-4"
              >
                <div>
                  <p className="font-bold text-navy">
                    {d.contact?.displayName || 'Anonymous supporter'}
                  </p>
                  <p className="text-xs text-navy-400">
                    {d.campaign || 'General mission'}
                    {d.restriction ? ` · ${d.restriction}` : ''}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-navy">
                    {money(d.amountMinor, d.currency)}
                  </p>
                  <StatusBadge value={d.status} />
                </div>
              </article>
            ))}
          </div>
        </section>
        <section className="rounded-3xl border border-navy-100 bg-white p-5">
          <h2 className="font-heading text-xl font-bold text-navy">
            Partnership health
          </h2>
          <div className="mt-4 space-y-3">
            {partners.map((p) => (
              <article
                key={p.id}
                className="flex justify-between rounded-2xl border border-navy-100 p-4"
              >
                <div>
                  <p className="font-bold text-navy">{p.name}</p>
                  <p className="text-xs capitalize text-navy-400">{p.type}</p>
                </div>
                <StatusBadge value={p.status} />
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
