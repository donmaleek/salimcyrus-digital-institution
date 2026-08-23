'use client'

import { useState, type FormEvent } from 'react'
import { signIn } from 'next-auth/react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('loading')
    const result = await signIn('credentials', { email, password, redirect: false })
    if (result?.error) {
      setStatus('error')
    } else {
      window.location.href = '/dashboard'
    }
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
      <Input
        label="Password"
        type="password"
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {status === 'error' && (
        <p className="text-sm text-red-600">Invalid email or password.</p>
      )}
      <Button type="submit" loading={status === 'loading'} className="justify-self-start">
        {status === 'loading' ? 'Signing in…' : 'Sign In'}
      </Button>
    </form>
  )
}
