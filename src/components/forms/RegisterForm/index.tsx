'use client'

import { useState, type FormEvent } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export function RegisterForm() {
  const [values, setValues] = useState({ name: '', email: '', password: '' })
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')

  function update(field: keyof typeof values) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setValues((prev) => ({ ...prev, [field]: e.target.value }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('loading')
    setError('')
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Could not create account. Try again.')
        setStatus('error')
        return
      }
      setStatus('success')
      window.location.href = '/login'
    } catch {
      setError('Could not create account. Try again.')
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
        minLength={8}
        value={values.password}
        onChange={update('password')}
      />
      {status === 'error' && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" loading={status === 'loading'} className="justify-self-start">
        {status === 'loading' ? 'Creating account…' : 'Create Account'}
      </Button>
    </form>
  )
}
