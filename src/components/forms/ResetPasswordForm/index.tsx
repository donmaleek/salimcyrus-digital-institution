'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

export function ResetPasswordForm({ token }: { token: string }) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [error, setError] = useState('')
  const router = useRouter()

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      setStatus('error')
      return
    }

    setStatus('loading')
    setError('')

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Could not reset your password.')
        setStatus('error')
        return
      }

      router.push('/login')
    } catch {
      setError('Could not reset your password. Try again.')
      setStatus('error')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <Input
        label="New Password"
        type="password"
        required
        minLength={8}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <Input
        label="Confirm New Password"
        type="password"
        required
        minLength={8}
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
      />
      {status === 'error' && <p className="text-sm text-red-600">{error}</p>}
      <Button type="submit" loading={status === 'loading'} className="justify-self-start">
        {status === 'loading' ? 'Resetting…' : 'Reset Password'}
      </Button>
    </form>
  )
}
