import type { Metadata } from 'next'
import { BookingIntro } from '@/components/layout/BookingIntro'
import { WHATSAPP_URL } from '@/lib/utils/constants'
import { CoachingCategoryPicker } from '@/components/payments/CoachingCategoryPicker'
import { getCoachingCategories, getCoachingOffers } from '@/lib/data/coaching-catalog'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'Book a Session | Private Coaching with Salim Cyrus',
  description: 'Choose a coaching session, see the price, and book securely. Get help choosing on WhatsApp.',
}

export default async function BookNowPage() {
  const [categories, offers] = await Promise.all([getCoachingCategories(), getCoachingOffers()])
  return (
    <div data-testid="book-now-content">
      <BookingIntro title="Book your session" description="Choose a session, pay securely, then pick your date and time." />
      <section id="choose-session" className="scroll-mt-6 bg-navy-50" aria-label="Book your session">
        <div className="mx-auto max-w-content px-5 py-7 sm:px-6 sm:py-10">
          <div className="rounded-2xl border border-navy-100 bg-white p-4 sm:p-8">
            <CoachingCategoryPicker categories={categories} offers={offers} />
          </div>
          <div className="mt-6 flex flex-col gap-3 text-base leading-7 text-navy-600 sm:flex-row sm:items-center sm:justify-between">
            <p>Every price is shown before payment.</p>
            <a href={WHATSAPP_URL} className="inline-flex min-h-12 items-center font-semibold text-navy underline underline-offset-4">Need help choosing? WhatsApp us</a>
          </div>
          <details className="mt-5 border-t border-navy-200 pt-4 text-base leading-7 text-navy-600">
            <summary className="min-h-12 cursor-pointer py-3 font-semibold text-navy">About coaching, payments and scheduling</summary>
            <div className="max-w-3xl space-y-3 py-3">
              <p>Coaching is a structured educational and reflective engagement. It is not emergency support, therapy, medical treatment, legal advice, or financial advice.</p>
              <p>Pay with Paystack in KES or PayPal in USD. After payment is verified, choose an available date and time on the confirmation page to finish your booking.</p>
              <p>If you have an accessibility requirement or need practical details, <a href="/contact" className="font-semibold text-navy underline underline-offset-4">contact the team</a> before booking.</p>
              <a href="/refund-policy" className="inline-flex min-h-12 items-center font-semibold text-navy underline underline-offset-4">Refund &amp; cancellation policy</a>
            </div>
          </details>
        </div>
      </section>
    </div>
  )
}
