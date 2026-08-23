'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export default function RegisterPage() {
  const [values, setValues] = useState({ name: '', email: '', password: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  function update(field: keyof typeof values) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setValues((prev) => ({ ...prev, [field]: e.target.value }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      if (!res.ok) throw new Error('failed')
      setStatus('success')
      window.location.href = '/login'
    } catch {
      setStatus('error')
    }
  }

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
          <form onSubmit={handleSubmit} className="grid gap-4">
            <Input label="Name" required value={values.name} onChange={update('name')} />
            <Input
              label="Email"
              type="email"
              required
              value={values.email}
              onChange={update('email')}
            />
            <Input
              label="Password"
              type="password"
              required
              value={values.password}
              onChange={update('password')}
            />
            {status === 'error' && (
              <p className="text-sm text-red-600">Could not create account. Try again.</p>
            )}
            <Button type="submit" disabled={status === 'loading'} className="justify-self-start">
              {status === 'loading' ? 'Creating account…' : 'Create Account'}
            </Button>
          </form>
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
