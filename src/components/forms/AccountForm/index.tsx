'use client'

import { useState, type FormEvent } from 'react'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'

interface AccountFormProps {
  initialName: string
  email: string
}

export function AccountForm({ initialName, email }: AccountFormProps) {
  const [name, setName] = useState(initialName)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/account', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (!res.ok) throw new Error('failed')
      setStatus('success')
    } catch {
      setStatus('error')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <Input label="Name" required value={name} onChange={(e) => setName(e.target.value)} />
      <Input label="Email" type="email" disabled value={email} />
      {status === 'success' && <p className="text-sm text-gold-600">Saved.</p>}
      {status === 'error' && <p className="text-sm text-red-600">Could not save changes.</p>}
      <Button type="submit" loading={status === 'loading'} variant="outline" className="justify-self-start">
        {status === 'loading' ? 'Saving…' : 'Save Changes'}
      </Button>
    </form>
  )
}
