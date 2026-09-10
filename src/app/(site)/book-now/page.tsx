import type { Metadata } from 'next'
import { Button } from '@/components/ui/Button'
import { PageHero } from '@/components/layout/PageHero'
import { WHATSAPP_URL } from '@/lib/utils/constants'
import { CoachingCategoryPicker } from '@/components/payments/CoachingCategoryPicker'

export const metadata: Metadata = {
  title: 'Book Now | Private Coaching with Salim Cyrus',
  description:
    'Choose and book the private coaching session that fits your decision, pattern, transition, or accountability needs.',
}

const bookingSteps = [
  [
    'Choose',
    'Select the session depth that matches the issue you want to address.',
  ],
  [
    'Reserve',
    'Pay with PayPal, or M-Pesa Paybill with a quick review, right on this page.',
  ],
  [
    'Confirm',
    'Come back and confirm your booking, and pick an open time slot right on the site. No back-and-forth needed.',
  ],
  [
    'Prepare',
    'Bring one honest outcome, the relevant context, and a willingness to make decisions.',
  ],
]

export default function BookNowPage() {
  return (
    <>
      <PageHero
        eyebrow="Book Now"
        title="Choose the Depth Your Decision Requires"
        description="Private coaching for focused questions, difficult decisions, repeated patterns, and seasons that require structure, accountability, and action."
        actions={
          <>
            <Button href="#choose-session" size="lg">
              Choose a Session
            </Button>
            <Button href={WHATSAPP_URL} variant="outline-inverse" size="lg">
              Ask Before Booking
            </Button>
          </>
        }
      />

      <main data-testid="book-now-content">
        <section
          id="choose-session"
          className="scroll-mt-24 bg-white"
          aria-labelledby="sessions-heading"
        >
          <div className="mx-auto max-w-content px-6 py-16 sm:py-24">
            <div className="grid gap-8 border-b border-navy-200 pb-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20 lg:pb-12">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
                  Session Selection
                </p>
                <h2
                  id="sessions-heading"
                  className="mt-3 font-heading text-3xl font-bold text-navy sm:text-4xl"
                >
                  Choose the right engagement
                </h2>
              </div>
              <p className="max-w-2xl text-lg leading-8 text-navy-600 lg:pt-8">
                Start with the kind of support you need. Compare the available
                options, select one, then choose how to pay. Only the payment
                details for your choice will open.
              </p>
            </div>
            <div className="mt-8">
              <CoachingCategoryPicker />
            </div>
          </div>
        </section>

        <section className="bg-cream" aria-labelledby="booking-heading">
          <div className="mx-auto grid max-w-content gap-12 px-6 py-16 sm:py-20 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
                Booking Process
              </p>
              <h2
                id="booking-heading"
                className="mt-3 font-heading text-3xl font-bold text-navy sm:text-4xl"
              >
                From selection to a prepared conversation
              </h2>
            </div>
            <div>
              <ol
                className="border-t border-navy-200"
                data-testid="booking-process"
              >
                {bookingSteps.map(([title, description], index) => (
                  <li
                    key={title}
                    className="grid gap-3 border-b border-navy-200 py-6 sm:grid-cols-[48px_0.6fr_1.4fr] sm:gap-6"
                  >
                    <span className="font-heading font-bold text-gold-500">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <h3 className="font-heading text-xl font-semibold text-navy">
                      {title}
                    </h3>
                    <p className="leading-7 text-navy-600">{description}</p>
                  </li>
                ))}
              </ol>
              <div className="mt-8">
                <Button href="/book-now/confirm" size="lg">
                  Already Paid? Confirm Your Booking
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section
          className="bg-navy text-cream"
          aria-labelledby="boundaries-heading"
        >
          <div className="mx-auto grid max-w-content gap-12 px-6 py-20 sm:py-24 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">
                Before Payment
              </p>
              <h2
                id="boundaries-heading"
                className="mt-3 font-heading text-3xl font-bold sm:text-4xl"
              >
                Know what you are booking.
              </h2>
            </div>
            <div className="space-y-5 text-lg leading-8 text-cream/75">
              <p>
                Coaching is a structured educational and reflective engagement.
                It is not emergency support, therapy, medical treatment, legal
                advice, or financial advice.
              </p>
              <p>
                Prices are listed above each session. If you need help choosing,
                have an accessibility requirement, or need to confirm practical
                details, ask before booking.
              </p>
              <div className="flex flex-wrap gap-4 pt-2">
                <Button href={WHATSAPP_URL}>Ask on WhatsApp</Button>
                <Button href="/contact" variant="outline-inverse">
                  Contact the Team
                </Button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
