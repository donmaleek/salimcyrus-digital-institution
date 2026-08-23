import type { Metadata } from 'next'
import Link from 'next/link'
import { RegisterForm } from '@/components/forms/RegisterForm'

export const metadata: Metadata = {
  title: 'Create Account',
}

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-cream px-6 py-16">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-heading text-xl font-bold text-navy">
          Salim Cyrus
        </Link>
        <h1 className="mt-8 font-heading text-2xl font-bold text-navy">Create Your Account</h1>
        <p className="mt-2 text-xs text-navy-400">
          Account creation is not yet connected to a real database — this form is UI-complete,
          pending backend wiring.
        </p>
        <div className="mt-8 rounded-2xl border border-navy-100 bg-white p-8">
          <RegisterForm />
        </div>
        <p className="mt-6 text-sm text-navy-500">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-gold-500 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </main>
  )
}
