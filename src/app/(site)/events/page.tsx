import type { Metadata } from 'next'
import { Button } from '@/components/ui/Button'
import { PageHero } from '@/components/layout/PageHero'

export const metadata: Metadata = {
  title: 'Events',
  description: 'Paid seminars, workshops, and conferences with Salim Cyrus.',
}

export default function EventsPage() {
  return (
    <>
      <PageHero
        eyebrow="Events"
        title="Seminars, Workshops & Conferences"
        description="Transformational rooms built for serious conversation, practical wisdom, and decisive action."
      />
      <section className="bg-cream">
        <div className="mx-auto max-w-content px-6 py-20">
          <div className="mt-14 rounded-2xl border border-dashed border-navy-200 bg-white p-10 text-center">
            <p className="text-navy-400">No events currently scheduled.</p>
            <Button
              href="/work-with-salim/speaking"
              variant="outline"
              className="mt-6"
            >
              Invite Salim to Your Event
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
