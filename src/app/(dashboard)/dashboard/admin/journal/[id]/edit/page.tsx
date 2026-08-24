import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect, notFound } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { JournalEntryForm } from '@/components/dashboard/JournalEntryForm'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Edit Entry',
}

export default async function EditJournalEntryPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  const isAdmin = (session?.user as { isAdmin?: boolean } | undefined)?.isAdmin === true

  if (!isAdmin) {
    redirect('/dashboard')
  }

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
