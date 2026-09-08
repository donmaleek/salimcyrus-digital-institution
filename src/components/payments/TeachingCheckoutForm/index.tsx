'use client'

import { FormEvent, useState } from 'react'
import { Button } from '@/components/ui/Button'

type Busy = 'paystack' | 'paypal' | null

export function TeachingCheckoutForm({
  teachingId,
  email,
  priceUsd,
}: {
  teachingId: string
  /** The signed-in buyer's account email. Purchases are always tied to the
   * account they registered/logged in with, never a freely typed address,
   * so "my learning" history and video access line up with their account. */
  email: string
  priceUsd: number
}) {
  const [error, setError] = useState('')
  const [busy, setBusy] = useState<Busy>(null)

  async function startCheckout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setBusy('paystack')

    const response = await fetch('/api/teachings/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, teachingId }),
    }).catch(() => null)

    if (!response) {
      setError('Could not connect to checkout. Please try again.')
      setBusy(null)
      return
    }

    const payload = (await response.json()) as { authorizationUrl?: string; error?: string }
    if (!response.ok || !payload.authorizationUrl) {
      setError(payload.error ?? 'Checkout could not be started.')
      setBusy(null)
      return
    }

    window.location.assign(payload.authorizationUrl)
  }

  async function startPayPalCheckout() {
    setError('')
    setBusy('paypal')

    const response = await fetch('/api/teachings/checkout-paypal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ teachingId }),
    }).catch(() => null)

    if (!response) {
      setError('Could not connect to PayPal. Please try again or use another method.')
      setBusy(null)
      return
    }

    const payload = (await response.json()) as { approvalUrl?: string; error?: string }
    if (!response.ok || !payload.approvalUrl) {
      setError(payload.error ?? 'PayPal checkout could not be started.')
      setBusy(null)
      return
    }

    window.location.assign(payload.approvalUrl)
  }

  return (
    <div className="flex flex-col gap-3" data-testid="teaching-checkout-form">
      <form onSubmit={startCheckout} className="flex flex-col gap-3">
        <p className="text-sm text-navy-500">
          Buying as <span className="font-semibold text-navy">{email}</span>
        </p>
        <Button type="submit" loading={busy === 'paystack'} disabled={busy !== null && busy !== 'paystack'} size="lg" className="w-full">
          Buy &amp; Watch Now
        </Button>
      </form>
      <Button
        type="button"
        variant="outline"
        onClick={startPayPalCheckout}
        loading={busy === 'paypal'}
        disabled={busy !== null && busy !== 'paypal'}
        size="lg"
        className="w-full"
      >
        Pay with PayPal (${priceUsd})
      </Button>
      {error && (
        <p role="alert" className="text-sm leading-6 text-red-700">
          {error}
        </p>
      )}
    </div>
  )
}
