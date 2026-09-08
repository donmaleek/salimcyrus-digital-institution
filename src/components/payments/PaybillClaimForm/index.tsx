'use client'

import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { MPESA_ACCOUNT_NUMBER, MPESA_PAYBILL_NUMBER } from '@/lib/utils/constants'
import { formatCurrency } from '@/lib/utils/currency'

type Status = 'idle' | 'submitting' | 'pending' | 'error'

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
      className="rounded-full border border-navy-200 px-2.5 py-1 text-xs font-semibold text-navy transition-colors hover:border-gold hover:text-gold-700"
      aria-label={`Copy ${label}`}
    >
      {copied ? 'Copied' : 'Copy'}
    </button>
  )
}

interface PaybillClaimFormProps {
  offerType: 'book' | 'teaching' | 'donation'
  bookSlug?: string
  teachingId?: string
  /** Fixed price for book/teaching; for donations this is left undefined
   * and the buyer enters their own amount instead. */
  amountKes?: number
}

export function PaybillClaimForm({ offerType, bookSlug, teachingId, amountKes }: PaybillClaimFormProps) {
  const [expanded, setExpanded] = useState(false)
  const [mpesaCode, setMpesaCode] = useState('')
  const [donationAmount, setDonationAmount] = useState('')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [evidence, setEvidence] = useState<File | null>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')

  function handleEvidence(event: ChangeEvent<HTMLInputElement>) {
    setEvidence(event.target.files?.[0] ?? null)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setStatus('submitting')

    const form = new FormData()
    form.set('offerType', offerType)
    if (bookSlug) form.set('bookSlug', bookSlug)
    if (teachingId) form.set('teachingId', teachingId)
    form.set('mpesaCode', mpesaCode)
    if (offerType === 'donation') {
      form.set('amountKes', donationAmount)
      form.set('email', email)
      form.set('name', name)
    }
    if (evidence) form.set('evidence', evidence)

    const response = await fetch('/api/payments/paybill/claim', { method: 'POST', body: form }).catch(() => null)

    if (!response) {
      setError('Could not submit. Check your connection and try again.')
      setStatus('error')
      return
    }

    const payload = (await response.json().catch(() => ({}))) as { error?: string }
    if (!response.ok) {
      setError(payload.error ?? 'Could not submit your payment for review.')
      setStatus('error')
      return
    }

    setStatus('pending')
  }

  if (status === 'pending') {
    return (
      <div className="mt-4 rounded-xl border border-gold/40 bg-gold-50 p-4" data-testid="paybill-claim-pending" role="status">
        <p className="font-semibold text-navy">Submitted for review</p>
        <p className="mt-1 text-sm text-navy-600">
          We&apos;ll confirm your M-Pesa payment and grant access shortly. This is usually quick, but is not
          automatic.
        </p>
      </div>
    )
  }

  return (
    <div className="mt-4 rounded-xl border border-navy-200 bg-cream p-4" data-testid="paybill-claim-form">
      <p className="text-xs font-bold uppercase tracking-wider text-navy-400">M-Pesa Paybill</p>
      <dl className="mt-2 grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center justify-between gap-2">
          <div>
            <dt className="text-navy-400">Paybill</dt>
            <dd className="font-heading text-lg font-bold text-navy">{MPESA_PAYBILL_NUMBER}</dd>
          </div>
          <CopyValue value={MPESA_PAYBILL_NUMBER} label="Paybill number" />
        </div>
        <div className="flex items-center justify-between gap-2">
          <div>
            <dt className="text-navy-400">Account</dt>
            <dd className="font-heading text-lg font-bold text-navy">{MPESA_ACCOUNT_NUMBER}</dd>
          </div>
          <CopyValue value={MPESA_ACCOUNT_NUMBER} label="M-Pesa account" />
        </div>
      </dl>
      {amountKes !== undefined && (
        <p className="mt-2 text-sm text-navy-600">
          Pay <span className="font-semibold text-navy">{formatCurrency(amountKes)}</span>, then submit your M-Pesa
          confirmation below.
        </p>
      )}

      {!expanded ? (
        <Button type="button" variant="outline" size="sm" className="mt-3 w-full" onClick={() => setExpanded(true)}>
          I&apos;ve Paid, Submit Proof
        </Button>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          {offerType === 'donation' && (
            <>
              <label className="block text-sm font-semibold text-navy" htmlFor="paybill-donation-amount">
                Amount you paid (KES)
              </label>
              <input
                id="paybill-donation-amount"
                type="number"
                min={1}
                required
                value={donationAmount}
                onChange={(e) => setDonationAmount(e.target.value)}
                className="w-full rounded-lg border border-navy-200 px-3 py-2 text-navy focus:outline-none focus:ring-2 focus:ring-gold/30"
              />
              <label className="block text-sm font-semibold text-navy" htmlFor="paybill-donation-email">
                Email
              </label>
              <input
                id="paybill-donation-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-navy-200 px-3 py-2 text-navy focus:outline-none focus:ring-2 focus:ring-gold/30"
              />
              <label className="block text-sm font-semibold text-navy" htmlFor="paybill-donation-name">
                Name
              </label>
              <input
                id="paybill-donation-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-navy-200 px-3 py-2 text-navy focus:outline-none focus:ring-2 focus:ring-gold/30"
              />
            </>
          )}
          <label className="block text-sm font-semibold text-navy" htmlFor="paybill-mpesa-code">
            M-Pesa confirmation code
          </label>
          <input
            id="paybill-mpesa-code"
            type="text"
            required
            minLength={6}
            placeholder="e.g. QGH7XXXXX1"
            value={mpesaCode}
            onChange={(e) => setMpesaCode(e.target.value)}
            className="w-full rounded-lg border border-navy-200 px-3 py-2 text-navy focus:outline-none focus:ring-2 focus:ring-gold/30"
          />
          <label className="block text-sm font-semibold text-navy" htmlFor="paybill-evidence">
            Screenshot of the confirmation SMS <span className="font-normal text-navy-400">(optional)</span>
          </label>
          <input
            id="paybill-evidence"
            type="file"
            accept="image/webp,image/jpeg,image/png"
            onChange={handleEvidence}
            className="w-full text-sm text-navy-600"
          />
          {error && (
            <p role="alert" className="text-sm leading-6 text-red-700">
              {error}
            </p>
          )}
          <Button type="submit" loading={status === 'submitting'} className="w-full">
            Submit for Review
          </Button>
        </form>
      )}
    </div>
  )
}
