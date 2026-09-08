'use client'

import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'

type VerifyState =
  | { status: 'idle' }
  | { status: 'verifying' }
  | { status: 'ready'; teachingTitle: string }
  | { status: 'error'; message: string }

export function TeachingPurchaseReturn({ teachingId, watchUrl }: { teachingId: string; watchUrl: string }) {
  const searchParams = useSearchParams()
  const paystackReference = searchParams.get('reference') ?? searchParams.get('trxref')
  // PayPal's return_url gets ?token=<orderId>&PayerID=<id> appended automatically.
  const paypalOrderId = searchParams.get('token')
  const verifyEndpoint = paystackReference
    ? `/api/teachings/verify?reference=${encodeURIComponent(paystackReference)}&teachingId=${encodeURIComponent(teachingId)}`
    : paypalOrderId
      ? `/api/teachings/verify-paypal?token=${encodeURIComponent(paypalOrderId)}&teachingId=${encodeURIComponent(teachingId)}`
      : null
  const verifyKey = paystackReference ?? paypalOrderId
  const [state, setState] = useState<VerifyState>({ status: 'idle' })
  const verifiedRef = useRef<string | null>(null)

  useEffect(() => {
    if (!verifyEndpoint || !verifyKey || verifiedRef.current === verifyKey) return
    verifiedRef.current = verifyKey
    setState({ status: 'verifying' })

    fetch(verifyEndpoint)
      .then(async (response) => {
        const payload = (await response.json()) as { teachingTitle?: string; error?: string }
        if (!response.ok) {
          setState({ status: 'error', message: payload.error ?? 'Could not verify payment.' })
          return
        }
        setState({ status: 'ready', teachingTitle: payload.teachingTitle ?? '' })
      })
      .catch(() => setState({ status: 'error', message: 'Could not verify payment. Please contact support.' }))
  }, [verifyEndpoint, verifyKey])

  if (state.status === 'idle') return null

  return (
    <div
      className="mt-6 rounded-2xl border border-gold/40 bg-gold-50 p-6"
      data-testid="teaching-purchase-return"
      role="status"
    >
      {state.status === 'verifying' && <p className="text-navy-700">Confirming your payment…</p>}
      {state.status === 'ready' && (
        <>
          <p className="font-heading text-lg font-bold text-navy">Payment confirmed</p>
          <p className="mt-2 text-navy-700">This teaching is now in your library.</p>
          <Button href={watchUrl} size="lg" className="mt-4">
            Watch Now
          </Button>
        </>
      )}
      {state.status === 'error' && (
        <p role="alert" className="text-red-700">
          {state.message}
        </p>
      )}
    </div>
  )
}
