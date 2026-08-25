'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'

interface EntrySummary {
  id: string
  slug: string
  title: string
  category: string
  status: string
  publishedAt: string | null
  updatedAt: string
  hasCoverImage: boolean
}

export function JournalManager({ initialEntries }: { initialEntries: EntrySummary[] }) {
  const [entries, setEntries] = useState(initialEntries)
  const { showToast } = useToast()

  async function togglePublish(entry: EntrySummary) {
    const nextStatus = entry.status === 'published' ? 'draft' : 'published'
    const res = await fetch(`/api/admin/journal/${entry.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus }),
    })

    if (!res.ok) {
      showToast('Could not update that entry.', 'error')
      return
    }

    setEntries((prev) =>
      prev.map((e) => (e.id === entry.id ? { ...e, status: nextStatus } : e))
    )
    showToast(nextStatus === 'published' ? 'Published.' : 'Unpublished — back to draft.')
  }

  async function handleDelete(entry: EntrySummary) {
    if (!confirm(`Delete "${entry.title}" permanently?`)) return

    const res = await fetch(`/api/admin/journal/${entry.id}`, { method: 'DELETE' })
    if (!res.ok) {
      showToast('Could not delete that entry.', 'error')
      return
    }

    setEntries((prev) => prev.filter((e) => e.id !== entry.id))
    showToast('Entry deleted.')
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ['Total essays', entries.length],
          ['Published', entries.filter((entry) => entry.status === 'published').length],
          ['Drafts', entries.filter((entry) => entry.status !== 'published').length],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-navy-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-navy-400">{label}</p>
            <p className="mt-2 font-heading text-3xl font-bold text-navy">{value}</p>
          </div>
        ))}
      </div>
      <div className="flex justify-end"><Button href="/dashboard/admin/journal/new">Write a New Entry</Button></div>

      <div className="space-y-3">
        {entries.length === 0 ? (
          <p className="text-sm text-navy-400">No journal entries yet — write your first one above.</p>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.id}
              className="grid gap-4 rounded-2xl border border-navy-100 bg-white p-4 shadow-sm transition hover:border-gold-300 sm:grid-cols-[88px_1fr_auto] sm:items-center"
            >
              <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl bg-navy-50">
                {entry.hasCoverImage ? <Image src={`/api/journal/${entry.id}/cover`} alt="" fill unoptimized className="object-cover" /> : <span className="font-heading text-2xl font-bold text-gold-500">SC</span>}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <p className="font-semibold text-navy">{entry.title}</p>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ${
                      entry.status === 'published'
                        ? 'bg-gold/20 text-gold-500'
                        : 'bg-navy-50 text-navy-400'
                    }`}
                  >
                    {entry.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-navy-400">
                  {entry.category} · updated {new Date(entry.updatedAt).toLocaleDateString('en-KE')}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {entry.status === 'published' && (
                  <Link
                    href={`/journal/${entry.slug}`}
                    target="_blank"
                    className="inline-flex min-h-9 items-center rounded-full border border-navy-200 px-4 text-sm font-semibold text-navy hover:bg-navy-50"
                  >
                    View
                  </Link>
                )}
                <Link
                  href={`/dashboard/admin/journal/${entry.id}/edit`}
                  className="inline-flex min-h-9 items-center rounded-full border border-navy-200 px-4 text-sm font-semibold text-navy hover:bg-navy-50"
                >
                  Edit
                </Link>
                <Button variant="outline" size="sm" onClick={() => togglePublish(entry)}>
                  {entry.status === 'published' ? 'Unpublish' : 'Publish'}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(entry)}>
                  Delete
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
