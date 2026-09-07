import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { LoginForm } from '@/components/forms/LoginForm'
import { MemberBenefitsPanel } from '@/components/auth/MemberBenefitsPanel'
import { isSafeRedirectPath } from '@/lib/utils/safe-redirect'

export const metadata: Metadata = {
  title: 'Log In',
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: { callbackUrl?: string }
}) {
  const callbackUrl = searchParams.callbackUrl
  const isBookPurchase = isSafeRedirectPath(callbackUrl) && callbackUrl.startsWith('/books/')

  const form = (
    <div className="mx-auto w-full max-w-sm">
      <h1 className="mt-8 font-heading text-2xl font-bold text-cream">
        {isBookPurchase ? 'Log In to Buy This Book' : 'Welcome Back'}
      </h1>
      <div className="mt-8 rounded-2xl border border-navy-100 bg-white p-8 shadow-[0_24px_60px_rgba(15,27,45,0.35)]">
        <Suspense>
          <LoginForm />
        </Suspense>
      </div>
      <p className="mt-6 text-sm text-cream/70">
        No account?{' '}
        <Link
          href={callbackUrl ? `/register?callbackUrl=${encodeURIComponent(callbackUrl)}` : '/register'}
          className="font-semibold text-gold hover:underline"
        >
          Register
        </Link>
      </p>
      <p className="mt-2 text-sm text-cream/70">
        <Link href="/forgot-password" className="font-semibold text-gold hover:underline">
          Forgot password?
        </Link>
      </p>
    </div>
  )

  if (!isBookPurchase) return form

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_360px] lg:items-start">
      {form}
      <MemberBenefitsPanel />
    </div>
  )
}
