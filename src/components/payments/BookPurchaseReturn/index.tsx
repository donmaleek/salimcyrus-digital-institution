'use client'

import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'

type VerifyState =
  | { status: 'idle' }
  | { status: 'verifying' }
  | { status: 'ready'; downloadUrl: string; bookTitle: string }
  | { status: 'error'; message: string }

export function BookPurchaseReturn({ slug }: { slug: string }) {
  const searchParams = useSearchParams()
  const paystackReference = searchParams.get('reference') ?? searchParams.get('trxref')
  // PayPal's return_url gets ?token=<orderId>&PayerID=<id> appended automatically.
  const paypalOrderId = searchParams.get('token')
  const verifyEndpoint = paystackReference
    ? `/api/books/verify?reference=${encodeURIComponent(paystackReference)}&slug=${encodeURIComponent(slug)}`
    : paypalOrderId
      ? `/api/books/verify-paypal?token=${encodeURIComponent(paypalOrderId)}&slug=${encodeURIComponent(slug)}`
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
        const payload = (await response.json()) as {
          downloadUrl?: string
          bookTitle?: string
          error?: string
        }
        if (!response.ok || !payload.downloadUrl) {
          setState({ status: 'error', message: payload.error ?? 'Could not verify payment.' })
          return
        }
        setState({ status: 'ready', downloadUrl: payload.downloadUrl, bookTitle: payload.bookTitle ?? '' })
      })
      .catch(() => setState({ status: 'error', message: 'Could not verify payment. Please contact support.' }))
  }, [verifyEndpoint, verifyKey])

  if (state.status === 'idle') return null

  return (
    <div
      className="mt-6 rounded-2xl border border-gold/40 bg-gold-50 p-6"
      data-testid="book-purchase-return"
      role="status"
    >
      {state.status === 'verifying' && <p className="text-navy-700">Confirming your payment…</p>}
      {state.status === 'ready' && (
        <>
          <p className="font-heading text-lg font-bold text-navy">Payment confirmed</p>
          <p className="mt-2 text-navy-700">Your download is ready.</p>
          <Button href={state.downloadUrl} size="lg" className="mt-4">
            Download Your Book
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
