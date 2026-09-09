'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { formatCurrency } from '@/lib/utils/currency'

interface TeachingSummary {
  id: string
  slug: string
  title: string
  category: string
  status: string
  priceKes: number
  thumbnailPath: string | null
  updatedAt: string
}

export function TeachingManager({ initialTeachings }: { initialTeachings: TeachingSummary[] }) {
  const [teachings, setTeachings] = useState(initialTeachings)
  const { showToast } = useToast()

  async function togglePublish(teaching: TeachingSummary) {
    const nextStatus = teaching.status === 'published' ? 'draft' : 'published'
    const res = await fetch(`/api/admin/teachings/${teaching.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus }),
    })

    if (!res.ok) {
      showToast('Could not update that teaching.', 'error')
      return
    }

    setTeachings((prev) => prev.map((t) => (t.id === teaching.id ? { ...t, status: nextStatus } : t)))
    showToast(nextStatus === 'published' ? 'Published.' : 'Unpublished, back to draft.')
  }

  async function handleDelete(teaching: TeachingSummary) {
    if (!confirm(`Delete "${teaching.title}" permanently? This cannot be undone.`)) return

    const res = await fetch(`/api/admin/teachings/${teaching.id}`, { method: 'DELETE' })
    if (!res.ok) {
      showToast('Could not delete that teaching.', 'error')
      return
    }

    setTeachings((prev) => prev.filter((t) => t.id !== teaching.id))
    showToast('Teaching deleted.')
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ['Total teachings', teachings.length],
          ['Published', teachings.filter((t) => t.status === 'published').length],
          ['Drafts', teachings.filter((t) => t.status !== 'published').length],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-navy-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-navy-400">{label}</p>
            <p className="mt-2 font-heading text-3xl font-bold text-navy">{value}</p>
          </div>
        ))}
      </div>
      <div className="flex justify-end">
        <Button href="/dashboard/admin/teachings/new">Upload a New Teaching</Button>
      </div>

      <div className="space-y-3">
        {teachings.length === 0 ? (
          <p className="text-sm text-navy-400">No teachings yet, upload your first one above.</p>
        ) : (
          teachings.map((teaching) => (
            <div
              key={teaching.id}
              className="grid gap-4 rounded-2xl border border-navy-100 bg-white p-4 shadow-sm transition hover:border-gold-300 sm:grid-cols-[88px_1fr_auto] sm:items-center"
            >
              <div className="relative flex aspect-video items-center justify-center overflow-hidden rounded-xl bg-navy-50">
                {teaching.thumbnailPath ? (
                  <Image src={teaching.thumbnailPath} alt="" fill unoptimized className="object-cover" />
                ) : (
                  <span className="font-heading text-2xl font-bold text-gold-500">SC</span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <p className="font-semibold text-navy">{teaching.title}</p>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ${
                      teaching.status === 'published' ? 'bg-gold/20 text-gold-500' : 'bg-navy-50 text-navy-400'
                    }`}
                  >
                    {teaching.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-navy-400">
                  {teaching.category} &middot; {formatCurrency(teaching.priceKes)} &middot; updated{' '}
                  {new Date(teaching.updatedAt).toLocaleDateString('en-KE')}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {teaching.status === 'published' && (
                  <Link
                    href={`/teachings/${teaching.slug}`}
                    target="_blank"
                    className="inline-flex min-h-9 items-center rounded-full border border-navy-200 px-4 text-sm font-semibold text-navy hover:bg-navy-50"
                  >
                    View
                  </Link>
                )}
                <Link
                  href={`/dashboard/admin/teachings/${teaching.id}/edit`}
                  className="inline-flex min-h-9 items-center rounded-full border border-navy-200 px-4 text-sm font-semibold text-navy hover:bg-navy-50"
                >
                  Edit Media
                </Link>
                <Button variant="outline" size="sm" onClick={() => togglePublish(teaching)}>
                  {teaching.status === 'published' ? 'Unpublish' : 'Publish'}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(teaching)}>
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
