'use client'

import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { requestCoachingCheckout, type CheckoutProvider } from './checkout'

export function CoachingCheckoutForm({ offerName, priceKes, priceUsd }: {
  offerName: string
  priceKes: number
  priceUsd: number
}) {
  const [error, setError] = useState('')
  const alertRef = useRef<HTMLDivElement>(null)
  const mounted = useRef(true)

  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false }
  }, [])
  useEffect(() => {
    if (!error) return
    alertRef.current?.focus({ preventScroll: true })
    alertRef.current?.scrollIntoView({ block: 'nearest', behavior: 'instant' })
  }, [error])
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState<CheckoutProvider | null>(null)
  const emailId = `paystack-email-${offerName.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`

  async function startCheckout(provider: CheckoutProvider) {
    if (busy) return
    setError('')
    setBusy(provider)
    try {
      const destination = await requestCoachingCheckout(provider, offerName, email)
      if (mounted.current) window.location.assign(destination)
    } catch (failure) {
      if (mounted.current) setError(failure instanceof Error ? failure.message : 'Checkout could not be started. Please try again.')
    } finally {
      if (mounted.current) setBusy(null)
    }
  }

  function submitPaystack(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void startCheckout('paystack')
  }

  return (
    <div className="space-y-5" data-testid="coaching-checkout-form" aria-busy={Boolean(busy)}>
      <p className="text-base leading-7 text-navy-600">
        Choose your payment method. After payment, return here to choose an available session time.
      </p>
      <form onSubmit={submitPaystack} className="space-y-3 rounded-2xl border border-navy-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-lg font-bold text-navy">Paystack</h4>
          <p className="text-lg font-bold text-navy">KES {priceKes.toLocaleString('en-KE')}</p>
        </div>
        <label className="block text-base font-semibold text-navy" htmlFor={emailId}>
          Email for Paystack receipt
        </label>
        <input
          id={emailId}
          type="email"
          name="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          inputMode="email"
          required
          disabled={Boolean(busy)}
          className="min-h-12 w-full rounded-xl border border-navy-200 bg-white px-4 py-3 text-base text-navy outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
          placeholder="you@example.com"
        />
        <Button type="submit" loading={busy === 'paystack'} disabled={Boolean(busy)} className="min-h-12 w-full">
          {busy === 'paystack' ? 'Opening Paystack...' : `Pay with Paystack (KES ${priceKes.toLocaleString('en-KE')})`}
        </Button>
      </form>
      <div className="space-y-3 rounded-2xl border border-navy-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h4 className="text-lg font-bold text-navy">PayPal</h4>
          <p className="text-lg font-bold text-navy">USD ${priceUsd.toLocaleString('en-US')}</p>
        </div>
        <p className="text-base leading-6 text-navy-600">Use the email address on your PayPal account. No email entry is needed above.</p>
        <Button type="button" onClick={() => void startCheckout('paypal')} loading={busy === 'paypal'} disabled={Boolean(busy)} variant="outline" className="min-h-12 w-full">
          {busy === 'paypal' ? 'Opening PayPal...' : `Pay with PayPal ($${priceUsd})`}
        </Button>
      </div>
      {error && (
        <div ref={alertRef} tabIndex={-1} role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-base leading-6 text-red-800">
          <p>{error}</p>
          <a href="/contact" className="mt-2 inline-flex min-h-12 items-center font-semibold underline underline-offset-4">Get help with payment</a>
        </div>
      )}
      {busy && <p role="status" className="text-base text-navy-600">Connecting securely. Please wait...</p>}
    </div>
  )
}
