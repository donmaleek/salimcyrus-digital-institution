'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { PaybillClaimForm } from '@/components/payments/PaybillClaimForm'

const PRICE_KES = 500
const PRICE_USD = 4

export function JournalSubscribeForm({ email }: { email: string }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function startPayPal() {
    setBusy(true)
    setError('')
    const response = await fetch('/api/journal/checkout-paypal', { method: 'POST' }).catch(() => null)
    if (!response) {
      setError('Could not connect to the payment service. Please try again.')
      setBusy(false)
      return
    }
    const body = (await response.json()) as { approvalUrl?: string; error?: string }
    if (!response.ok || !body.approvalUrl) {
      setError(body.error ?? 'Checkout could not be started.')
      setBusy(false)
      return
    }
    window.location.assign(body.approvalUrl)
  }

  return (
    <div className="space-y-3" data-testid="journal-subscribe-form">
      <p className="text-sm text-navy-500">
        Subscribing as <strong className="text-navy">{email}</strong>
      </p>
      <Button type="button" onClick={startPayPal} loading={busy} disabled={busy} className="w-full">
        Pay with PayPal (${PRICE_USD}/month)
      </Button>
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
      <PaybillClaimForm offerType="journal" amountKes={PRICE_KES} />
    </div>
  )
}
