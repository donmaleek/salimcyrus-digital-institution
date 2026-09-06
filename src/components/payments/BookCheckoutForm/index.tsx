'use client'

import { FormEvent, useState } from 'react'
import { Button } from '@/components/ui/Button'

export function BookCheckoutForm({
  slug,
  title,
  whatsappOrderUrl,
}: {
  slug: string
  title: string
  whatsappOrderUrl: string
}) {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function startCheckout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setLoading(true)

    const form = new FormData(event.currentTarget)
    const response = await fetch('/api/books/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: form.get('email'), slug }),
    }).catch(() => null)

    if (!response) {
      setError('Could not connect to checkout. Please try again or order on WhatsApp.')
      setLoading(false)
      return
    }

    const payload = (await response.json()) as { authorizationUrl?: string; error?: string }
    if (!response.ok || !payload.authorizationUrl) {
      setError(payload.error ?? 'Checkout could not be started.')
      setLoading(false)
      return
    }

    window.location.assign(payload.authorizationUrl)
  }

  return (
    <div className="flex flex-col gap-3" data-testid="book-checkout-form">
      <form onSubmit={startCheckout} className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <label htmlFor={`book-email-${slug}`} className="sr-only">
          Email for your download link
        </label>
        <input
          id={`book-email-${slug}`}
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@example.com"
          className="w-full rounded-xl border border-navy-200 bg-cream px-4 py-3 text-navy outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20 sm:max-w-xs"
        />
        <Button type="submit" loading={loading} size="lg">
          Buy &amp; Download Now
        </Button>
      </form>
      {error && (
        <p role="alert" className="text-sm leading-6 text-red-700">
          {error}
        </p>
      )}
      <p className="text-sm text-navy-500">
        Prefer WhatsApp?{' '}
        <a href={whatsappOrderUrl} className="font-semibold text-navy underline">
          Order &ldquo;{title}&rdquo; there instead
        </a>
        .
      </p>
    </div>
  )
}
