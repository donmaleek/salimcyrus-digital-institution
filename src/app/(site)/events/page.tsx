import type { Metadata } from 'next'
import { Button } from '@/components/ui/Button'

export const metadata: Metadata = {
  title: 'Events',
  description: 'Paid seminars, workshops, and conferences with Salim Cyrus.',
}

export default function EventsPage() {
  return (
    <section className="bg-cream">
      <div className="mx-auto max-w-content px-6 py-20">
        <p className="font-body text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
          Events
        </p>
        <h1 className="mt-4 font-heading text-4xl font-bold text-navy sm:text-5xl">
          Seminars, Workshops &amp; Conferences
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-navy-600">
          Upcoming events will be listed here as they are scheduled, synced from the CMS calendar.
        </p>
        <div className="mt-14 rounded-2xl border border-dashed border-navy-200 bg-white p-10 text-center">
          <p className="text-navy-400">No events currently scheduled.</p>
          <Button href="/work-with-salim/speaking" variant="outline" className="mt-6">
            Invite Salim to Your Event
          </Button>
        </div>
      </div>
    </section>
  )
}
