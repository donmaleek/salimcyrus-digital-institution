import type { Metadata } from 'next'
import { Suspense } from 'react'
import { PageHero } from '@/components/layout/PageHero'
import { CoachingPurchaseReturn } from '@/components/payments/CoachingPurchaseReturn'

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
        description="If you paid with PayPal, we confirm automatically below. If you paid another way, enter your email and payment reference, then choose an available time."
      />
      <section className="bg-cream">
        <div className="mx-auto max-w-content px-6 py-20">
          <div className="max-w-xl rounded-2xl border border-navy-100 bg-white p-8">
            <Suspense>
              <CoachingPurchaseReturn />
            </Suspense>
          </div>
        </div>
      </section>
    </>
  )
}
