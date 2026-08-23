'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSent(true)
  }

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
          {sent ? (
            <p className="text-navy-600">
              If an account exists for that email, a reset link has been sent.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="grid gap-4">
              <Input
                label="Email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button type="submit" className="justify-self-start">
                Send Reset Link
              </Button>
            </form>
          )}
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
