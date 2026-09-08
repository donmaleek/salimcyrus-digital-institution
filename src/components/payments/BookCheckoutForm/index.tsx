'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { PaybillClaimForm } from '@/components/payments/PaybillClaimForm'

export function BookCheckoutForm({
  slug,
  title,
  whatsappOrderUrl,
  email,
  priceKes,
  priceUsd,
}: {
  slug: string
  title: string
  whatsappOrderUrl: string
  /** The signed-in buyer's account email. Purchases are always tied to the
   * account they registered/logged in with, never a freely typed address,
   * so the download and "my library" history line up with their account. */
  email: string
  priceKes: number
  priceUsd: number
}) {
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function startPayPalCheckout() {
    setError('')
    setBusy(true)

    const response = await fetch('/api/books/checkout-paypal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slug }),
    }).catch(() => null)

    if (!response) {
      setError('Could not connect to PayPal. Please try again or use another method.')
      setBusy(false)
      return
    }

    const payload = (await response.json()) as { approvalUrl?: string; error?: string }
    if (!response.ok || !payload.approvalUrl) {
      setError(payload.error ?? 'PayPal checkout could not be started.')
      setBusy(false)
      return
    }

    window.location.assign(payload.approvalUrl)
  }

  return (
    <div className="flex flex-col gap-3" data-testid="book-checkout-form">
      <p className="text-sm text-navy-500">
        Buying as <span className="font-semibold text-navy">{email}</span>
      </p>
      <Button type="button" onClick={startPayPalCheckout} loading={busy} disabled={busy} size="lg" className="w-full">
        Pay with PayPal (${priceUsd})
      </Button>
      {error && (
        <p role="alert" className="text-sm leading-6 text-red-700">
          {error}
        </p>
      )}
      <PaybillClaimForm offerType="book" bookSlug={slug} amountKes={priceKes} />
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
