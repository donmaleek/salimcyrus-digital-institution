'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { coachingOffers, coachingCategories } from '@/lib/data/coaching-offers'

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

export interface BookingConfirmPrefill {
  name: string
  email: string
  offerName: string
  paymentReference: string
}

export function BookingConfirmForm({ prefill }: { prefill?: BookingConfirmPrefill } = {}) {
  const [slots, setSlots] = useState<Slot[] | null>(null)
  const [name, setName] = useState(prefill?.name ?? '')
  const [email, setEmail] = useState(prefill?.email ?? '')
  const [offerName, setOfferName] = useState(prefill?.offerName ?? coachingOffers[0].name)
  const [paymentReference, setPaymentReference] = useState(prefill?.paymentReference ?? '')
  const [slotId, setSlotId] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [confirmation, setConfirmation] = useState<{ id: string; accountLinked: boolean } | null>(null)
  const [slotsError, setSlotsError] = useState(false)
  const { showToast } = useToast()

  useEffect(() => {
    fetch('/api/booking/available-slots')
      .then((res) => {
        if (!res.ok) throw new Error('Availability request failed')
        return res.json()
      })
      .then((data) => setSlots(data.slots ?? []))
      .catch(() => {
        setSlotsError(true)
        setSlots([])
      })
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
          paymentReference,
          notes: notes.trim() || undefined,
          slotId: slotId || undefined,
        }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        showToast(body.error ?? 'Could not save your booking. Please try again.', 'error')
        return
      }

      const body = await res.json()
      setConfirmation({ id: body.booking.id, accountLinked: body.booking.accountLinked })
      if (slotId) {
        setSlots((prev) => (prev ? prev.filter((slot) => slot.id !== slotId) : prev))
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (confirmation) {
    return (
      <div className="rounded-2xl border border-navy-100 bg-white p-8 text-center" data-testid="booking-confirmed">
        <p className="font-heading text-xl font-semibold text-navy">Payment verified. Booking confirmed.</p>
        <p className="mt-3 text-navy-600">
          {slotId
            ? 'Your selected time is reserved.'
            : 'Your session is saved. Our team will contact you to agree on a time.'}
        </p>
        <p className="mt-3 text-sm text-navy-400">Confirmation: {confirmation.id}</p>
        {confirmation.accountLinked ? (
          <Button href={`/dashboard/my-bookings/${confirmation.id}`} variant="outline" className="mt-6">
            View My Booking
          </Button>
        ) : (
          <p className="mt-4 text-sm leading-6 text-navy-500">
            We will send updates to {email}. Dashboard access is available when the payment email belongs to your signed-in account.
          </p>
        )}
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
            readOnly={Boolean(prefill)}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-3 min-h-12 w-full rounded-none border border-navy-200 bg-white px-4 py-3 text-base text-navy focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold/30 read-only:bg-navy-50 read-only:text-navy-500"
          />
        </div>
      </div>

      <div>
        <label htmlFor="booking-payment-reference" className="block font-semibold text-navy">
          Payment reference
        </label>
        <input
          id="booking-payment-reference"
          required
          autoComplete="off"
          readOnly={Boolean(prefill)}
          value={paymentReference}
          onChange={(e) => setPaymentReference(e.target.value)}
          placeholder="Found on your Paystack receipt"
          aria-describedby="booking-payment-reference-help"
          className="mt-3 min-h-12 w-full rounded-none border border-navy-200 bg-white px-4 py-3 text-base text-navy placeholder:text-navy-300 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold/30 read-only:bg-navy-50 read-only:text-navy-500"
        />
        <p id="booking-payment-reference-help" className="mt-2 text-sm leading-6 text-navy-500">
          {prefill
            ? 'Confirmed automatically from your PayPal payment.'
            : 'We match this reference and email to a successful payment before scheduling your session.'}
        </p>
      </div>

      <div>
        <label htmlFor="booking-offer" className="block font-semibold text-navy">
          Which session did you pay for?
        </label>
        <select
          id="booking-offer"
          value={offerName}
          onChange={(e) => setOfferName(e.target.value)}
          disabled={Boolean(prefill)}
          className="mt-3 min-h-12 w-full rounded-none border border-navy-200 bg-white px-4 py-3 text-base text-navy focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold/30 disabled:bg-navy-50 disabled:text-navy-500"
        >
          {coachingCategories.map((category) => (
            <optgroup key={category.slug} label={category.name}>
              {coachingOffers
                .filter((offer) => offer.category === category.slug)
                .map((offer) => (
                  <option key={offer.name} value={offer.name}>
                    {offer.name}
                  </option>
                ))}
            </optgroup>
          ))}
        </select>
        {slotsError && (
          <p className="mt-2 text-sm leading-6 text-red-700" role="alert">
            Available times could not be loaded. You can still submit without a time and we will contact you to schedule.
          </p>
        )}
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
          placeholder="Your timezone or anything else Salim should know."
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
