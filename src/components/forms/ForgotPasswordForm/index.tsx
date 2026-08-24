'use client'

import { useState, type FormEvent } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'sent'>('idle')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('loading')

    try {
      await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
    } finally {
      // Always show the same confirmation, whether or not the account
      // exists, so this form can't be used to check registered emails.
      setStatus('sent')
    }
  }

  if (status === 'sent') {
    return (
      <p className="text-navy-600">
        If an account exists for that email, a reset link has been generated. Contact the team on
        WhatsApp if you don&apos;t hear back shortly.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <Input
        label="Email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <Button type="submit" loading={status === 'loading'} className="justify-self-start">
        {status === 'loading' ? 'Sending…' : 'Send Reset Link'}
      </Button>
    </form>
  )
}
