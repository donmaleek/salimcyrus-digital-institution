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
        description="Use the email and payment reference on your Paystack receipt, then choose an available time. We verify every payment before adding a session to Salim's calendar."
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
