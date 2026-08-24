import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { JournalManager } from '@/components/dashboard/JournalManager'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Manage Journal',
}

export default async function AdminJournalPage() {
  const session = await getServerSession(authOptions)
  const isAdmin = (session?.user as { isAdmin?: boolean } | undefined)?.isAdmin === true

  if (!isAdmin) {
    redirect('/dashboard')
  }

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
