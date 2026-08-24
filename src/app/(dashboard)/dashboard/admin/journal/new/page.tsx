import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { JournalEntryForm } from '@/components/dashboard/JournalEntryForm'

export const metadata: Metadata = {
  title: 'Write a New Entry',
}

export default async function NewJournalEntryPage() {
  const session = await getServerSession(authOptions)
  const isAdmin = (session?.user as { isAdmin?: boolean } | undefined)?.isAdmin === true

  if (!isAdmin) {
    redirect('/dashboard')
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-navy">Write a New Entry</h1>
      <p className="mt-2 max-w-2xl text-sm text-navy-500">
        Save as a draft to come back to it later, or publish straight to the Journal.
      </p>
      <div className="mt-8 max-w-3xl">
        <JournalEntryForm />
      </div>
    </div>
  )
}
