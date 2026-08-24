import type { Metadata } from 'next'
import { Button } from '@/components/ui/Button'
import { PageHero } from '@/components/layout/PageHero'
import { coachingOffers } from '@/lib/data/coaching-offers'
import { WHATSAPP_URL } from '@/lib/utils/constants'

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
    'Open the secure checkout page, review the current price, and complete payment.',
  ],
  [
    'Confirm',
    'Come back and confirm your booking — pick an open time slot right on the site, no back-and-forth needed.',
  ],
  [
    'Prepare',
    'Bring one honest outcome, the relevant context, and a willingness to make decisions.',
  ],
]

const preparation = [
  'What decision or repeated pattern needs attention now?',
  'What have you already tried, and what happened?',
  'What would a useful outcome from this session look like?',
  'What truth, choice, or responsibility might you be avoiding?',
]

const fitGuide = [
  {
    need: 'One immediate question',
    recommendation: 'Starter Session',
    reason:
      'Use 30 minutes to name the blocker and identify one defensible next move.',
  },
  {
    need: 'One decision requiring depth',
    recommendation: 'Clarity Session',
    reason:
      'Use 60 minutes to map the issue, test the options, and define a practical action.',
  },
  {
    need: 'A repeated pattern or major reset',
    recommendation: 'Deep Reset Session',
    reason:
      'Use 120 minutes to examine the root loop and build a structured reset plan.',
  },
  {
    need: 'Ongoing implementation support',
    recommendation: 'Private Coaching',
    reason:
      'Use a multiweek engagement for repeated practice, accountability, and review.',
  },
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
        <section className="bg-cream" aria-labelledby="orientation-heading">
          <div className="mx-auto grid max-w-content gap-12 px-6 py-20 sm:py-24 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
                Before You Choose
              </p>
              <h2
                id="orientation-heading"
                className="mt-3 font-heading text-4xl font-bold leading-tight text-navy sm:text-5xl"
              >
                Book for the outcome, not simply the available time.
              </h2>
            </div>
            <div className="space-y-6 text-lg leading-8 text-navy-600">
              <p>
                Each session is a different container for the same standard of
                work: diagnose what is actually happening, clarify the decision,
                and leave with a next step you can act on.
              </p>
              <p>
                Choose a shorter session when the question is already clear.
                Choose greater depth when the pattern is repeated, the decision
                carries more consequence, or implementation will require
                continued accountability.
              </p>
            </div>
          </div>
        </section>

        <section
          id="choose-session"
          className="scroll-mt-24 bg-white"
          aria-labelledby="sessions-heading"
        >
          <div className="mx-auto max-w-content px-6 py-20 sm:py-24">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
                Session Selection
              </p>
              <h2
                id="sessions-heading"
                className="mt-3 font-heading text-3xl font-bold text-navy sm:text-4xl"
              >
                Four ways to begin the work
              </h2>
              <p className="mt-5 text-lg leading-8 text-navy-600">
                Current pricing and payment details appear on the secure
                checkout page before purchase.
              </p>
            </div>
            <div
              className="mt-12 grid gap-px overflow-hidden border border-navy-200 bg-navy-200 sm:grid-cols-2 lg:grid-cols-4"
              data-testid="booking-offers"
            >
              {coachingOffers.map((offer, index) => (
                <article
                  key={offer.name}
                  className="flex min-h-[470px] flex-col bg-white p-7 sm:p-8"
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-heading text-sm font-bold text-gold-500">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="text-xs font-bold uppercase tracking-[0.14em] text-navy-400">
                      {offer.duration}
                    </span>
                  </div>
                  <h3 className="mt-8 font-heading text-2xl font-bold text-navy">
                    {offer.name}
                  </h3>
                  <p className="mt-3 leading-7 text-navy-600">
                    {offer.tagline}
                  </p>
                  <ul className="mt-7 space-y-3 border-t border-navy-200 pt-6">
                    {offer.points.map((point) => (
                      <li
                        key={point}
                        className="grid grid-cols-[18px_1fr] gap-2 text-sm leading-6 text-navy-600"
                      >
                        <span className="text-gold-500" aria-hidden>
                          +
                        </span>
                        {point}
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto pt-8">
                    <p className="mb-5 text-xs font-bold uppercase leading-5 tracking-[0.12em] text-navy-500">
                      Outcome: {offer.outcome}
                    </p>
                    <Button
                      href={offer.paystackUrl}
                      className="w-full"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Book {offer.duration}
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-navy text-cream" aria-labelledby="guide-heading">
          <div className="mx-auto max-w-content px-6 py-20 sm:py-24">
            <div className="grid gap-12 lg:grid-cols-[0.62fr_1.38fr] lg:gap-20">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">
                  Fit Guide
                </p>
                <h2
                  id="guide-heading"
                  className="mt-3 font-heading text-3xl font-bold sm:text-4xl"
                >
                  Match the session to the work in front of you.
                </h2>
                <p className="mt-5 text-lg leading-8 text-cream/70">
                  If two options seem equally suitable, choose the shorter first
                  session or ask on WhatsApp before paying.
                </p>
              </div>
              <ol className="border-t border-cream/20" data-testid="fit-guide">
                {fitGuide.map((item, index) => (
                  <li
                    key={item.need}
                    className="grid gap-3 border-b border-cream/20 py-6 sm:grid-cols-[48px_0.75fr_0.7fr_1.3fr] sm:gap-6"
                  >
                    <span className="font-heading font-bold text-gold">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <h3 className="font-semibold text-cream">{item.need}</h3>
                    <p className="font-heading text-lg font-semibold text-gold">
                      {item.recommendation}
                    </p>
                    <p className="leading-7 text-cream/70">{item.reason}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className="bg-cream" aria-labelledby="booking-heading">
          <div className="mx-auto grid max-w-content gap-12 px-6 py-20 sm:py-24 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
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

        <section className="bg-white" aria-labelledby="prepare-heading">
          <div className="mx-auto grid max-w-content gap-12 px-6 py-20 sm:py-24 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
                Prepare Well
              </p>
              <h2
                id="prepare-heading"
                className="mt-3 font-heading text-3xl font-bold text-navy sm:text-4xl"
              >
                Four questions worth answering before the session
              </h2>
              <p className="mt-5 text-lg leading-8 text-navy-600">
                You do not need a perfect story. You need enough honesty to name
                what matters.
              </p>
            </div>
            <ol className="border-t border-navy-200">
              {preparation.map((question, index) => (
                <li
                  key={question}
                  className="grid grid-cols-[48px_1fr] border-b border-navy-200 py-5"
                >
                  <span className="font-heading font-bold text-gold-500">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <p className="font-heading text-xl leading-8 text-navy">
                    {question}
                  </p>
                </li>
              ))}
            </ol>
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
                Review the current price and payment information on the secure
                checkout page before completing purchase. If you need help
                choosing, have an accessibility requirement, or need to confirm
                practical details, ask before booking.
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
