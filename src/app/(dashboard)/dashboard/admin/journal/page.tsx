import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { JournalManager } from '@/components/dashboard/JournalManager'
import { requireCrmPage } from '@/services/crm/access'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Manage Journal',
}

export default async function AdminJournalPage() {
  await requireCrmPage('content:write')

  const entries = await db.journalEntry.findMany({
    orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
  })

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-navy">Manage Journal</h1>
      <p className="mt-2 max-w-2xl text-sm text-navy-500">
        Write, edit, and publish essays. Drafts stay off the public site until you publish them.
      </p>
      <div className="mt-8">
        <JournalManager
          initialEntries={entries.map((entry) => ({
            id: entry.id,
            slug: entry.slug,
            title: entry.title,
            category: entry.category,
            status: entry.status,
            publishedAt: entry.publishedAt?.toISOString() ?? null,
            updatedAt: entry.updatedAt.toISOString(),
          }))}
        />
      </div>
    </div>
  )
}
