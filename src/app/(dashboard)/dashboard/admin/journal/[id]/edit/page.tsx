import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { JournalEntryForm } from '@/components/dashboard/JournalEntryForm'
import { requireCrmPage } from '@/services/crm/access'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Edit Entry',
}

export default async function EditJournalEntryPage({ params }: { params: { id: string } }) {
  await requireCrmPage('content:write')

  const entry = await db.journalEntry.findUnique({ where: { id: params.id } })
  if (!entry) {
    notFound()
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-navy">Edit Entry</h1>
      <div className="mt-8 max-w-3xl">
        <JournalEntryForm
          initial={{
            id: entry.id,
            title: entry.title,
            subtitle: entry.subtitle ?? '',
            category: entry.category,
            summary: entry.summary,
            thesis: entry.thesis ?? '',
            body: entry.body,
            readingTime: entry.readingTime ?? '',
            status: entry.status === 'published' ? 'published' : 'draft',
          }}
        />
      </div>
    </div>
  )
}
