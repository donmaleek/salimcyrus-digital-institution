import type { Metadata } from 'next'
import Link from 'next/link'
import { LoginForm } from '@/components/forms/LoginForm'

export const metadata: Metadata = {
  title: 'Log In',
}

export default function LoginPage() {
  return (
    <>
      <h1 className="mt-8 font-heading text-2xl font-bold text-cream">Welcome Back</h1>
      <div className="mt-8 rounded-2xl border border-navy-100 bg-white p-8 shadow-[0_24px_60px_rgba(15,27,45,0.35)]">
        <LoginForm />
      </div>
      <p className="mt-6 text-sm text-cream/70">
        No account?{' '}
        <Link href="/register" className="font-semibold text-gold hover:underline">
          Register
        </Link>
      </p>
      <p className="mt-2 text-sm text-cream/70">
        <Link href="/forgot-password" className="font-semibold text-gold hover:underline">
          Forgot password?
        </Link>
      </p>
    </>
  )
}
