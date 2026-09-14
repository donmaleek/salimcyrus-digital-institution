'use client'
import { useEffect, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/Button'

export function CoursePurchaseReturn({ courseId }: { courseId: string }) {
  const params = useSearchParams(); const reference = params.get('reference') ?? params.get('trxref'); const token = params.get('token')
  const endpoint = reference ? `/api/courses/verify?reference=${encodeURIComponent(reference)}&courseId=${encodeURIComponent(courseId)}` : token ? `/api/courses/verify-paypal?token=${encodeURIComponent(token)}&courseId=${encodeURIComponent(courseId)}` : null
  const key = reference ?? token; const seen = useRef<string | null>(null)
  const [state, setState] = useState<{ status: 'idle' | 'verifying' | 'error' | 'ready'; message?: string; learnUrl?: string }>({ status: 'idle' })
  useEffect(() => { if (!endpoint || !key || seen.current === key) return; seen.current = key; setState({ status: 'verifying' }); fetch(endpoint).then(async (response) => { const body = await response.json() as { error?: string; learnUrl?: string }; setState(response.ok ? { status: 'ready', learnUrl: body.learnUrl } : { status: 'error', message: body.error ?? 'Could not verify payment.' }) }).catch(() => setState({ status: 'error', message: 'Could not verify payment. Please contact support.' })) }, [endpoint, key])
  if (state.status === 'idle') return null
  return <div className="mt-4 rounded-xl border border-gold/40 bg-gold-50 p-4" role="status" data-testid="course-purchase-return">{state.status === 'verifying' && <p className="text-navy">Confirming your payment…</p>}{state.status === 'error' && <p role="alert" className="text-red-700">{state.message}</p>}{state.status === 'ready' && <><p className="font-bold text-navy">Payment confirmed. Your course is ready.</p><Button href={state.learnUrl ?? '/dashboard/my-learning'} className="mt-3 w-full">Start Learning</Button></>}</div>
}
