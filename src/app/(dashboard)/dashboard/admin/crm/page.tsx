import type { Metadata } from 'next'
import Link from 'next/link'
import {
  CrmPageHeader,
  MetricCard,
  StatusBadge,
  date,
  money,
} from '@/components/dashboard/crm/CrmUi'
import { QuickCreate } from '@/components/dashboard/crm/QuickCreate'
import { requireCrmPage } from '@/services/crm/access'
import { getExecutiveDashboard } from '@/services/crm/analytics'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Business Command Center' }

export default async function CrmCommandCenterPage() {
  const principal = await requireCrmPage()
  const data = await getExecutiveDashboard()
  return (
    <div className="mx-auto max-w-[1500px]">
      <CrmPageHeader
        eyebrow="Executive operating system"
        title={`Good day, ${principal.name?.split(' ')[0] || 'Salim'}`}
        description="Every relationship, shilling, commitment and result in one place. Start with what needs attention, then drill into the record behind every number."
        action={
          <div className="flex gap-2">
            <QuickCreate kind="task" />
            <QuickCreate kind="contact" />
          </div>
        }
      />
      <section
        className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6"
        aria-label="Business metrics"
      >
        {data.metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>
      <div className="mt-7 grid gap-7 xl:grid-cols-[1.05fr_1.6fr]">
        <section className="rounded-3xl bg-navy p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-300">
                Needs attention
              </p>
              <h2 className="mt-2 font-heading text-2xl font-bold">
                Protect today
              </h2>
            </div>
            <span className="rounded-full bg-white/10 px-3 py-1 text-xs">
              {data.attention.length} signals
            </span>
          </div>
          <div className="mt-5 space-y-3">
            {data.attention.length ? (
              data.attention.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  className="block rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:bg-white/10"
                >
                  <div className="flex gap-3">
                    <span
                      className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${item.severity === 'critical' ? 'bg-red-400' : item.severity === 'warning' ? 'bg-gold-300' : 'bg-navy-200'}`}
                    />
                    <div>
                      <p className="text-sm font-bold">{item.title}</p>
                      <p className="mt-1 text-xs text-navy-200">
                        {item.detail}
                      </p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <p className="rounded-2xl border border-white/10 p-6 text-sm text-navy-200">
                Nothing urgent. The team is current.
              </p>
            )}
          </div>
        </section>
        <section className="rounded-3xl border border-navy-100 bg-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gold-600">
                Revenue engine
              </p>
              <h2 className="mt-1 font-heading text-2xl font-bold text-navy">
                Live pipeline
              </h2>
            </div>
            <Link
              href="/dashboard/admin/crm/pipeline"
              className="text-sm font-bold text-navy-500"
            >
              Open pipeline →
            </Link>
          </div>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead>
                <tr className="border-b border-navy-100 text-xs uppercase tracking-wider text-navy-400">
                  <th className="pb-3">Opportunity</th>
                  <th className="pb-3">Line</th>
                  <th className="pb-3">Stage</th>
                  <th className="pb-3 text-right">Value</th>
                </tr>
              </thead>
              <tbody>
                {data.opportunities.map((item) => (
                  <tr key={item.id} className="border-b border-navy-50">
                    <td className="py-4">
                      <p className="font-bold text-navy">{item.title}</p>
                      <p className="text-xs text-navy-400">
                        {item.contact?.displayName || 'Relationship not linked'}
                      </p>
                    </td>
                    <td className="py-4 capitalize text-navy-500">
                      {item.businessLine}
                    </td>
                    <td className="py-4">
                      <StatusBadge value={item.stage.name} />
                    </td>
                    <td className="py-4 text-right font-bold text-navy">
                      {money(item.amountMinor, item.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!data.opportunities.length && (
              <p className="py-10 text-center text-sm text-navy-400">
                No opportunities yet. Add the first one from Pipeline.
              </p>
            )}
          </div>
        </section>
      </div>
      <div className="mt-7 grid gap-7 lg:grid-cols-2">
        <section className="rounded-3xl border border-navy-100 bg-white p-6">
          <div className="flex justify-between">
            <h2 className="font-heading text-xl font-bold text-navy">
              Next actions
            </h2>
            <Link
              href="/dashboard/admin/crm/tasks"
              className="text-sm font-bold text-navy-500"
            >
              All tasks →
            </Link>
          </div>
          <div className="mt-4 space-y-2">
            {data.tasks.slice(0, 6).map((task) => (
              <div
                key={task.id}
                className="flex items-center justify-between rounded-xl bg-cream p-3"
              >
                <div>
                  <p className="text-sm font-bold text-navy">{task.title}</p>
                  <p className="text-xs text-navy-400">
                    {task.contact?.displayName ||
                      task.assignee?.name ||
                      'Unassigned'}
                  </p>
                </div>
                <div className="text-right">
                  <StatusBadge
                    value={task.dueAt < new Date() ? 'overdue' : task.priority}
                  />
                  <p className="mt-1 text-[11px] text-navy-400">
                    {date(task.dueAt)}
                  </p>
                </div>
              </div>
            ))}
            {!data.tasks.length && (
              <p className="rounded-2xl bg-cream p-5 text-sm text-navy-500">
                No open commitments. New website enquiries and bookings will
                appear here automatically.
              </p>
            )}
          </div>
        </section>
        <section className="rounded-3xl border border-navy-100 bg-white p-6">
          <h2 className="font-heading text-xl font-bold text-navy">
            Business lines
          </h2>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[
              ['Coaching', '/dashboard/admin/crm/delivery'],
              ['Speaking', '/dashboard/admin/crm/pipeline'],
              ['Academy', '/dashboard/admin/crm/delivery'],
              ['Books', '/dashboard/admin/crm/books'],
              ['Content', '/dashboard/admin/crm/marketing'],
              ['Mission', '/dashboard/admin/crm/community'],
            ].map(([label, href]) => (
              <Link
                key={label}
                href={href}
                className="rounded-2xl border border-navy-100 bg-cream p-4 text-sm font-bold text-navy transition hover:border-gold hover:bg-gold-50"
              >
                {label}
                <span className="mt-4 block text-gold-600">View →</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
