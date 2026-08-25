import type { Metadata } from 'next'
import { JournalEntryForm } from '@/components/dashboard/JournalEntryForm'
import { requireCrmPage } from '@/services/crm/access'

export const metadata: Metadata = {
  title: 'Write a New Entry',
}

export default async function NewJournalEntryPage() {
  await requireCrmPage('content:write')

  return (
    <div className="mx-auto max-w-5xl">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-500">The Journal</p>
      <h1 className="mt-2 font-heading text-3xl font-bold text-navy">Create a new essay</h1>
      <p className="mt-2 max-w-2xl text-sm text-navy-500">
        Save as a draft to come back to it later, or publish straight to the Journal.
      </p>
      <div className="mt-8">
        <JournalEntryForm />
      </div>
    </div>
  )
}
