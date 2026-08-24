import type { Metadata } from 'next'
import { PageHero } from '@/components/layout/PageHero'
import { BookingConfirmForm } from '@/components/forms/BookingConfirmForm'

export const metadata: Metadata = {
  title: 'Confirm Your Booking',
  description: 'Already paid for a coaching session? Confirm your booking and choose a time.',
  robots: { index: false, follow: false },
}

export default function ConfirmBookingPage() {
  return (
    <>
      <PageHero
        eyebrow="Confirm Your Booking"
        title="Already Paid? Let's Get You Scheduled"
        description="Tell us which session you booked and, if a time works for you, pick one below. This is what gets your session onto Salim's calendar and into your dashboard."
      />
      <section className="bg-cream">
        <div className="mx-auto max-w-content px-6 py-20">
          <div className="max-w-xl rounded-2xl border border-navy-100 bg-white p-8">
            <BookingConfirmForm />
          </div>
        </div>
      </section>
    </>
  )
}
