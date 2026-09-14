'use client'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { PaybillClaimForm } from '@/components/payments/PaybillClaimForm'

export function CourseCheckoutForm({ courseId, email, priceKes, priceUsd }: { courseId: string; email: string; priceKes: number; priceUsd: number }) {
  const [busy, setBusy] = useState<'paystack' | 'paypal' | null>(null); const [error, setError] = useState('')
  async function start(provider: 'paystack' | 'paypal') {
    setBusy(provider); setError('')
    const endpoint = provider === 'paystack' ? '/api/courses/checkout' : '/api/courses/checkout-paypal'
    const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ courseId }) }).catch(() => null)
    if (!response) { setError('Could not connect to the payment service. Please try again.'); setBusy(null); return }
    const body = await response.json() as { authorizationUrl?: string; approvalUrl?: string; error?: string }
    const url = body.authorizationUrl ?? body.approvalUrl
    if (!response.ok || !url) { setError(body.error ?? 'Checkout could not be started.'); setBusy(null); return }
    window.location.assign(url)
  }
  return <div className="space-y-3" data-testid="course-checkout-form"><p className="text-sm text-navy-500">Buying as <strong className="text-navy">{email}</strong></p><Button type="button" onClick={() => start('paystack')} loading={busy === 'paystack'} disabled={Boolean(busy)} className="w-full">Pay with Paystack (KES {priceKes.toLocaleString()})</Button><Button type="button" variant="outline" onClick={() => start('paypal')} loading={busy === 'paypal'} disabled={Boolean(busy)} className="w-full">Pay with PayPal (${priceUsd})</Button>{error && <p role="alert" className="text-sm text-red-700">{error}</p>}<PaybillClaimForm offerType="course" courseId={courseId} amountKes={priceKes} /></div>
}
