import { db } from '@/lib/db'
import { requireCrmPage } from '@/services/crm/access'
import {
  CrmPageHeader,
  MetricCard,
  StatusBadge,
  date,
} from '@/components/dashboard/crm/CrmUi'
export const dynamic = 'force-dynamic'
export default async function MarketingPage() {
  await requireCrmPage()
  const [campaigns, subscribers, journal, questions] = await Promise.all([
    db.crmCampaign.findMany({
      include: { members: true },
      orderBy: { createdAt: 'desc' },
    }),
    db.newsletterSubscriber.count(),
    db.journalEntry.findMany({ orderBy: { updatedAt: 'desc' }, take: 10 }),
    db.askSalimQuestion.findMany({ orderBy: { createdAt: 'desc' }, take: 10 }),
  ])
  return (
    <div className="mx-auto max-w-[1500px]">
      <CrmPageHeader
        eyebrow="Ideas to measurable action"
        title="Marketing and content"
        description="Connect Journal, Ask Salim, email, WhatsApp, books, programs, media and campaigns to audience growth and revenue attribution."
      />
      <div className="mt-7 grid gap-4 sm:grid-cols-3">
        <MetricCard
          label="Newsletter audience"
          value={String(subscribers)}
          detail="Website subscribers with source history"
        />
        <MetricCard
          label="Campaigns"
          value={String(campaigns.length)}
          detail={`${campaigns.filter((c) => c.status === 'active').length} active`}
          tone="gold"
        />
        <MetricCard
          label="Content queue"
          value={String(
            journal.filter((j) => j.status !== 'published').length +
              questions.filter((q) => q.status === 'pending').length
          )}
          detail="Journal drafts and unanswered Ask Salim questions"
        />
      </div>
      <div className="mt-7 grid gap-7 xl:grid-cols-2">
        <section className="rounded-3xl border border-navy-100 bg-white p-5">
          <h2 className="font-heading text-xl font-bold text-navy">
            Campaign performance
          </h2>
          <div className="mt-4 space-y-3">
            {campaigns.map((c) => (
              <article key={c.id} className="rounded-2xl bg-cream p-4">
                <div className="flex justify-between">
                  <div>
                    <p className="font-bold text-navy">{c.name}</p>
                    <p className="text-xs capitalize text-navy-400">
                      {c.channel} · {c.members.length} audience members
                    </p>
                  </div>
                  <StatusBadge value={c.status} />
                </div>
              </article>
            ))}
          </div>
        </section>
        <section className="rounded-3xl border border-navy-100 bg-white p-5">
          <h2 className="font-heading text-xl font-bold text-navy">
            Editorial activity
          </h2>
          <div className="mt-4 space-y-3">
            {journal.map((item) => (
              <article
                key={item.id}
                className="flex justify-between rounded-2xl border border-navy-100 p-4"
              >
                <div>
                  <p className="font-bold text-navy">{item.title}</p>
                  <p className="text-xs text-navy-400">
                    {item.category} · updated {date(item.updatedAt)}
                  </p>
                </div>
                <StatusBadge value={item.status} />
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
