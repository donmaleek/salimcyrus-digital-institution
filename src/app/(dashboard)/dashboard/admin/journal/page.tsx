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
      <div className="rounded-3xl bg-navy px-6 py-8 text-white sm:px-10">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">Content studio</p>
        <h1 className="mt-3 font-heading text-3xl font-bold">The Journal</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">Shape Salim&apos;s ideas, add editorial imagery, preview every essay, and control what readers see.</p>
      </div>
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
            hasCoverImage: Boolean(entry.coverImageData),
          }))}
        />
      </div>
    </div>
  )
}
