'use client'

import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'

type State = 'idle' | 'confirming' | 'confirmed' | 'error'

export function PayPalDonationReturn() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('token')
  const [state, setState] = useState<State>('idle')
  const capturedRef = useRef<string | null>(null)

  useEffect(() => {
    if (!orderId || capturedRef.current === orderId) return
    capturedRef.current = orderId
    setState('confirming')

    fetch(`/api/payments/paypal-capture-donation?token=${encodeURIComponent(orderId)}`)
      .then((response) => setState(response.ok ? 'confirmed' : 'error'))
      .catch(() => setState('error'))
  }, [orderId])

  if (state === 'idle') return null

  return (
    <div
      className="bg-emerald-50 px-6 py-4 text-center text-sm font-semibold leading-6 text-emerald-900"
      role="status"
      data-testid="paypal-donation-return"
    >
      {state === 'confirming' && 'Confirming your PayPal payment…'}
      {state === 'confirmed' && 'Thank you! Your PayPal donation is confirmed.'}
      {state === 'error' && 'We could not confirm your PayPal payment. Please contact the team with your PayPal receipt.'}
    </div>
  )
}
