import { db } from '@/lib/db'
import { requireCrmPage } from '@/services/crm/access'
import { CrmPageHeader, MetricCard } from '@/components/dashboard/crm/CrmUi'
export const dynamic = 'force-dynamic'
export default async function ReportsPage() {
  await requireCrmPage('reports:read')
  const [
    contacts,
    tasks,
    opportunities,
    transactions,
    orders,
    enrollments,
    audits,
    integrations,
  ] = await Promise.all([
    db.crmContact.count({ where: { deletedAt: null } }),
    db.crmTask.count({ where: { status: { not: 'completed' } } }),
    db.crmOpportunity.count(),
    db.crmTransaction.count(),
    db.crmOrder.count(),
    db.crmEnrollment.count(),
    db.crmAuditEvent.findMany({
      include: { actor: true },
      orderBy: { createdAt: 'desc' },
      take: 25,
    }),
    db.crmIntegration.findMany({ orderBy: { provider: 'asc' } }),
  ])
  return (
    <div className="mx-auto max-w-[1500px]">
      <CrmPageHeader
        eyebrow="One definition of truth"
        title="Reports, goals and audit"
        description="Every summary drills back to operational records. Metric definitions stay centralized so teams cannot report the same KPI differently."
      />
      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <MetricCard
          label="Relationships"
          value={String(contacts)}
          detail="Active records"
        />
        <MetricCard
          label="Open tasks"
          value={String(tasks)}
          detail="Execution queue"
        />
        <MetricCard
          label="Opportunities"
          value={String(opportunities)}
          detail="All-time pipeline"
        />
        <MetricCard
          label="Transactions"
          value={String(transactions)}
          detail="Payment ledger"
        />
        <MetricCard
          label="Orders"
          value={String(orders)}
          detail="Commerce records"
        />
        <MetricCard
          label="Enrollments"
          value={String(enrollments)}
          detail="Program delivery"
        />
      </div>
      <div className="mt-7 grid gap-7 xl:grid-cols-[1.5fr_1fr]">
        <section className="rounded-3xl border border-navy-100 bg-white p-5">
          <h2 className="font-heading text-xl font-bold text-navy">
            Immutable activity trail
          </h2>
          <div className="mt-4 divide-y divide-navy-50">
            {audits.map((a) => (
              <div
                key={a.id}
                className="flex flex-col gap-1 py-3 sm:flex-row sm:justify-between"
              >
                <div>
                  <p className="text-sm font-bold text-navy">{a.summary}</p>
                  <p className="text-xs text-navy-400">
                    {a.entityType}
                    {a.entityId ? ` · ${a.entityId}` : ''}
                  </p>
                </div>
                <p className="text-xs text-navy-400">
                  {a.actor?.name || 'System'} ·{' '}
                  {a.createdAt.toLocaleString('en-KE')}
                </p>
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-3xl border border-navy-100 bg-navy p-5 text-white">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-gold-300">
            Connections
          </p>
          <h2 className="mt-2 font-heading text-xl font-bold">
            Integration readiness
          </h2>
          <div className="mt-4 space-y-3">
            {integrations.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-xl border border-white/10 p-3"
              >
                <div>
                  <p className="font-bold capitalize">{item.provider}</p>
                  <p className="text-xs text-navy-200">
                    {item.lastError ||
                      item.lastSyncAt?.toLocaleString('en-KE') ||
                      'Awaiting verified credentials'}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase ${item.status === 'configured' ? 'bg-emerald-500/20 text-emerald-200' : 'bg-white/10 text-navy-100'}`}
                >
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
