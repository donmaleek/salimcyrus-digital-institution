'use client'

import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { BookingConfirmForm, type BookingConfirmPrefill } from '@/components/forms/BookingConfirmForm'

type VerifyState =
  | { status: 'idle' }
  | { status: 'verifying' }
  | { status: 'ready'; prefill: BookingConfirmPrefill }
  | { status: 'error'; message: string }

export function CoachingPurchaseReturn() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('token')
  const offerName = searchParams.get('offerName')
  const [state, setState] = useState<VerifyState>({ status: 'idle' })
  const verifiedRef = useRef<string | null>(null)

  useEffect(() => {
    if (!orderId || !offerName || verifiedRef.current === orderId) return
    verifiedRef.current = orderId
    setState({ status: 'verifying' })

    fetch(`/api/coaching/verify-paypal?token=${encodeURIComponent(orderId)}&offerName=${encodeURIComponent(offerName)}`)
      .then(async (response) => {
        const payload = (await response.json()) as {
          offerName?: string
          email?: string
          name?: string
          paymentReference?: string
          error?: string
        }
        if (!response.ok || !payload.paymentReference || !payload.email) {
          setState({ status: 'error', message: payload.error ?? 'Could not verify payment.' })
          return
        }
        setState({
          status: 'ready',
          prefill: {
            name: payload.name ?? payload.email,
            email: payload.email,
            offerName: payload.offerName ?? offerName,
            paymentReference: payload.paymentReference,
          },
        })
      })
      .catch(() => setState({ status: 'error', message: 'Could not verify payment. Please contact support.' }))
  }, [orderId, offerName])

  if (state.status === 'idle') return <BookingConfirmForm />

  if (state.status === 'verifying') {
    return (
      <div className="rounded-2xl border border-navy-100 bg-white p-8 text-center" role="status">
        <p className="text-navy-700">Confirming your PayPal payment…</p>
      </div>
    )
  }

  if (state.status === 'error') {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-6" role="alert">
        <p className="font-semibold text-red-800">{state.message}</p>
        <p className="mt-2 text-sm text-red-700">
          If you were charged, contact support with your PayPal receipt and we will confirm manually.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 rounded-2xl border border-gold/40 bg-gold-50 p-4" role="status">
        <p className="font-semibold text-navy">Payment confirmed. Now pick your time.</p>
      </div>
      <BookingConfirmForm prefill={state.prefill} />
    </div>
  )
}
