'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { formatCurrency } from '@/lib/utils/currency'

interface BookSummary {
  id: string
  slug: string
  title: string
  status: string
  priceKes: number
  coverPath: string
  updatedAt: string
}

export function BookManager({ initialBooks }: { initialBooks: BookSummary[] }) {
  const [books, setBooks] = useState(initialBooks)
  const { showToast } = useToast()

  async function togglePublish(book: BookSummary) {
    const nextStatus = book.status === 'available' ? 'draft' : 'available'
    const res = await fetch(`/api/admin/books/${book.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: nextStatus }),
    })

    if (!res.ok) {
      showToast('Could not update that book.', 'error')
      return
    }

    setBooks((prev) => prev.map((b) => (b.id === book.id ? { ...b, status: nextStatus } : b)))
    showToast(nextStatus === 'available' ? 'Published.' : 'Unpublished, back to draft.')
  }

  async function handleDelete(book: BookSummary) {
    if (!confirm(`Delete "${book.title}" permanently? This cannot be undone.`)) return

    const res = await fetch(`/api/admin/books/${book.id}`, { method: 'DELETE' })
    if (!res.ok) {
      showToast('Could not delete that book.', 'error')
      return
    }

    setBooks((prev) => prev.filter((b) => b.id !== book.id))
    showToast('Book deleted.')
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ['Total books', books.length],
          ['Published', books.filter((b) => b.status === 'available').length],
          ['Drafts', books.filter((b) => b.status !== 'available').length],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-navy-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-navy-400">{label}</p>
            <p className="mt-2 font-heading text-3xl font-bold text-navy">{value}</p>
          </div>
        ))}
      </div>
      <div className="flex justify-end">
        <Button href="/dashboard/admin/books/new">Upload a New Book</Button>
      </div>

      <div className="space-y-3">
        {books.length === 0 ? (
          <p className="text-sm text-navy-400">No admin-uploaded books yet, upload your first one above.</p>
        ) : (
          books.map((book) => (
            <div
              key={book.id}
              className="grid gap-4 rounded-2xl border border-navy-100 bg-white p-4 shadow-sm transition hover:border-gold-300 sm:grid-cols-[64px_1fr_auto] sm:items-center"
            >
              <div className="relative aspect-[4/5] w-16 overflow-hidden rounded-md bg-navy-50">
                <Image src={book.coverPath} alt="" fill unoptimized className="object-cover" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <p className="font-semibold text-navy">{book.title}</p>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ${
                      book.status === 'available' ? 'bg-gold/20 text-gold-500' : 'bg-navy-50 text-navy-400'
                    }`}
                  >
                    {book.status}
                  </span>
                </div>
                <p className="mt-1 text-sm text-navy-400">
                  {formatCurrency(book.priceKes)} &middot; updated {new Date(book.updatedAt).toLocaleDateString('en-KE')}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {book.status === 'available' && (
                  <Link
                    href={`/books/${book.slug}`}
                    target="_blank"
                    className="inline-flex min-h-9 items-center rounded-full border border-navy-200 px-4 text-sm font-semibold text-navy hover:bg-navy-50"
                  >
                    View
                  </Link>
                )}
                <Button variant="outline" size="sm" onClick={() => togglePublish(book)}>
                  {book.status === 'available' ? 'Unpublish' : 'Publish'}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(book)}>
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
