import type { Metadata } from 'next'
import Link from 'next/link'
import { RegisterForm } from '@/components/forms/RegisterForm'

export const metadata: Metadata = {
  title: 'Create Account',
}

export default function RegisterPage() {
  return (
    <>
      <h1 className="mt-8 font-heading text-2xl font-bold text-cream">Create Your Account</h1>
      <div className="mt-8 rounded-2xl border border-navy-100 bg-white p-8 shadow-[0_24px_60px_rgba(15,27,45,0.35)]">
        <RegisterForm />
      </div>
      <p className="mt-6 text-sm text-cream/70">
        Already have an account?{' '}
        <Link href="/login" className="font-semibold text-gold hover:underline">
          Log in
        </Link>
      </p>
    </>
  )
}
