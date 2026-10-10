'use client'

import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/Button'

export function ParentalGuidanceSchoolRequestForm() {
  const [organizationName, setOrganizationName] = useState('')
  const [contactName, setContactName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError('')

    const response = await fetch('/api/parental-guidance/school-request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ organizationName, contactName, email, phone: phone || undefined, message }),
    }).catch(() => null)

    setSubmitting(false)

    if (!response || !response.ok) {
      const body = (await response?.json().catch(() => ({}))) as { error?: string }
      setError(body.error ?? 'Could not send your request. Please try again.')
      return
    }

    setSent(true)
  }

  if (sent) {
    return (
      <div className="rounded-xl border border-gold/40 bg-gold-50 p-5" data-testid="school-request-sent" role="status">
        <p className="font-semibold text-navy">Request sent</p>
        <p className="mt-1 text-sm text-navy-600">
          Salim&apos;s team will follow up by email to discuss scope, timing, and fees.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" data-testid="school-request-form">
      <label className="block text-sm font-semibold text-navy" htmlFor="school-org-name">
        School or organization name
      </label>
      <input
        id="school-org-name"
        type="text"
        required
        minLength={2}
        maxLength={200}
        value={organizationName}
        onChange={(e) => setOrganizationName(e.target.value)}
        className="w-full rounded-lg border border-navy-200 px-3 py-2 text-navy focus:outline-none focus:ring-2 focus:ring-gold/30"
      />
      <label className="block text-sm font-semibold text-navy" htmlFor="school-contact-name">
        Your name
      </label>
      <input
        id="school-contact-name"
        type="text"
        required
        minLength={2}
        maxLength={100}
        value={contactName}
        onChange={(e) => setContactName(e.target.value)}
        className="w-full rounded-lg border border-navy-200 px-3 py-2 text-navy focus:outline-none focus:ring-2 focus:ring-gold/30"
      />
      <label className="block text-sm font-semibold text-navy" htmlFor="school-email">
        Email
      </label>
      <input
        id="school-email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full rounded-lg border border-navy-200 px-3 py-2 text-navy focus:outline-none focus:ring-2 focus:ring-gold/30"
      />
      <label className="block text-sm font-semibold text-navy" htmlFor="school-phone">
        Phone <span className="font-normal text-navy-400">(optional)</span>
      </label>
      <input
        id="school-phone"
        type="tel"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="w-full rounded-lg border border-navy-200 px-3 py-2 text-navy focus:outline-none focus:ring-2 focus:ring-gold/30"
      />
      <label className="block text-sm font-semibold text-navy" htmlFor="school-message">
        What are you looking for?
      </label>
      <textarea
        id="school-message"
        required
        minLength={20}
        maxLength={1500}
        rows={4}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Tell us about your parent community, group size, and what you'd like a workshop to cover."
        className="w-full resize-y rounded-lg border border-navy-200 px-3 py-2 text-navy placeholder:text-navy-300 focus:outline-none focus:ring-2 focus:ring-gold/30"
      />
      <Button type="submit" loading={submitting} className="w-full">
        Send Request
      </Button>
      {error && (
        <p role="alert" className="text-sm text-red-700">
          {error}
        </p>
      )}
    </form>
  )
}
