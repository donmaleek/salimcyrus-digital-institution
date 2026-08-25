import { db } from '@/lib/db'
import { requireCrmPage } from '@/services/crm/access'
import {
  CrmPageHeader,
  EmptyState,
  StatusBadge,
  date,
} from '@/components/dashboard/crm/CrmUi'
import { QuickCreate } from '@/components/dashboard/crm/QuickCreate'

export const dynamic = 'force-dynamic'
export default async function RelationshipsPage() {
  await requireCrmPage('contacts:read')
  const contacts = await db.crmContact.findMany({
    where: { deletedAt: null },
    include: {
      owner: true,
      organization: true,
      _count: {
        select: {
          opportunities: true,
          tasks: true,
          transactions: true,
          orders: true,
        },
      },
    },
    orderBy: { updatedAt: 'desc' },
    take: 100,
  })
  return (
    <div className="mx-auto max-w-[1500px]">
      <CrmPageHeader
        eyebrow="Relationship 360"
        title="People and organizations"
        description="One living record for every lead, client, student, buyer, donor, partner, supporter and media relationship."
        action={<QuickCreate kind="contact" />}
      />
      <div className="mt-7 rounded-3xl border border-navy-100 bg-white p-5">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-navy-100 text-xs uppercase tracking-wider text-navy-400">
                <th className="pb-3">Relationship</th>
                <th className="pb-3">Lifecycle</th>
                <th className="pb-3">Owner</th>
                <th className="pb-3">History</th>
                <th className="pb-3">Next action</th>
                <th className="pb-3">Source</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact) => (
                <tr
                  key={contact.id}
                  className="border-b border-navy-50 align-top"
                >
                  <td className="py-4">
                    <p className="font-bold text-navy">{contact.displayName}</p>
                    <p className="mt-1 text-xs text-navy-400">
                      {contact.primaryEmail ||
                        contact.primaryPhone ||
                        'Contact details incomplete'}
                    </p>
                    {contact.organization && (
                      <p className="text-xs text-gold-600">
                        {contact.organization.name}
                      </p>
                    )}
                  </td>
                  <td className="py-4">
                    <StatusBadge value={contact.lifecycleStage} />
                  </td>
                  <td className="py-4 text-navy-500">
                    {contact.owner?.name || 'Unassigned'}
                  </td>
                  <td className="py-4 text-navy-500">
                    {contact._count.opportunities} deals ·{' '}
                    {contact._count.transactions} payments ·{' '}
                    {contact._count.orders} orders
                  </td>
                  <td className="py-4">
                    {contact.nextActionAt ? (
                      <span
                        className={
                          contact.nextActionAt < new Date()
                            ? 'font-bold text-red-600'
                            : 'text-navy-500'
                        }
                      >
                        {date(contact.nextActionAt)}
                      </span>
                    ) : (
                      <span className="font-bold text-red-600">Missing</span>
                    )}
                  </td>
                  <td className="py-4 capitalize text-navy-500">
                    {contact.source}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!contacts.length && (
          <EmptyState
            title="Your relationship book starts here"
            detail="Add the first relationship or import active contacts from WhatsApp, email and spreadsheets."
          />
        )}
      </div>
    </div>
  )
}
