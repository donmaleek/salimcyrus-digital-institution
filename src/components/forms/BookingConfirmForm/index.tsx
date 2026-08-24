'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { coachingOffers } from '@/lib/data/coaching-offers'

interface Slot {
  id: string
  startTime: string
  durationMinutes: number
}

function formatSlot(isoString: string, durationMinutes: number): string {
  const start = new Date(isoString)
  return `${start.toLocaleString('en-KE', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })} (${durationMinutes} min)`
}

export function BookingConfirmForm() {
  const [slots, setSlots] = useState<Slot[] | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [offerName, setOfferName] = useState(coachingOffers[0].name)
  const [slotId, setSlotId] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [confirmed, setConfirmed] = useState(false)
  const { showToast } = useToast()

  useEffect(() => {
    fetch('/api/booking/available-slots')
      .then((res) => res.json())
      .then((data) => setSlots(data.slots ?? []))
      .catch(() => setSlots([]))
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)

    try {
      const res = await fetch('/api/booking/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          offerName,
          notes: notes.trim() || undefined,
          slotId: slotId || undefined,
        }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        showToast(body.error ?? 'Could not save your booking. Please try again.', 'error')
        return
      }

      setConfirmed(true)
      if (slotId) {
        setSlots((prev) => (prev ? prev.filter((slot) => slot.id !== slotId) : prev))
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (confirmed) {
    return (
      <div className="rounded-2xl border border-navy-100 bg-white p-8 text-center" data-testid="booking-confirmed">
        <p className="font-heading text-xl font-semibold text-navy">Booking recorded.</p>
        <p className="mt-3 text-navy-600">
          Your session is saved{slotId ? ' for the time you selected' : ''} and will show up in your
          dashboard under My Bookings once it&apos;s reviewed.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-7" data-testid="booking-confirm-form">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="booking-name" className="block font-semibold text-navy">
            Name
          </label>
          <input
            id="booking-name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-3 min-h-12 w-full rounded-none border border-navy-200 bg-white px-4 py-3 text-base text-navy focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold/30"
          />
        </div>
        <div>
          <label htmlFor="booking-email" className="block font-semibold text-navy">
            Email
          </label>
          <input
            id="booking-email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-3 min-h-12 w-full rounded-none border border-navy-200 bg-white px-4 py-3 text-base text-navy focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold/30"
          />
        </div>
      </div>

      <div>
        <label htmlFor="booking-offer" className="block font-semibold text-navy">
          Which session did you pay for?
        </label>
        <select
          id="booking-offer"
          value={offerName}
          onChange={(e) => setOfferName(e.target.value)}
          className="mt-3 min-h-12 w-full rounded-none border border-navy-200 bg-white px-4 py-3 text-base text-navy focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold/30"
        >
          {coachingOffers.map((offer) => (
            <option key={offer.name} value={offer.name}>
              {offer.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="booking-slot" className="block font-semibold text-navy">
          Choose a time {slots && slots.length === 0 ? '(none open right now — leave blank and we’ll reach out)' : ''}
        </label>
        <select
          id="booking-slot"
          value={slotId}
          onChange={(e) => setSlotId(e.target.value)}
          disabled={!slots || slots.length === 0}
          className="mt-3 min-h-12 w-full rounded-none border border-navy-200 bg-white px-4 py-3 text-base text-navy focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold/30 disabled:bg-navy-50 disabled:text-navy-300"
        >
          <option value="">
            {slots === null ? 'Loading available times…' : 'No preference / let us suggest a time'}
          </option>
          {slots?.map((slot) => (
            <option key={slot.id} value={slot.id}>
              {formatSlot(slot.startTime, slot.durationMinutes)}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="booking-notes" className="block font-semibold text-navy">
          Notes <span className="font-normal text-navy-400">(optional)</span>
        </label>
        <textarea
          id="booking-notes"
          rows={4}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Payment reference, timezone, or anything else useful."
          className="mt-3 w-full resize-y rounded-none border border-navy-200 bg-white px-4 py-3 text-base leading-7 text-navy placeholder:text-navy-300 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold/30"
        />
      </div>

      <div className="border-t border-navy-200 pt-6">
        <Button type="submit" size="lg" disabled={submitting}>
          {submitting ? 'Saving…' : 'Confirm My Booking'}
        </Button>
      </div>
    </form>
  )
}
