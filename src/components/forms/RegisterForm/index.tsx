'use client'

import { useState, type FormEvent } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export function RegisterForm() {
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
  )
}
