import type { Metadata } from 'next'
import { Suspense } from 'react'
import { BookingIntro } from '@/components/layout/BookingIntro'
import { CoachingPurchaseReturn } from '@/components/payments/CoachingPurchaseReturn'

export const metadata: Metadata = {
  title: 'Confirm Your Booking',
  description: 'Already paid for a coaching session? Confirm your booking and choose a time.',
  robots: { index: false, follow: false },
}

export default function ConfirmBookingPage() {
  return (
    <>
      <BookingIntro
        title="Choose your session time"
        description="Confirm your payment and choose an available time. If no suitable time is listed, the team will help you schedule."
      />
      <section className="bg-cream">
        <div className="mx-auto max-w-content px-5 py-8 sm:px-6 sm:py-12">
          <div className="max-w-2xl rounded-xl border border-navy-100 bg-white p-5 sm:p-8">
            <Suspense>
              <CoachingPurchaseReturn />
            </Suspense>
          </div>
        </div>
      </section>
    </>
  )
}
