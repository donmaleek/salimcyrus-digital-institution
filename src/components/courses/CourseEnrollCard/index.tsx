'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { CourseCheckoutForm } from '@/components/payments/CourseCheckoutForm'
import { CoursePurchaseReturn } from '@/components/payments/CoursePurchaseReturn'
import { formatCurrency } from '@/lib/utils/currency'

export function CourseEnrollCard({ courseId, slug, kind, priceKes, priceUsd, signedIn, email, enrolled }: { courseId: string; slug: string; kind: string; priceKes: number; priceUsd: number; signedIn: boolean; email?: string; enrolled: boolean }) {
  const [busy, setBusy] = useState(false); const [error, setError] = useState(''); const router = useRouter()
  const learnUrl = `/dashboard/my-learning/courses/${slug}`
  async function enrollFree() { setBusy(true); setError(''); const res = await fetch(`/api/courses/${courseId}/enroll`, { method: 'POST' }); const body = await res.json().catch(() => ({})) as { error?: string }; if (!res.ok) { setError(body.error ?? 'Could not enroll.'); setBusy(false); return } router.push(learnUrl); router.refresh() }
  return <aside className="rounded-2xl border border-navy-100 bg-white p-6 shadow-xl"><p className="text-xs font-bold uppercase tracking-[.18em] text-gold-700">Lifetime access</p><p className="mt-3 font-heading text-3xl font-bold text-navy">{priceKes === 0 ? 'Free' : formatCurrency(priceKes)}</p>{priceKes > 0 && <p className="text-sm text-navy-400">USD {priceUsd}</p>}<ul className="mt-5 space-y-2 text-sm text-navy-600"><li>✓ Learn at your own pace</li><li>✓ Progress saved automatically</li><li>✓ Return from your member dashboard</li></ul>
    <div className="mt-6">{enrolled ? <Button href={learnUrl} className="w-full">Continue Learning</Button> : !signedIn ? <Button href={`/login?callbackUrl=${encodeURIComponent(`/${kind === 'masterclass' ? 'academy/masterclasses' : 'academy/courses'}/${slug}`)}`} className="w-full">Sign In to Enroll</Button> : priceKes === 0 ? <Button type="button" loading={busy} onClick={enrollFree} className="w-full">Enroll Free</Button> : <><p className="mb-3 text-sm font-semibold text-navy">Pay securely, then start learning immediately after online payment.</p><CourseCheckoutForm courseId={courseId} email={email ?? ''} priceKes={priceKes} priceUsd={priceUsd} /></>}</div><CoursePurchaseReturn courseId={courseId} />{error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}</aside>
}
