import { db } from '@/lib/db'
import { requireCrmPage } from '@/services/crm/access'
import {
  CrmPageHeader,
  MetricCard,
  StatusBadge,
  date,
  money,
} from '@/components/dashboard/crm/CrmUi'
export const dynamic = 'force-dynamic'
export default async function RevenuePage() {
  await requireCrmPage('finance:read')
  const rows = await db.crmTransaction.findMany({
    include: { contact: true, opportunity: true, order: true },
    orderBy: { createdAt: 'desc' },
    take: 150,
  })
  const received = rows
    .filter((r) => r.status === 'successful')
    .reduce((s, r) => s + r.netMinor, 0)
  const pending = rows
    .filter((r) => r.status === 'pending')
    .reduce((s, r) => s + r.grossMinor, 0)
  const fees = rows.reduce((s, r) => s + r.feeMinor, 0)
  const unmatched = rows.filter((r) => r.reconciliationStatus === 'unmatched')
  return (
    <div className="mx-auto max-w-[1500px]">
      <CrmPageHeader
        eyebrow="Operational finance"
        title="Revenue and reconciliation"
        description="Paystack, PayPal, M-Pesa Paybill and manual payments in one operational ledger. Figures are collections, not accounting profit."
      />
      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Net collected"
          value={money(received)}
          detail="Successful transactions"
          tone="green"
        />
        <MetricCard
          label="Pending"
          value={money(pending)}
          detail="Awaiting provider confirmation"
          tone="gold"
        />
        <MetricCard
          label="Gateway fees"
          value={money(fees)}
          detail="Provider charges recorded"
        />
        <MetricCard
          label="Unmatched"
          value={String(unmatched.length)}
          detail="Needs allocation or intentional exception"
          tone={unmatched.length ? 'red' : 'navy'}
        />
      </div>
      <div className="mt-7 overflow-x-auto rounded-3xl border border-navy-100 bg-white p-5">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead>
            <tr className="border-b text-xs uppercase tracking-wider text-navy-400">
              <th className="pb-3">Date</th>
              <th className="pb-3">Payer</th>
              <th className="pb-3">Provider</th>
              <th className="pb-3">Business line</th>
              <th className="pb-3">Status</th>
              <th className="pb-3">Reconciliation</th>
              <th className="pb-3 text-right">Net</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-navy-50">
                <td className="py-4 text-navy-500">
                  {date(r.paidAt || r.createdAt)}
                </td>
                <td className="py-4 font-bold text-navy">
                  {r.contact?.displayName || 'Unlinked payer'}
                </td>
                <td className="py-4 capitalize">
                  {r.provider} · {r.method}
                </td>
                <td className="py-4 capitalize">{r.businessLine}</td>
                <td className="py-4">
                  <StatusBadge value={r.status} />
                </td>
                <td className="py-4">
                  <StatusBadge value={r.reconciliationStatus} />
                </td>
                <td className="py-4 text-right font-bold">
                  {money(r.netMinor, r.currency)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
