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
  const [busy, setBusy] = useState(false)

  async function startPayPalCheckout() {
    setError('')
    setBusy(true)

    const response = await fetch('/api/coaching/checkout-paypal', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ offerName }),
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
    <div className="flex flex-col gap-3" data-testid="coaching-checkout-form">
      <Button type="button" onClick={startPayPalCheckout} loading={busy} disabled={busy} className="w-full">
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
