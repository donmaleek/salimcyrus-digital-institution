import { db } from '@/lib/db'
import { requireCrmPage } from '@/services/crm/access'
import {
  CrmPageHeader,
  EmptyState,
  StatusBadge,
  money,
} from '@/components/dashboard/crm/CrmUi'
import { QuickCreate } from '@/components/dashboard/crm/QuickCreate'

export const dynamic = 'force-dynamic'
export default async function PipelinePage() {
  await requireCrmPage('crm:read')
  const pipelines = await db.crmPipeline.findMany({
    where: { isActive: true },
    include: {
      stages: {
        orderBy: { position: 'asc' },
        include: {
          opportunities: {
            where: { status: 'open' },
            include: { contact: true, owner: true },
          },
        },
      },
    },
  })
  const controls = pipelines.map((p) => ({
    id: p.id,
    name: p.name,
    stages: p.stages.map((s) => ({ id: s.id, name: s.name })),
  }))
  return (
    <div className="mx-auto max-w-[1600px]">
      <CrmPageHeader
        eyebrow="Revenue relationships"
        title="Pipeline and forecast"
        description="Move each opportunity toward a decision, with a named owner, honest probability and protected next action."
        action={
          pipelines.length ? (
            <QuickCreate kind="opportunity" pipelines={controls} />
          ) : undefined
        }
      />
      {!pipelines.length ? (
        <div className="mt-7">
          <EmptyState
            title="Pipeline setup required"
            detail="Run the CRM seed to create Salim's coaching, speaking, academy, book, community and partnership stages."
          />
        </div>
      ) : (
        pipelines.map((pipeline) => (
          <section key={pipeline.id} className="mt-7">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="font-heading text-2xl font-bold text-navy">
                  {pipeline.name}
                </h2>
                <p className="text-sm capitalize text-navy-400">
                  {pipeline.businessLine}
                </p>
              </div>
              <p className="text-sm font-bold text-navy">
                {money(
                  pipeline.stages
                    .flatMap((s) => s.opportunities)
                    .reduce((sum, o) => sum + o.amountMinor, 0)
                )}
              </p>
            </div>
            <div
              className="mt-4 grid gap-4 overflow-x-auto pb-3"
              style={{
                gridTemplateColumns: `repeat(${pipeline.stages.length}, minmax(250px, 1fr))`,
              }}
            >
              {pipeline.stages.map((stage) => (
                <div key={stage.id} className="rounded-2xl bg-navy-50 p-3">
                  <div className="flex justify-between px-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-navy-500">
                      {stage.name}
                    </p>
                    <span className="text-xs text-navy-400">
                      {stage.opportunities.length}
                    </span>
                  </div>
                  <div className="mt-3 space-y-3">
                    {stage.opportunities.map((item) => (
                      <article
                        key={item.id}
                        className="rounded-xl border border-navy-100 bg-white p-4 shadow-sm"
                      >
                        <div className="flex justify-between gap-2">
                          <p className="font-bold text-navy">{item.title}</p>
                          <StatusBadge value={`${item.probability}%`} />
                        </div>
                        <p className="mt-2 text-xs text-navy-400">
                          {item.contact?.displayName ||
                            'Relationship not linked'}
                        </p>
                        <p className="mt-4 font-heading text-xl font-bold text-navy">
                          {money(item.amountMinor, item.currency)}
                        </p>
                        <p className="mt-1 text-[11px] text-navy-400">
                          Owner: {item.owner?.name || 'Unassigned'}
                        </p>
                      </article>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))
      )}
    </div>
  )
}
