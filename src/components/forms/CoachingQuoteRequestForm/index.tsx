'use client'

import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import type { CoachingCategorySlug } from '@/lib/data/coaching-offers'

const MESSAGE_PLACEHOLDER: Record<CoachingCategorySlug, string> = {
  standard: 'Tell us what you are planning and how we can help.',
  'identity-alignment':
    'Tell us what you would like clarity and direction on before booking.',
  'single-motherhood-alignment':
    'Tell us what you would like support and direction on before booking.',
  individual: 'Tell us your country and city, and the dates that work for you.',
  couples: 'Tell us your country and city, and the dates that work for both of you.',
  group: 'Tell us the group size, the occasion, and your preferred dates.',
  'vip-summit': 'Tell us about the event, expected audience, topic, and date.',
}

interface CoachingQuoteRequestFormProps {
  category: Exclude<CoachingCategorySlug, 'standard'>
  tierLabel: string
}

export function CoachingQuoteRequestForm({ category, tierLabel }: CoachingQuoteRequestFormProps) {
  const [expanded, setExpanded] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const { showToast } = useToast()

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)

    const response = await fetch('/api/coaching/request-quote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, whatsapp: whatsapp || undefined, category, tierLabel, message }),
    }).catch(() => null)

    setSubmitting(false)

    if (!response || !response.ok) {
      showToast('Could not send your request. Please try again.', 'error')
      return
    }

    setSent(true)
  }

  if (sent) {
    return (
      <div className="mt-4 rounded-xl border border-gold/40 bg-gold-50 p-4" data-testid="quote-request-sent" role="status">
        <p className="font-semibold text-navy">Request sent</p>
        <p className="mt-1 text-sm text-navy-600">
          Salim&apos;s team will follow up by email or WhatsApp to discuss rates and availability.
        </p>
      </div>
    )
  }

  return (
    <div className="mt-4" data-testid="coaching-quote-request-form">
      {!expanded ? (
        <Button type="button" variant="outline" className="w-full" onClick={() => setExpanded(true)}>
          Request a Quote
        </Button>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-navy-200 bg-cream p-4">
          <label className="block text-sm font-semibold text-navy" htmlFor={`quote-name-${category}`}>
            Name
          </label>
          <input
            id={`quote-name-${category}`}
            type="text"
            required
            minLength={2}
            maxLength={100}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-navy-200 px-3 py-2 text-navy focus:outline-none focus:ring-2 focus:ring-gold/30"
          />
          <label className="block text-sm font-semibold text-navy" htmlFor={`quote-email-${category}`}>
            Email
          </label>
          <input
            id={`quote-email-${category}`}
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-navy-200 px-3 py-2 text-navy focus:outline-none focus:ring-2 focus:ring-gold/30"
          />
          <label className="block text-sm font-semibold text-navy" htmlFor={`quote-whatsapp-${category}`}>
            WhatsApp <span className="font-normal text-navy-400">(optional)</span>
          </label>
          <input
            id={`quote-whatsapp-${category}`}
            type="tel"
            placeholder="Include country code"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            className="w-full rounded-lg border border-navy-200 px-3 py-2 text-navy placeholder:text-navy-300 focus:outline-none focus:ring-2 focus:ring-gold/30"
          />
          <label className="block text-sm font-semibold text-navy" htmlFor={`quote-message-${category}`}>
            Details
          </label>
          <textarea
            id={`quote-message-${category}`}
            required
            minLength={20}
            maxLength={1500}
            rows={4}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={MESSAGE_PLACEHOLDER[category]}
            className="w-full resize-y rounded-lg border border-navy-200 px-3 py-2 text-navy placeholder:text-navy-300 focus:outline-none focus:ring-2 focus:ring-gold/30"
          />
          <Button type="submit" loading={submitting} className="w-full">
            Send Request
          </Button>
        </form>
      )}
    </div>
  )
}
