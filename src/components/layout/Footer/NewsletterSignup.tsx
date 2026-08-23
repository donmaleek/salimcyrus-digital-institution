'use client'

import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/Button'

export function NewsletterSignup() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) throw new Error('Subscription failed')
      setStatus('success')
      setEmail('')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div>
      <h3 className="font-heading text-sm font-semibold uppercase tracking-wide text-cream/60">
        The Halisi Insight
      </h3>
      <p className="mt-2 max-w-xs text-sm text-cream/80">
        One Truth. One Question. One Transformation. Delivered weekly.
      </p>
      <form onSubmit={handleSubmit} className="mt-4 flex max-w-xs gap-2">
        <label htmlFor="footer-newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="footer-newsletter-email"
          type="email"
          required
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full rounded-full border border-cream/20 bg-navy-900 px-4 py-2 text-sm text-cream placeholder:text-cream/40 focus:outline-none focus:ring-2 focus:ring-gold"
        />
        <Button type="submit" size="sm" loading={status === 'loading'}>
          Join
        </Button>
      </form>
      {status === 'success' && (
        <p className="mt-2 text-sm text-gold">You&apos;re on the list — welcome.</p>
      )}
      {status === 'error' && (
        <p className="mt-2 text-sm text-red-400">Something went wrong. Please try again.</p>
      )}
    </div>
  )
}
