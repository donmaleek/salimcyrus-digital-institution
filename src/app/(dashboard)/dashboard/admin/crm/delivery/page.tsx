import { db } from '@/lib/db'
import { requireCrmPage } from '@/services/crm/access'
import {
  CrmPageHeader,
  MetricCard,
  StatusBadge,
  date,
} from '@/components/dashboard/crm/CrmUi'
export const dynamic = 'force-dynamic'
export default async function DeliveryPage() {
  await requireCrmPage()
  const [programs, bookings] = await Promise.all([
    db.crmProgram.findMany({
      include: { enrollments: { include: { contact: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    db.booking.findMany({
      include: { slot: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
  ])
  const enrolled = programs.flatMap((p) => p.enrollments)
  const completed = enrolled.filter((e) => e.status === 'completed').length
  const upcoming = bookings.filter((b) => b.status === 'pending').length
  return (
    <div className="mx-auto max-w-[1500px]">
      <CrmPageHeader
        eyebrow="Promises delivered"
        title="Programs, coaching and sessions"
        description="See who enrolled, what Salim promised, what happens next and where a participant needs attention."
      />
      <div className="mt-7 grid gap-4 sm:grid-cols-3">
        <MetricCard
          label="Active programs"
          value={String(
            programs.filter((p) => ['active', 'enrolling'].includes(p.status))
              .length
          )}
          detail="Cohorts and transformation tracks"
        />
        <MetricCard
          label="Participants"
          value={String(enrolled.length)}
          detail={`${completed} completed`}
          tone="green"
        />
        <MetricCard
          label="Upcoming bookings"
          value={String(upcoming)}
          detail="Pending coaching and consulting sessions"
          tone="gold"
        />
      </div>
      <div className="mt-7 grid gap-7 xl:grid-cols-2">
        <section className="rounded-3xl border border-navy-100 bg-white p-5">
          <h2 className="font-heading text-xl font-bold text-navy">
            Program portfolio
          </h2>
          <div className="mt-4 space-y-3">
            {programs.map((p) => (
              <article key={p.id} className="rounded-2xl bg-cream p-4">
                <div className="flex justify-between">
                  <div>
                    <p className="font-bold text-navy">{p.name}</p>
                    <p className="mt-1 text-xs capitalize text-navy-400">
                      {p.type} · {p.enrollments.length}/{p.capacity || '∞'}{' '}
                      participants
                    </p>
                  </div>
                  <StatusBadge value={p.status} />
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-navy-100">
                  <div
                    className="h-full bg-gold"
                    style={{
                      width: `${Math.min(100, p.capacity ? (p.enrollments.length / p.capacity) * 100 : 0)}%`,
                    }}
                  />
                </div>
              </article>
            ))}
          </div>
        </section>
        <section className="rounded-3xl border border-navy-100 bg-white p-5">
          <h2 className="font-heading text-xl font-bold text-navy">
            Recent bookings
          </h2>
          <div className="mt-4 space-y-3">
            {bookings.map((b) => (
              <article
                key={b.id}
                className="flex justify-between rounded-2xl border border-navy-100 p-4"
              >
                <div>
                  <p className="font-bold text-navy">{b.name}</p>
                  <p className="text-xs text-navy-400">
                    {b.offerName} ·{' '}
                    {b.slot ? date(b.slot.startTime) : date(b.createdAt)}
                  </p>
                </div>
                <StatusBadge value={b.status} />
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
