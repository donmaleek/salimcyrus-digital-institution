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
    <div className="mx-auto max-w-5xl">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-500">The Journal</p>
      <h1 className="mt-2 font-heading text-3xl font-bold text-navy">Edit essay</h1>
      <div className="mt-8">
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
            coverImageUrl: entry.coverImageData ? `/api/journal/${entry.id}/cover` : undefined,
            coverImageAlt: entry.coverImageAlt ?? '',
            coverImageCaption: entry.coverImageCaption ?? '',
          }}
        />
      </div>
    </div>
  )
}
