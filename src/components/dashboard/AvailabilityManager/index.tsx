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
  const { showToast } = useToast()

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
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/admin/availability?id=${id}`, { method: 'DELETE' })
    if (!res.ok) {
      const body = await res.json().catch(() => ({}))
      showToast(body.error ?? 'Could not remove that slot.', 'error')
      return
    }
    setSlots((prev) => prev.filter((slot) => slot.id !== id))
    showToast('Slot removed.')
  }

  return (
    <div className="space-y-10">
      <form
        onSubmit={handleSubmit}
        className="grid gap-4 rounded-2xl border border-navy-100 bg-white p-6 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end"
      >
        <label className="block text-sm font-medium text-navy-700">
          Date
          <input
            type="date"
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

      <div className="space-y-3">
        {slots.length === 0 ? (
          <p className="text-sm text-navy-400">No availability slots yet — add one above.</p>
        ) : (
          slots.map((slot) => (
            <div
              key={slot.id}
              className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-navy-100 bg-white p-4"
            >
              <div>
                <p className="font-semibold text-navy">
                  {formatSlotTime(slot.startTime)} · {slot.durationMinutes} min
                </p>
                {slot.booking ? (
                  <p className="mt-1 text-sm text-navy-500">
                    Booked by {slot.booking.name} ({slot.booking.email}) — {slot.booking.offerName}
                  </p>
                ) : (
                  <p className="mt-1 text-sm text-gold-500">Open</p>
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
