'use client'

import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'

function formatSlotTime(isoString: string): string {
  return new Date(isoString).toLocaleString('en-KE', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

interface Slot {
  id: string
  startTime: string
  durationMinutes: number
  isBooked: boolean
  booking: { name: string; email: string; offerName: string } | null
}

export function AvailabilityManager({ initialSlots }: { initialSlots: Slot[] }) {
  const [slots, setSlots] = useState(initialSlots)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [duration, setDuration] = useState(60)
  const [submitting, setSubmitting] = useState(false)
  const [filter, setFilter] = useState<'upcoming' | 'booked' | 'past'>('upcoming')
  const { showToast } = useToast()
  const now = Date.now()
  const upcoming = slots.filter((slot) => new Date(slot.startTime).getTime() >= now)
  const visibleSlots = slots.filter((slot) => {
    const isPast = new Date(slot.startTime).getTime() < now
    if (filter === 'past') return isPast
    if (filter === 'booked') return !isPast && slot.isBooked
    return !isPast
  })

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!date || !time) return

    setSubmitting(true)
    try {
      const startTime = new Date(`${date}T${time}`).toISOString()
      const res = await fetch('/api/admin/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startTime, durationMinutes: duration }),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        showToast(body.error ?? 'Could not add that slot.', 'error')
        return
      }

      const { slot } = await res.json()
      setSlots((prev) =>
        [...prev, { ...slot, booking: null }].sort(
          (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        )
      )
      setDate('')
      setTime('')
      showToast('Slot added.')
    } catch {
      showToast('Could not add that slot. Check your connection and try again.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/admin/availability?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        showToast(body.error ?? 'Could not remove that slot.', 'error')
        return
      }
      setSlots((prev) => prev.filter((slot) => slot.id !== id))
      showToast('Slot removed.')
    } catch {
      showToast('Could not remove that slot. Check your connection and try again.', 'error')
    }
  }

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ['Upcoming slots', upcoming.length],
          ['Open for booking', upcoming.filter((slot) => !slot.isBooked).length],
          ['Confirmed bookings', upcoming.filter((slot) => slot.isBooked).length],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-navy-100 bg-white p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-navy-400">{label}</p>
            <p className="mt-2 font-heading text-3xl font-bold text-navy">{value}</p>
          </div>
        ))}
      </div>
      <form
        onSubmit={handleSubmit}
        className="grid gap-4 rounded-2xl border border-navy-100 bg-white p-6 shadow-sm sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end"
      >
        <div className="sm:col-span-4">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-500">Open a session</p>
          <h2 className="mt-2 font-heading text-xl font-bold text-navy">Add bookable time</h2>
        </div>
        <label className="block text-sm font-medium text-navy-700">
          Date
          <input
            type="date"
            min={new Date().toLocaleDateString('en-CA')}
            required
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="mt-1 min-h-11 w-full rounded-lg border border-navy-200 px-3 py-2 text-navy focus:outline-none focus:ring-2 focus:ring-gold"
          />
        </label>
        <label className="block text-sm font-medium text-navy-700">
          Time
          <input
            type="time"
            required
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="mt-1 min-h-11 w-full rounded-lg border border-navy-200 px-3 py-2 text-navy focus:outline-none focus:ring-2 focus:ring-gold"
          />
        </label>
        <label className="block text-sm font-medium text-navy-700">
          Duration (min)
          <input
            type="number"
            min={15}
            max={480}
            step={15}
            required
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            className="mt-1 min-h-11 w-full rounded-lg border border-navy-200 px-3 py-2 text-navy focus:outline-none focus:ring-2 focus:ring-gold"
          />
        </label>
        <Button type="submit" disabled={submitting}>
          {submitting ? 'Adding…' : 'Add Slot'}
        </Button>
      </form>

      <div className="flex flex-wrap gap-2 border-b border-navy-100 pb-4">
        {(['upcoming', 'booked', 'past'] as const).map((option) => (
          <button key={option} type="button" onClick={() => setFilter(option)} className={`min-h-10 rounded-full px-4 text-sm font-semibold capitalize transition ${filter === option ? 'bg-navy text-white' : 'bg-white text-navy hover:bg-navy-50'}`}>{option}</button>
        ))}
      </div>

      <div className="space-y-3">
        {visibleSlots.length === 0 ? (
          <p className="text-sm text-navy-400">
            {filter === 'booked' ? 'No upcoming booked sessions.' : filter === 'past' ? 'No past availability slots.' : 'No upcoming availability slots. Add one above.'}
          </p>
        ) : (
          visibleSlots.map((slot) => (
            <div
              key={slot.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-navy-100 bg-white p-5 shadow-sm"
            >
              <div>
                <p className="font-semibold text-navy">
                  {formatSlotTime(slot.startTime)} · {slot.durationMinutes} min
                </p>
                {slot.booking ? (
                  <p className="mt-2 inline-flex rounded-full bg-navy-50 px-3 py-1 text-sm text-navy-600">
                    Booked by {slot.booking.name} ({slot.booking.email}) — {slot.booking.offerName}
                  </p>
                ) : (
                  <p className="mt-2 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">Open for booking</p>
                )}
              </div>
              {!slot.isBooked && (
                <Button variant="outline" size="sm" onClick={() => handleDelete(slot.id)}>
                  Remove
                </Button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
