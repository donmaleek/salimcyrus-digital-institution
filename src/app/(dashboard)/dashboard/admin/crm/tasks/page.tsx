import { db } from '@/lib/db'
import { requireCrmPage } from '@/services/crm/access'
import {
  CrmPageHeader,
  StatusBadge,
  date,
} from '@/components/dashboard/crm/CrmUi'
import { QuickCreate } from '@/components/dashboard/crm/QuickCreate'
import { CompleteTask } from '@/components/dashboard/crm/TaskActions'
export const dynamic = 'force-dynamic'
export default async function TasksPage() {
  await requireCrmPage()
  const [tasks, cases] = await Promise.all([
    db.crmTask.findMany({
      where: { status: { not: 'completed' } },
      include: { contact: true, assignee: true, opportunity: true },
      orderBy: { dueAt: 'asc' },
      take: 100,
    }),
    db.crmCase.findMany({
      where: { status: { not: 'resolved' } },
      include: { contact: true, assignee: true },
      orderBy: { createdAt: 'desc' },
      take: 50,
    }),
  ])
  return (
    <div className="mx-auto max-w-[1500px]">
      <CrmPageHeader
        eyebrow="Daily execution"
        title="Tasks and client care"
        description="The team opens this queue every morning. Every commitment has an owner, deadline, context and completion evidence."
        action={<QuickCreate kind="task" />}
      />
      <div className="mt-7 grid gap-7 xl:grid-cols-[1.5fr_1fr]">
        <section className="rounded-3xl border border-navy-100 bg-white p-5">
          <h2 className="font-heading text-xl font-bold text-navy">
            Open commitments
          </h2>
          <div className="mt-4 space-y-2">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="flex flex-col gap-3 rounded-2xl bg-cream p-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <StatusBadge
                      value={
                        task.dueAt < new Date() ? 'overdue' : task.priority
                      }
                    />
                    <p className="font-bold text-navy">{task.title}</p>
                  </div>
                  <p className="mt-2 text-xs text-navy-400">
                    {task.contact?.displayName ||
                      task.opportunity?.title ||
                      'Internal'}{' '}
                    · {task.assignee?.name || 'Unassigned'} · due{' '}
                    {date(task.dueAt)}
                  </p>
                </div>
                <CompleteTask id={task.id} />
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-3xl border border-navy-100 bg-white p-5">
          <h2 className="font-heading text-xl font-bold text-navy">
            Open client cases
          </h2>
          <div className="mt-4 space-y-3">
            {cases.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border border-navy-100 p-4"
              >
                <div className="flex justify-between">
                  <p className="font-bold text-navy">{item.subject}</p>
                  <StatusBadge value={item.priority} />
                </div>
                <p className="mt-2 text-xs text-navy-400">
                  {item.caseNumber} · {item.contact?.displayName || 'Unlinked'}{' '}
                  · {item.status}
                </p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
