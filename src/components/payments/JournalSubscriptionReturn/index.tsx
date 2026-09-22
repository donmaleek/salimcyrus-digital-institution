'use client'

import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { formatDate } from '@/lib/utils/formatting'

export function JournalSubscriptionReturn() {
  const params = useSearchParams()
  const token = params.get('token')
  const paystackReference = params.get('reference') ?? params.get('trxref')
  const paymentKey = paystackReference ?? token
  const seen = useRef<string | null>(null)
  const [state, setState] = useState<{ status: 'idle' | 'verifying' | 'error' | 'ready'; message?: string; expiresAt?: string }>({
    status: 'idle',
  })

  useEffect(() => {
    if (!paymentKey || seen.current === paymentKey) return
    seen.current = paymentKey
    setState({ status: 'verifying' })
    const endpoint = paystackReference
      ? `/api/journal/verify?reference=${encodeURIComponent(paystackReference)}`
      : `/api/journal/verify-paypal?token=${encodeURIComponent(token!)}`
    fetch(endpoint)
      .then(async (response) => {
        const body = (await response.json()) as { error?: string; expiresAt?: string }
        setState(
          response.ok
            ? { status: 'ready', expiresAt: body.expiresAt }
            : { status: 'error', message: body.error ?? 'Could not verify payment.' }
        )
      })
      .catch(() => setState({ status: 'error', message: 'Could not verify payment. Please contact support.' }))
  }, [paymentKey, paystackReference, token])

  if (state.status === 'idle') return null

  return (
    <div
      className="mt-4 rounded-xl border border-gold/40 bg-gold-50 p-4"
      role="status"
      data-testid="journal-subscription-return"
    >
      {state.status === 'verifying' && <p className="text-navy">Confirming your payment…</p>}
      {state.status === 'error' && (
        <p role="alert" className="text-red-700">
          {state.message}
        </p>
      )}
      {state.status === 'ready' && (
        <p className="font-bold text-navy">
          Subscription confirmed. You can read every essay in full
          {state.expiresAt ? ` until ${formatDate(new Date(state.expiresAt))}` : ''}.
        </p>
      )}
    </div>
  )
}
