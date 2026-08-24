import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { PageHero } from '@/components/layout/PageHero'
import { coachingOffers, coachingProcess } from '@/lib/data/coaching-offers'
import { programs } from '@/lib/data/programs'
import { WHATSAPP_URL } from '@/lib/utils/constants'

export const metadata: Metadata = {
  title: 'Work With Salim',
  description:
    'Explore private coaching, transformation programs, speaking, and consulting with Salim Cyrus. Compare formats, focus areas, durations, and published pricing.',
}

const paths = [
  {
    number: '01',
    title: 'Private Coaching',
    description:
      'Focused one-to-one support for relationship decisions, identity, purpose, manhood, leadership, burnout, and personal direction.',
    bestFor:
      'A personal decision or repeating pattern that needs privacy and direct accountability.',
    formats: '30, 60, or 120 minutes, plus 4 to 8 week coaching',
    href: '/work-with-salim/coaching',
    action: 'Explore Coaching',
  },
  {
    number: '02',
    title: 'Speaking',
    description:
      'Keynotes, seminars, workshops, and facilitated conversations designed to move an audience from insight into responsible action.',
    bestFor:
      'Conferences, churches, companies, men’s gatherings, youth programs, and community events.',
    formats: 'Keynote, seminar, workshop, panel, or tailored session',
    href: '/work-with-salim/speaking',
    action: 'Book Salim to Speak',
  },
  {
    number: '03',
    title: 'Consulting',
    description:
      'Structured advisory work for leaders and organizations building healthier cultures, stronger accountability, and clearer decisions.',
    bestFor:
      'Teams, institutions, ministries, and communities facing leadership or people challenges.',
    formats: 'Strategic session, workshop series, or tailored engagement',
    href: '/work-with-salim/consulting',
    action: 'Explore Consulting',
  },
]

const coachingAreas = [
  {
    title: 'Relationships and marriage',
    detail:
      'Clarity, communication, trust, betrayal, conflict, preparation, and emotional maturity.',
  },
  {
    title: 'Life and purpose',
    detail:
      'Identity, calling, direction, personal growth, decision-making, and the next responsible move.',
  },
  {
    title: 'Manhood and leadership',
    detail:
      'Character, responsibility, discipline, leadership, and purpose-driven masculinity.',
  },
]

const speakingTopics = [
  'Relationships and marriage',
  'Manhood and responsibility',
  'Leadership and accountability',
  'Kingdom and purpose',
  'Personal development',
  'Youth formation',
  'Corporate culture',
  'Community transformation',
]

const questions = [
  {
    question: 'I have one urgent decision. Where should I begin?',
    answer:
      'Choose a 30-minute Starter Session for one focused blocker or a 60-minute Clarity Session when the decision needs more context and a practical weekly plan.',
  },
  {
    question: 'I keep returning to the same pattern. What fits best?',
    answer:
      'A 120-minute Deep Reset Session is designed to locate the root loop and establish a reset practice. Private Coaching adds weekly support when the change needs sustained accountability.',
  },
  {
    question: 'Can an organization request a tailored engagement?',
    answer:
      'Yes. Speaking and consulting engagements can be shaped around the audience, the event objective, the leadership challenge, the location, and the available format.',
  },
  {
    question: 'Are program prices published?',
    answer:
      'Yes. Current published prices are shown below in Kenyan shillings and US dollars. Final payment and availability are confirmed on the linked program page.',
  },
]

const formatPrice = (amount: number, currency: 'KES' | 'USD') =>
  `${currency} ${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(amount)}`

