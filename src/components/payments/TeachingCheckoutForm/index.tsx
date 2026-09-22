'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { PaybillClaimForm } from '@/components/payments/PaybillClaimForm'

export function TeachingCheckoutForm({
  teachingId,
  email,
  priceKes,
  priceUsd,
}: {
  teachingId: string
  /** The signed-in buyer's account email. Purchases are always tied to the
   * account they registered/logged in with, never a freely typed address,
   * so "my learning" history and video access line up with their account. */
  email: string
  priceKes: number
  priceUsd: number
}) {
  const [error, setError] = useState('')
  const [busy, setBusy] = useState<'paystack' | 'paypal' | null>(null)

  async function startPaystackCheckout() {
    setError('')
    setBusy('paystack')

    const response = await fetch('/api/teachings/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, teachingId }),
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
      <p className="text-sm text-navy-500">
        Buying as <span className="font-semibold text-navy">{email}</span>
      </p>
      <Button type="button" onClick={startPaystackCheckout} loading={busy === 'paystack'} disabled={Boolean(busy)} size="lg" className="w-full">
        Pay with Paystack (KES {priceKes.toLocaleString()})
      </Button>
      <Button type="button" onClick={startPayPalCheckout} loading={busy === 'paypal'} disabled={Boolean(busy)} size="lg" variant="outline" className="w-full">
        Pay with PayPal (${priceUsd})
      </Button>
      {error && (
        <p role="alert" className="text-sm leading-6 text-red-700">
          {error}
        </p>
      )}
      <PaybillClaimForm offerType="teaching" teachingId={teachingId} amountKes={priceKes} />
    </div>
  )
}
