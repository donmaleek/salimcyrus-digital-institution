import type { Metadata } from 'next'
import Link from 'next/link'
import { ForgotPasswordForm } from '@/components/forms/ForgotPasswordForm'

export const metadata: Metadata = {
  title: 'Reset Password',
}

export default function ForgotPasswordPage() {
  return (
    <>
      <h1 className="mt-8 font-heading text-2xl font-bold text-cream">Reset Your Password</h1>
      <div className="mt-8 rounded-2xl border border-navy-100 bg-white p-8 shadow-[0_24px_60px_rgba(15,27,45,0.35)]">
        <ForgotPasswordForm />
      </div>
      <p className="mt-6 text-sm text-cream/70">
        <Link href="/login" className="font-semibold text-gold hover:underline">
          Back to login
        </Link>
      </p>
    </>
  )
}