export default function WorkWithSalimPage() {
  return (
    <>
      <PageHero
        eyebrow="Work With Salim"
        title="Choose the Right Path for the Work Ahead"
        description="Private coaching, transformation programs, speaking, and consulting built for clear decisions, responsible action, and lasting formation."
        actions={
          <>
            <Button href="/contact" size="lg">
              Start an Enquiry
            </Button>
            <Button href={WHATSAPP_URL} variant="outline-inverse" size="lg">
              Message on WhatsApp
            </Button>
          </>
        }
      />

      <main data-testid="work-with-salim-content">
        <section
          className="bg-cream"
          aria-labelledby="engagement-paths-heading"
        >
          <div className="mx-auto max-w-content px-6 py-20 sm:py-24">
            <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
                  Ways to Work Together
                </p>
                <h2
                  id="engagement-paths-heading"
                  className="mt-3 font-heading text-4xl font-bold leading-tight text-navy sm:text-5xl"
                >
                  Start with the outcome, then choose the format.
                </h2>
                <p className="mt-6 max-w-md text-lg leading-relaxed text-navy-600">
                  The right engagement depends on who needs to change, the depth
                  of the issue, and whether the work is personal, collective, or
                  organizational.
                </p>
              </div>

              <div className="border-t border-navy-200">
                {paths.map((path) => (
                  <article
                    key={path.href}
                    className="border-b border-navy-200 py-8"
                  >
                    <div className="grid gap-5 sm:grid-cols-[52px_1fr]">
                      <span
                        className="font-heading text-xl font-bold text-gold-500"
                        aria-hidden
                      >
                        {path.number}
                      </span>
                      <div>
                        <h3 className="font-heading text-2xl font-semibold text-navy">
                          {path.title}
                        </h3>
                        <p className="mt-3 leading-7 text-navy-600">
                          {path.description}
                        </p>
                        <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
                          <div>
                            <dt className="font-bold uppercase tracking-[0.12em] text-navy-400">
                              Best for
                            </dt>
                            <dd className="mt-1 leading-6 text-navy-600">
                              {path.bestFor}
                            </dd>
                          </div>
                          <div>
                            <dt className="font-bold uppercase tracking-[0.12em] text-navy-400">
                              Available formats
                            </dt>
                            <dd className="mt-1 leading-6 text-navy-600">
                              {path.formats}
                            </dd>
                          </div>
                        </dl>
                        <Link
                          href={path.href}
                          className="mt-6 inline-flex min-h-11 items-center border-b-2 border-gold-500 font-semibold text-navy transition-colors hover:text-gold-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                        >
                          {path.action}
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white" aria-labelledby="coaching-heading">
          <div className="mx-auto max-w-content px-6 py-20 sm:py-24">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
                Private Coaching
              </p>
              <h2
                id="coaching-heading"
                className="mt-3 font-heading text-3xl font-bold text-navy sm:text-4xl"
              >
                Match the session to the depth of the decision
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-navy-600">
                Begin with a single focused session or choose an ongoing
                engagement when the work requires practice, review, and
                accountability between conversations.
              </p>
            </div>

            <div className="mt-12 overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-left">
                <thead>
                  <tr className="border-y border-navy-200 text-xs uppercase tracking-[0.14em] text-navy-400">
                    <th className="py-4 pr-6 font-bold">Format</th>
                    <th className="px-6 py-4 font-bold">Time</th>
                    <th className="px-6 py-4 font-bold">Use it for</th>
                    <th className="py-4 pl-6 font-bold">Expected takeaway</th>
                  </tr>
                </thead>
                <tbody>
                  {coachingOffers.map((offer) => (
                    <tr
                      key={offer.name}
                      className="border-b border-navy-200 align-top"
                    >
                      <th className="py-6 pr-6 font-heading text-lg font-semibold text-navy">
                        {offer.name}
                      </th>
                      <td className="px-6 py-6 font-semibold text-gold-500">
                        {offer.duration}
                      </td>
                      <td className="px-6 py-6 leading-6 text-navy-600">
                        {offer.tagline}
                      </td>
                      <td className="py-6 pl-6 leading-6 text-navy-600">
                        {offer.outcome}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-12 grid gap-8 border-t border-navy-200 pt-10 md:grid-cols-3">
              {coachingAreas.map((area) => (
                <article key={area.title}>
                  <h3 className="font-heading text-xl font-semibold text-navy">
                    {area.title}
                  </h3>
                  <p className="mt-3 leading-7 text-navy-600">{area.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          className="bg-navy text-cream"
          aria-labelledby="process-heading"
        >
          <div className="mx-auto max-w-content px-6 py-20 sm:py-24">
            <div className="grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">
                  The Method
                </p>
                <h2
                  id="process-heading"
                  className="mt-3 font-heading text-3xl font-bold sm:text-4xl"
                >
                  Every engagement moves toward action
                </h2>
                <p className="mt-5 max-w-md text-lg leading-relaxed text-cream/75">
                  The conversation is not the outcome. The outcome is a clearer
                  decision, a practical structure, and visible follow-through.
                </p>
              </div>
              <ol className="border-t border-cream/20">
                {coachingProcess.map((step, index) => (
                  <li
                    key={step}
                    className="grid grid-cols-[56px_1fr] border-b border-cream/20 py-5"
                  >
                    <span className="font-heading font-bold text-gold">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="font-heading text-xl font-semibold">
                      {step}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className="bg-cream" aria-labelledby="programs-heading">
          <div className="mx-auto max-w-content px-6 py-20 sm:py-24">
            <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
                  Transformation Programs
                </p>
                <h2
                  id="programs-heading"
                  className="mt-3 font-heading text-3xl font-bold text-navy sm:text-4xl"
                >
                  Structured paths for deeper formation
                </h2>
                <p className="mt-5 max-w-md text-lg leading-relaxed text-navy-600">
                  Programs combine teaching, exercises, and accountability
                  around one defined area of growth. Published prices are shown
                  for clear comparison.
                </p>
                <Button
                  href="/academy/masterclasses"
                  variant="outline"
                  className="mt-8"
                >
                  View All Programs
                </Button>
              </div>

              <div
                className="border-t border-navy-200"
                data-testid="program-list"
              >
                {programs.map((program) => (
                  <article
                    key={program.slug}
                    className="border-b border-navy-200 py-7"
                  >
                    <div className="flex flex-wrap items-baseline justify-between gap-3">
                      <h3 className="font-heading text-xl font-semibold text-navy">
                        {program.name}
                      </h3>
                      <span className="text-xs font-bold uppercase tracking-[0.14em] text-gold-500">
                        {program.duration}
                      </span>
                    </div>
                    <p className="mt-2 font-semibold text-navy-700">
                      {program.focus}
                    </p>
                    <p className="mt-2 leading-7 text-navy-600">
                      {program.description}
                    </p>
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
                      <p className="text-sm font-bold text-navy">
                        {formatPrice(program.priceKes, 'KES')} /{' '}
                        {formatPrice(program.priceUsd, 'USD')}
                        {program.recurring ? ' per month' : ''}
                      </p>
                      <Link
                        href={`/academy/masterclasses/${program.slug}`}
                        className="inline-flex min-h-11 items-center font-semibold text-navy underline decoration-gold-500 decoration-2 underline-offset-4 hover:text-gold-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                      >
                        Program details
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white" aria-labelledby="speaking-heading">
          <div className="mx-auto max-w-content px-6 py-20 sm:py-24">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
                  Speaking and Consulting
                </p>
                <h2
                  id="speaking-heading"
                  className="mt-3 font-heading text-3xl font-bold text-navy sm:text-4xl"
                >
                  Build the engagement around the audience
                </h2>
                <p className="mt-5 text-lg leading-relaxed text-navy-600">
                  Salim works with event organizers and institutions to define
                  the audience, the problem, and the action the room should be
                  ready to take afterward.
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <Button href="/work-with-salim/speaking">
                    Speaking Enquiry
                  </Button>
                  <Button href="/work-with-salim/consulting" variant="outline">
                    Consulting Enquiry
                  </Button>
                </div>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-navy-400">
                  Available topic areas
                </p>
                <ul className="mt-5 grid border-t border-navy-200 sm:grid-cols-2">
                  {speakingTopics.map((topic, index) => (
                    <li
                      key={topic}
                      className="flex min-h-16 items-center gap-3 border-b border-navy-200 py-4 sm:odd:pr-6 sm:even:border-l sm:even:pl-6"
                    >
                      <span
                        className="font-heading text-sm font-bold text-gold-500"
                        aria-hidden
                      >
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="font-semibold text-navy-700">
                        {topic}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-navy-50" aria-labelledby="questions-heading">
          <div className="mx-auto max-w-content px-6 py-20 sm:py-24">
            <div className="grid gap-10 lg:grid-cols-[0.65fr_1.35fr] lg:gap-20">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
                  Choosing Well
                </p>
                <h2
                  id="questions-heading"
                  className="mt-3 font-heading text-3xl font-bold text-navy sm:text-4xl"
                >
                  Common starting questions
                </h2>
              </div>
              <dl className="border-t border-navy-200">
                {questions.map((item) => (
                  <div
                    key={item.question}
                    className="border-b border-navy-200 py-6"
                  >
                    <dt className="font-heading text-lg font-semibold text-navy">
                      {item.question}
                    </dt>
                    <dd className="mt-3 leading-7 text-navy-600">
                      {item.answer}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        <section className="bg-gold-50">
          <div className="mx-auto max-w-content px-6 py-20 text-center sm:py-24">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
              Not Sure Where to Begin?
            </p>
            <h2 className="mx-auto mt-3 max-w-3xl font-heading text-3xl font-bold text-navy sm:text-4xl">
              Share the decision, event, or organizational challenge in front of
              you.
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-navy-600">
              You will be directed to the most appropriate format based on the
              goal, depth, and people involved.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button href="/contact" size="lg">
                Start an Enquiry
              </Button>
              <Button href={WHATSAPP_URL} variant="outline" size="lg">
                Message on WhatsApp
              </Button>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
