'use client'

import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/Button'

interface CoachingTripDetailsFormProps {
  offerName: string
  variant: 'individual' | 'couples'
  onSubmitted: () => void
}

/**
 * Logistics intake shown before payment for a travel coaching offer
 * (Individual/Couples, Your Location, Outside Mombasa): county/town,
 * preferred date and time, and who's attending, so Salim's team can
 * arrange transport and accommodation ahead of the session. Submits to
 * /api/coaching/trip-details, independent of payment, then hands control
 * back to the parent (which reveals the payment options) via onSubmitted.
 */
export function CoachingTripDetailsForm({ offerName, variant, onSubmitted }: CoachingTripDetailsFormProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [location, setLocation] = useState('')
  const [preferredDate, setPreferredDate] = useState('')
  const [preferredTime, setPreferredTime] = useState('')
  const [participants, setParticipants] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setSubmitting(true)

    const response = await fetch('/api/coaching/trip-details', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        offerName,
        name,
        phone,
        email,
        location,
        preferredDate,
        preferredTime,
        participants: variant === 'couples' ? participants : undefined,
        notes: notes || undefined,
      }),
    }).catch(() => null)

    setSubmitting(false)

    if (!response || !response.ok) {
      const body = (await response?.json().catch(() => ({}))) ?? {}
      setError(body.error ?? 'Could not save your trip details. Please try again.')
      return
    }

    onSubmitted()
  }

  const idPrefix = `trip-${offerName.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}`

  return (
    <form onSubmit={handleSubmit} className="space-y-3" data-testid="coaching-trip-details-form">
      <p className="text-base font-semibold text-navy">
        We travel to you, so we need a few logistics details first.
      </p>

      <label className="block text-base font-semibold text-navy" htmlFor={`${idPrefix}-name`}>
        {variant === 'couples' ? 'Names of participants' : 'Your name'}
      </label>
      <input
        id={`${idPrefix}-name`}
        type="text"
        required
        minLength={2}
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="min-h-12 w-full rounded-lg border border-navy-200 px-4 py-3 text-base text-navy focus:outline-none focus:ring-2 focus:ring-gold/30"
      />

      <label className="block text-base font-semibold text-navy" htmlFor={`${idPrefix}-phone`}>
        Phone number
      </label>
      <input
        id={`${idPrefix}-phone`}
        type="tel"
        required
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="min-h-12 w-full rounded-lg border border-navy-200 px-4 py-3 text-base text-navy focus:outline-none focus:ring-2 focus:ring-gold/30"
      />

      <label className="block text-base font-semibold text-navy" htmlFor={`${idPrefix}-email`}>
        Email
      </label>
      <input
        id={`${idPrefix}-email`}
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="min-h-12 w-full rounded-lg border border-navy-200 px-4 py-3 text-base text-navy focus:outline-none focus:ring-2 focus:ring-gold/30"
      />

      <label className="block text-base font-semibold text-navy" htmlFor={`${idPrefix}-location`}>
        County / town / location
      </label>
      <input
        id={`${idPrefix}-location`}
        type="text"
        required
        minLength={2}
        value={location}
        onChange={(e) => setLocation(e.target.value)}
        className="min-h-12 w-full rounded-lg border border-navy-200 px-4 py-3 text-base text-navy focus:outline-none focus:ring-2 focus:ring-gold/30"
      />

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-base font-semibold text-navy" htmlFor={`${idPrefix}-date`}>
            Preferred date
          </label>
          <input
            id={`${idPrefix}-date`}
            type="date"
            required
            value={preferredDate}
            onChange={(e) => setPreferredDate(e.target.value)}
            className="min-h-12 w-full rounded-lg border border-navy-200 px-4 py-3 text-base text-navy focus:outline-none focus:ring-2 focus:ring-gold/30"
          />
        </div>
        <div>
          <label className="block text-base font-semibold text-navy" htmlFor={`${idPrefix}-time`}>
            Preferred time
          </label>
          <input
            id={`${idPrefix}-time`}
            type="time"
            required
            value={preferredTime}
            onChange={(e) => setPreferredTime(e.target.value)}
            className="min-h-12 w-full rounded-lg border border-navy-200 px-4 py-3 text-base text-navy focus:outline-none focus:ring-2 focus:ring-gold/30"
          />
        </div>
      </div>

      {variant === 'couples' && (
        <>
          <label className="block text-base font-semibold text-navy" htmlFor={`${idPrefix}-participants`}>
            Number of participants
          </label>
          <input
            id={`${idPrefix}-participants`}
            type="number"
            min={2}
            required
            value={participants}
            onChange={(e) => setParticipants(e.target.value)}
            className="min-h-12 w-full rounded-lg border border-navy-200 px-4 py-3 text-base text-navy focus:outline-none focus:ring-2 focus:ring-gold/30"
          />
        </>
      )}

      <label className="block text-base font-semibold text-navy" htmlFor={`${idPrefix}-notes`}>
        Any additional information <span className="font-normal text-navy-400">(optional)</span>
      </label>
      <textarea
        id={`${idPrefix}-notes`}
        rows={3}
        maxLength={1500}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        className="w-full resize-y rounded-lg border border-navy-200 px-4 py-3 text-base text-navy focus:outline-none focus:ring-2 focus:ring-gold/30"
      />

      {error && (
        <p role="alert" className="text-base leading-6 text-red-700">
          {error}
        </p>
      )}

      <Button type="submit" loading={submitting} className="min-h-12 w-full">
        Continue to Payment
      </Button>
    </form>
  )
}
