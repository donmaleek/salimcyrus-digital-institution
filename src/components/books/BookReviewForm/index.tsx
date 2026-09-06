'use client'

import { FormEvent, useState } from 'react'
import { Button } from '@/components/ui/Button'

function StarPicker({ value, onChange }: { value: number; onChange: (rating: number) => void }) {
  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} star${star === 1 ? '' : 's'}`}
          onClick={() => onChange(star)}
          className={`text-2xl leading-none ${star <= value ? 'text-gold-500' : 'text-navy-200'}`}
        >
          &#9733;
        </button>
      ))}
    </div>
  )
}

export function BookReviewForm({ slug }: { slug: string }) {
  const [rating, setRating] = useState(0)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSuccess('')

    if (rating === 0) {
      setError('Select a star rating.')
      return
    }

    setLoading(true)
    const form = new FormData(event.currentTarget)
    const response = await fetch(`/api/books/${slug}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: form.get('email'),
        reviewerName: form.get('reviewerName'),
        rating,
        title: form.get('title'),
        body: form.get('body'),
      }),
    }).catch(() => null)

    setLoading(false)
    if (!response) {
      setError('Could not connect. Please try again.')
      return
    }

    const payload = (await response.json()) as { message?: string; error?: string }
    if (!response.ok) {
      setError(payload.error ?? 'Could not submit your review.')
      return
    }

    setSuccess(payload.message ?? 'Thank you for your review.')
    event.currentTarget.reset()
    setRating(0)
  }

  if (success) {
    return (
      <p className="rounded-xl border border-gold-200 bg-gold-50 p-4 text-sm text-navy-700">
        {success}
      </p>
    )
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-xl border border-navy-100 bg-white p-5">
      <div>
        <p className="text-sm font-semibold text-navy">Your rating</p>
        <div className="mt-2">
          <StarPicker value={rating} onChange={setRating} />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor={`reviewer-name-${slug}`} className="block text-sm font-semibold text-navy">
            Your name
          </label>
          <input
            id={`reviewer-name-${slug}`}
            name="reviewerName"
            required
            maxLength={100}
            className="mt-1 w-full rounded-lg border border-navy-200 px-3 py-2 text-navy outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
          />
        </div>
        <div>
          <label htmlFor={`reviewer-email-${slug}`} className="block text-sm font-semibold text-navy">
            Email used to buy this book
          </label>
          <input
            id={`reviewer-email-${slug}`}
            name="email"
            type="email"
            required
            className="mt-1 w-full rounded-lg border border-navy-200 px-3 py-2 text-navy outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
          />
        </div>
      </div>
      <div>
        <label htmlFor={`review-title-${slug}`} className="block text-sm font-semibold text-navy">
          Review title (optional)
        </label>
        <input
          id={`review-title-${slug}`}
          name="title"
          maxLength={150}
          className="mt-1 w-full rounded-lg border border-navy-200 px-3 py-2 text-navy outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
        />
      </div>
      <div>
        <label htmlFor={`review-body-${slug}`} className="block text-sm font-semibold text-navy">
          Your review
        </label>
        <textarea
          id={`review-body-${slug}`}
          name="body"
          required
          minLength={10}
          maxLength={2000}
          rows={4}
          className="mt-1 w-full resize-y rounded-lg border border-navy-200 px-3 py-2 text-navy outline-none focus:border-gold focus:ring-2 focus:ring-gold/20"
        />
      </div>
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
      <Button type="submit" loading={loading}>
        Submit Review
      </Button>
      <p className="text-xs text-navy-400">
        Only verified buyers can review. Reviews are checked before they appear publicly.
      </p>
    </form>
  )
}
