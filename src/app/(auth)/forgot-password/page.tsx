import type { Metadata } from 'next'
import Link from 'next/link'
import { ForgotPasswordForm } from '@/components/forms/ForgotPasswordForm'

export const metadata: Metadata = {
  title: 'Reset Password',
}

export default function ForgotPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-cream px-6 py-16">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-heading text-xl font-bold text-navy">
          Salim Cyrus
        </Link>
        <h1 className="mt-8 font-heading text-2xl font-bold text-navy">Reset Your Password</h1>
        <p className="mt-2 text-xs text-navy-400">
          Not yet connected to a real auth provider — this form is UI-complete, pending backend
          wiring.
        </p>
        <div className="mt-8 rounded-2xl border border-navy-100 bg-white p-8">
          <ForgotPasswordForm />
        </div>
        <p className="mt-6 text-sm text-navy-500">
          <Link href="/login" className="font-semibold text-gold-500 hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </main>
  )
}
