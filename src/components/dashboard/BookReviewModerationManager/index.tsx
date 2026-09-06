'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'

interface PendingReview {
  id: string
  bookSlug: string
  bookTitle: string
  reviewerName: string
  rating: number
  title: string | null
  body: string
  createdAt: string
}

function ReviewRow({
  review,
  onResolve,
}: {
  review: PendingReview
  onResolve: (id: string) => void
}) {
  const [busy, setBusy] = useState<'approved' | 'rejected' | null>(null)
  const { showToast } = useToast()

  async function moderate(status: 'approved' | 'rejected') {
    setBusy(status)
    try {
      const res = await fetch(`/api/admin/books/reviews/${review.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        showToast(body.error ?? 'Could not update.', 'error')
        return
      }
      onResolve(review.id)
      showToast(status === 'approved' ? 'Review approved.' : 'Review rejected.')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="rounded-xl border border-navy-100 bg-white p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-navy-50 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide text-navy-500">
          {review.bookTitle}
        </span>
        <span className="text-xs font-semibold text-gold-600">
          {review.rating} / 5
        </span>
        <span className="text-xs text-navy-400">{review.reviewerName}</span>
      </div>
      {review.title && <p className="mt-2 font-heading font-bold text-navy">{review.title}</p>}
      <p className="mt-1 text-sm text-navy-600">{review.body}</p>
      <div className="mt-3 flex gap-3">
        <Button size="sm" disabled={busy !== null} onClick={() => moderate('approved')}>
          {busy === 'approved' ? 'Approving…' : 'Approve'}
        </Button>
        <Button size="sm" variant="ghost" disabled={busy !== null} onClick={() => moderate('rejected')}>
          {busy === 'rejected' ? 'Rejecting…' : 'Reject'}
        </Button>
      </div>
    </div>
  )
}

export function BookReviewModerationManager({ initialReviews }: { initialReviews: PendingReview[] }) {
  const [reviews, setReviews] = useState(initialReviews)

  function handleResolve(id: string) {
    setReviews((prev) => prev.filter((r) => r.id !== id))
  }

  if (reviews.length === 0) {
    return <p className="text-sm text-navy-400">No reviews awaiting moderation.</p>
  }

  return (
    <div className="space-y-3">
      {reviews.map((review) => (
        <ReviewRow key={review.id} review={review} onResolve={handleResolve} />
      ))}
    </div>
  )
}
