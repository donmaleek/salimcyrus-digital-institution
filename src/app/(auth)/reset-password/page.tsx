import type { Metadata } from 'next'
import Link from 'next/link'
import { ResetPasswordForm } from '@/components/forms/ResetPasswordForm'

export const metadata: Metadata = {
  title: 'Reset Password',
}

export default function ResetPasswordPage({
  searchParams,
}: {
  searchParams: { token?: string }
}) {
  const token = searchParams.token

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mt-8 font-heading text-2xl font-bold text-cream">Set a New Password</h1>
      <div className="mt-8 rounded-2xl border border-navy-100 bg-white p-8 shadow-[0_24px_60px_rgba(15,27,45,0.35)]">
        {token ? (
          <ResetPasswordForm token={token} />
        ) : (
          <p className="text-navy-600">
            This link is missing its reset token. Request a new one from the{' '}
            <Link href="/forgot-password" className="font-semibold text-gold-500 hover:underline">
              forgot password
            </Link>{' '}
            page.
          </p>
        )}
      </div>
    </div>
  )
}
