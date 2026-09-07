import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { RegisterForm } from '@/components/forms/RegisterForm'
import { MemberBenefitsPanel } from '@/components/auth/MemberBenefitsPanel'
import { isSafeRedirectPath } from '@/lib/utils/safe-redirect'

export const metadata: Metadata = {
  title: 'Create Account',
}

export default function RegisterPage({
  searchParams,
}: {
  searchParams: { callbackUrl?: string }
}) {
  const callbackUrl = searchParams.callbackUrl
  const isBookPurchase = isSafeRedirectPath(callbackUrl) && callbackUrl.startsWith('/books/')

  const form = (
    <div className="mx-auto w-full max-w-sm">
      <h1 className="mt-8 font-heading text-2xl font-bold text-cream">
        {isBookPurchase ? 'Create an Account to Buy This Book' : 'Create Your Account'}
      </h1>
      <div className="mt-8 rounded-2xl border border-navy-100 bg-white p-8 shadow-[0_24px_60px_rgba(15,27,45,0.35)]">
        <Suspense>
          <RegisterForm />
        </Suspense>
      </div>
      <p className="mt-6 text-sm text-cream/70">
        Already have an account?{' '}
        <Link
          href={callbackUrl ? `/login?callbackUrl=${encodeURIComponent(callbackUrl)}` : '/login'}
          className="font-semibold text-gold hover:underline"
        >
          Log in
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
