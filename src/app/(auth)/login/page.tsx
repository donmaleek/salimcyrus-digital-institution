import type { Metadata } from 'next'
import Link from 'next/link'
import { LoginForm } from '@/components/forms/LoginForm'

export const metadata: Metadata = {
  title: 'Log In',
}

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-cream px-6 py-16">
      <div className="w-full max-w-sm">
        <Link href="/" className="font-heading text-xl font-bold text-navy">
          Salim Cyrus
        </Link>
        <h1 className="mt-8 font-heading text-2xl font-bold text-navy">Welcome Back</h1>
        <div className="mt-8 rounded-2xl border border-navy-100 bg-white p-8">
          <LoginForm />
        </div>
        <p className="mt-6 text-sm text-navy-500">
          No account?{' '}
          <Link href="/register" className="font-semibold text-gold-500 hover:underline">
            Register
          </Link>
        </p>
        <p className="mt-2 text-sm text-navy-500">
          <Link href="/forgot-password" className="font-semibold text-gold-500 hover:underline">
            Forgot password?
          </Link>
        </p>
      </div>
    </main>
  )
}
