'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { PaybillClaimForm } from '@/components/payments/PaybillClaimForm'

export function CoachingCheckoutForm({
  offerName,
  priceKes,
  priceUsd,
}: {
  offerName: string
  priceKes: number
  priceUsd: number
}) {
  const [error, setError] = useState('')
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState<'paystack' | 'paypal' | null>(null)

  async function startPaystackCheckout() {
    setError('')
    if (!email.trim()) {
      setError('Enter your email address to continue with Paystack.')
      return
    }
    setBusy('paystack')

    const response = await fetch('/api/coaching/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, offerName }),
    }).catch(() => null)

    if (!response) {
      setError('Could not connect to Paystack. Please try again or use another method.')
      setBusy(null)
      return
    }

    const payload = (await response.json()) as { authorizationUrl?: string; error?: string }
    if (!response.ok || !payload.authorizationUrl) {
      setError(payload.error ?? 'Paystack checkout could not be started.')
      setBusy(null)
      return
    }

    window.location.assign(payload.authorizationUrl)
  }

  async function startPayPalCheckout() {
    setError('')
    setBusy('paypal')

    const response = await fetch('/api/coaching/checkout-paypal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ offerName }),
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
    <div className="flex flex-col gap-3" data-testid="coaching-checkout-form">
      <label className="text-sm font-semibold text-navy" htmlFor={`paystack-email-${offerName.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`}>
        Email for Paystack receipt
      </label>
      <input
        id={`paystack-email-${offerName.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`}
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        autoComplete="email"
        required
        className="w-full rounded-xl border border-navy-200 bg-white px-4 py-3 text-navy outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
        placeholder="you@example.com"
      />
      <Button type="button" onClick={startPaystackCheckout} loading={busy === 'paystack'} disabled={Boolean(busy)} className="w-full">
        Pay with Paystack (KES {priceKes.toLocaleString()})
      </Button>
      <Button type="button" onClick={startPayPalCheckout} loading={busy === 'paypal'} disabled={Boolean(busy)} variant="outline" className="w-full">
        Pay with PayPal (${priceUsd})
      </Button>
      {error && (
        <p role="alert" className="text-sm leading-6 text-red-700">
          {error}
        </p>
      )}
      <PaybillClaimForm offerType="coaching" coachingOfferName={offerName} amountKes={priceKes} />
    </div>
  )
}
