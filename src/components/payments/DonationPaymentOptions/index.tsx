'use client'

import { FormEvent, useState } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { MPESA_ACCOUNT_NUMBER, MPESA_PAYBILL_NUMBER } from '@/lib/utils/constants'

function CopyValue({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1600)
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="rounded-full border border-navy-200 px-3 py-1.5 text-xs font-semibold text-navy transition-colors hover:border-gold hover:text-gold-700"
      aria-label={`Copy ${label}`}
    >
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

export function DonationPaymentOptions() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [paypalError, setPaypalError] = useState('')
  const [paypalLoading, setPaypalLoading] = useState(false)

  async function startPayPalCheckout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPaypalError('')
    setPaypalLoading(true)

    const form = new FormData(event.currentTarget)
    const response = await fetch('/api/payments/paypal-donate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amountUsd: form.get('amountUsd') }),
    }).catch(() => null)

    if (!response) {
      setPaypalError('Could not connect to PayPal. Please try again or use another method.')
      setPaypalLoading(false)
      return
    }

    const payload = (await response.json()) as { approvalUrl?: string; error?: string }
    if (!response.ok || !payload.approvalUrl) {
      setPaypalError(payload.error ?? 'PayPal checkout could not be started.')
      setPaypalLoading(false)
      return
    }

    window.location.assign(payload.approvalUrl)
  }

  async function startPaystackCheckout(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setLoading(true)

    const form = new FormData(event.currentTarget)
    const response = await fetch('/api/payments/initiate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: form.get('email'),
        amountKes: form.get('amountKes'),
      }),
    }).catch(() => null)

    if (!response) {
      setError(
        'Could not connect to checkout. Please try again or use another method.'
      )
      setLoading(false)
      return
    }

    const payload = (await response.json()) as {
      authorizationUrl?: string
      error?: string
    }
    if (!response.ok || !payload.authorizationUrl) {
      setError(payload.error ?? 'Checkout could not be started.')
      setLoading(false)
      return
    }

    window.location.assign(payload.authorizationUrl)
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3" data-testid="payment-options">
      <article className="flex flex-col rounded-2xl border border-navy-100 bg-white p-7 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-600">
          Recommended
        </p>
        <h3 className="mt-3 font-heading text-2xl font-bold text-navy">
          Paystack
        </h3>
        <p className="mt-3 leading-7 text-navy-600">
          Pay securely by card or an available mobile-money option on Paystack’s
          hosted checkout.
        </p>
        <form className="mt-6 space-y-4" onSubmit={startPaystackCheckout}>
          <label
            className="block text-sm font-semibold text-navy"
            htmlFor="support-email"
          >
            Email for receipt
          </label>
          <input
            id="support-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="w-full rounded-xl border border-navy-200 bg-cream px-4 py-3 text-navy outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
            placeholder="you@example.com"
          />
          <label
            className="block text-sm font-semibold text-navy"
            htmlFor="support-amount"
          >
            Amount in KES
          </label>
          <input
            id="support-amount"
            name="amountKes"
            type="number"
            inputMode="numeric"
            min="100"
            step="1"
            required
            className="w-full rounded-xl border border-navy-200 bg-cream px-4 py-3 text-navy outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
            placeholder="1000"
          />
          {error && (
            <p role="alert" className="text-sm leading-6 text-red-700">
              {error}
            </p>
          )}
          <Button type="submit" loading={loading} className="w-full">
            Continue to Paystack
          </Button>
        </form>
      </article>

      <article className="flex flex-col rounded-2xl border border-navy-100 bg-white p-7 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-600">
          Kenya
        </p>
        <h3 className="mt-3 font-heading text-2xl font-bold text-navy">
          M-Pesa Paybill
        </h3>
        <p className="mt-3 leading-7 text-navy-600">
          Open M-Pesa, choose Lipa na M-Pesa, then Pay Bill. Enter the details
          exactly as shown.
        </p>
        <dl className="mt-6 space-y-4">
          <div className="flex items-center justify-between gap-4 border-b border-navy-100 pb-4">
            <div>
              <dt className="text-xs font-bold uppercase tracking-wider text-navy-400">
                Paybill
              </dt>
              <dd className="mt-1 font-heading text-2xl font-bold text-navy">
                {MPESA_PAYBILL_NUMBER}
              </dd>
            </div>
            <CopyValue value={MPESA_PAYBILL_NUMBER} label="Paybill number" />
          </div>
          <div className="flex items-center justify-between gap-4 border-b border-navy-100 pb-4">
            <div>
              <dt className="text-xs font-bold uppercase tracking-wider text-navy-400">
                Account
              </dt>
              <dd className="mt-1 font-heading text-2xl font-bold text-navy">
                {MPESA_ACCOUNT_NUMBER}
              </dd>
            </div>
            <CopyValue value={MPESA_ACCOUNT_NUMBER} label="M-Pesa account" />
          </div>
        </dl>
        <p className="mt-5 text-sm leading-6 text-navy-500">
          Confirm the recipient name in M-Pesa before entering your PIN, then
          retain the confirmation message.
        </p>
      </article>

      <article className="flex flex-col rounded-2xl border border-navy-100 bg-white p-7 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-600">
          International
        </p>
        <h3 className="mt-3 font-heading text-2xl font-bold text-navy">
          PayPal
        </h3>
        <p className="mt-3 leading-7 text-navy-600">
          Pay securely through PayPal&apos;s own checkout. PayPal doesn&apos;t
          support KES, so this is charged in USD.
        </p>
        <form className="mt-6 space-y-4" onSubmit={startPayPalCheckout}>
          <label className="block text-sm font-semibold text-navy" htmlFor="support-amount-usd">
            Amount in USD
          </label>
          <input
            id="support-amount-usd"
            name="amountUsd"
            type="number"
            inputMode="decimal"
            min="1"
            step="1"
            required
            className="w-full rounded-xl border border-navy-200 bg-cream px-4 py-3 text-navy outline-none transition focus:border-gold focus:ring-2 focus:ring-gold/20"
            placeholder="10"
          />
          {paypalError && (
            <p role="alert" className="text-sm leading-6 text-red-700">
              {paypalError}
            </p>
          )}
          <Button type="submit" loading={paypalLoading} variant="outline" className="w-full">
            Continue to PayPal
          </Button>
        </form>
      </article>

      <figure className="overflow-hidden rounded-2xl bg-navy lg:col-span-3">
        <Image
          src="/images/payments/mpesa-paybill.webp"
          alt={`Halisi Hub Connect M-Pesa Paybill ${MPESA_PAYBILL_NUMBER}, account ${MPESA_ACCOUNT_NUMBER}`}
          width={1200}
          height={1200}
          className="mx-auto h-auto w-full max-w-2xl"
          sizes="(max-width: 1024px) 100vw, 672px"
        />
      </figure>
    </div>
  )
}
