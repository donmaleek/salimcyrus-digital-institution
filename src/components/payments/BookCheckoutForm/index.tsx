'use client'

import { FormEvent, useState } from 'react'
import { Button } from '@/components/ui/Button'

export function BookCheckoutForm({
  slug,
  title,
  whatsappOrderUrl,
  email,
}: {
  slug: string
  title: string
  whatsappOrderUrl: string
  /** The signed-in buyer's account email — purchases are always tied to the
   * account they registered/logged in with, never a freely typed address,
   * so the download and "my library" history line up with their account. */
  email: string
}) {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function startCheckout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setLoading(true)

    const response = await fetch('/api/books/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, slug }),
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
      <form onSubmit={startCheckout} className="flex flex-col gap-3">
        <p className="text-sm text-navy-500">
          Buying as <span className="font-semibold text-navy">{email}</span>
        </p>
        <Button type="submit" loading={loading} size="lg" className="w-full">
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
