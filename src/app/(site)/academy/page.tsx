import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { PageHero } from '@/components/layout/PageHero'
import { programs } from '@/lib/data/programs'
import { WHATSAPP_URL } from '@/lib/utils/constants'
import { formatCurrency } from '@/lib/utils/currency'

export const metadata: Metadata = {
  title: 'Academy',
  description:
    'Explore Salim Cyrus Academy programs for identity, relationships, manhood, Kingdom thinking, discipline, leadership, and emotional restoration.',
}

const learningMethod = [
  {
    number: '01',
    title: 'Name the real issue',
    description:
      'Move past symptoms and identify the belief, pattern, wound, or decision beneath them.',
  },
  {
    number: '02',
    title: 'Learn a clear framework',
    description:
      'Organize the issue through principles that connect truth, reflection, and practical judgment.',
  },
  {
    number: '03',
    title: 'Practice the change',
    description:
      'Turn understanding into repeatable actions, conversations, boundaries, and daily disciplines.',
  },
  {
    number: '04',
    title: 'Review and strengthen',
    description:
      'Use accountability and evaluation to keep progress visible and correct what is not working.',
  },
]

const subjectAreas = [
  {
    title: 'Identity',
    detail:
      'False identities, purpose, calling, inner healing, and renewed thinking.',
  },
  {
    title: 'Relationships',
    detail:
      'Compatibility, communication, trust, boundaries, maturity, and wise commitment.',
  },
  {
    title: 'Manhood',
    detail:
      'Responsibility, discipline, courage, leadership, and self-mastery.',
  },
  {
    title: 'Kingdom',
    detail:
      'Identity, authority, dominion, revelation, and real-life application.',
  },
  {
    title: 'Execution',
    detail:
      'Habits, consistency, structure, accountability, and measurable action.',
  },
  {
    title: 'Restoration',
    detail:
      'Forgiveness, betrayal, emotional wounds, self-worth, and rebuilding trust.',
  },
]

const academyQuestions = [
  {
    question: 'Which programs are available now?',
    answer:
      'The Academy currently lists seven live, cohort, private, intensive, bootcamp, and membership programs. Each program page contains its current focus, format, price, and application link.',
  },
  {
    question: 'Are self-paced courses available?',
    answer:
      'Recorded self-paced courses are still in development. The live programs and masterclasses currently provide the most direct learning path and access to Salim.',
  },
  {
    question: 'Can I compare prices before choosing?',
    answer:
      'Yes. The Academy publishes prices in Kenyan shillings and US dollars. Membership prices are marked per month.',
  },
  {
    question: 'What if I am unsure which program fits?',
    answer:
      'Use the focus, duration, and curriculum highlights below to narrow the choice, then send an enquiry with the issue or outcome you want to work on.',
  },
]

export default function AcademyPage() {
  return (
    <>
      <PageHero
        eyebrow="Academy"
        title="Learning Designed to Become a Way of Life"
        description="Structured programs for identity, relationships, manhood, Kingdom thinking, discipline, leadership, and emotional restoration."
        actions={
          <>
            <Button href="#programs" size="lg">
              Explore Programs
            </Button>
            <Button href={WHATSAPP_URL} variant="outline-inverse" size="lg">
              Ask About the Academy
            </Button>
          </>
        }
      />

      <main data-testid="academy-content">
        <section
          className="bg-cream"
          aria-labelledby="academy-introduction-heading"
        >
          <div className="mx-auto max-w-content px-6 py-20 sm:py-24">
            <div className="grid gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
                  The Academy
                </p>
                <h2
                  id="academy-introduction-heading"
                  className="mt-3 font-heading text-4xl font-bold leading-tight text-navy sm:text-5xl"
                >
                  Information is the beginning, not the result.
                </h2>
              </div>
              <div className="space-y-6 text-lg leading-8 text-navy-600">
                <p>
                  Salim Cyrus Academy turns teaching into structured formation.
                  Every program is organized around a defined human problem, a
                  set of principles, and actions that can be practiced beyond
                  the learning environment.
                </p>
                <p>
                  The Academy serves people who want more than inspiration. It
                  is for learners prepared to examine their thinking, take
                  responsibility for their choices, and build new patterns in
                  relationships, leadership, purpose, and daily life.
                </p>
              </div>
            </div>

            <dl className="mt-14 grid border-y border-navy-200 sm:grid-cols-3">
              <div className="py-7 sm:pr-8">
                <dt className="font-heading text-4xl font-bold text-navy">
                  {programs.length}
                </dt>
                <dd className="mt-2 text-sm font-semibold uppercase tracking-[0.12em] text-navy-500">
                  Published programs
                </dd>
              </div>
              <div className="border-t border-navy-200 py-7 sm:border-l sm:border-t-0 sm:px-8">
                <dt className="font-heading text-4xl font-bold text-navy">6</dt>
                <dd className="mt-2 text-sm font-semibold uppercase tracking-[0.12em] text-navy-500">
                  Core subject areas
                </dd>
              </div>
              <div className="border-t border-navy-200 py-7 sm:border-l sm:border-t-0 sm:pl-8">
                <dt className="font-heading text-4xl font-bold text-navy">
                  KES + USD
                </dt>
                <dd className="mt-2 text-sm font-semibold uppercase tracking-[0.12em] text-navy-500">
                  Published pricing
                </dd>
              </div>
            </dl>
          </div>
        </section>

        <section
          className="bg-navy text-cream"
          aria-labelledby="method-heading"
        >
          <div className="mx-auto max-w-content px-6 py-20 sm:py-24">
            <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">
                  Learning Method
                </p>
                <h2
                  id="method-heading"
                  className="mt-3 font-heading text-3xl font-bold sm:text-4xl"
                >
                  From insight to formation
                </h2>
                <p className="mt-5 max-w-md text-lg leading-relaxed text-cream/75">
                  Each learning path connects honest diagnosis, clear teaching,
                  practical exercises, and accountable review.
                </p>
              </div>
              <ol className="border-t border-cream/20">
                {learningMethod.map((step) => (
                  <li
                    key={step.number}
                    className="grid gap-3 border-b border-cream/20 py-6 sm:grid-cols-[56px_0.7fr_1.3fr] sm:gap-6"
                  >
                    <span className="font-heading font-bold text-gold">
                      {step.number}
                    </span>
                    <h3 className="font-heading text-xl font-semibold">
                      {step.title}
                    </h3>
                    <p className="leading-7 text-cream/70">
                      {step.description}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className="bg-white" aria-labelledby="subjects-heading">
          <div className="mx-auto max-w-content px-6 py-20 sm:py-24">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
                What You Can Study
              </p>
              <h2
                id="subjects-heading"
                className="mt-3 font-heading text-3xl font-bold text-navy sm:text-4xl"
              >
                Six connected areas of human formation
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-navy-600">
                The subject areas overlap because real life does. Identity
                affects relationships, discipline affects leadership, and
                healing affects the decisions a person can sustain.
              </p>
            </div>
            <div className="mt-12 grid border-t border-navy-200 sm:grid-cols-2 lg:grid-cols-3">
              {subjectAreas.map((subject, index) => (
                <article
                  key={subject.title}
                  className="border-b border-navy-200 py-8 sm:odd:pr-8 sm:even:border-l sm:even:pl-8 lg:border-l lg:px-8 lg:first:border-l-0 lg:nth-[4]:border-l-0"
                >
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold-500">
                    Subject {String(index + 1).padStart(2, '0')}
                  </p>
                  <h3 className="mt-3 font-heading text-2xl font-semibold text-navy">
                    {subject.title}
                  </h3>
                  <p className="mt-3 leading-7 text-navy-600">
                    {subject.detail}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section
          id="programs"
          className="scroll-mt-24 bg-cream"
          aria-labelledby="programs-heading"
        >
          <div className="mx-auto max-w-content px-6 py-20 sm:py-24">
            <div className="grid gap-10 lg:grid-cols-[0.62fr_1.38fr] lg:gap-20">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
                  Current Programs
                </p>
                <h2
                  id="programs-heading"
                  className="mt-3 font-heading text-3xl font-bold text-navy sm:text-4xl"
                >
                  Choose by focus, format, and depth
                </h2>
                <p className="mt-5 max-w-md text-lg leading-relaxed text-navy-600">
                  Compare each program before opening its full curriculum and
                  application page.
                </p>
              </div>

              <div
                className="border-t border-navy-200"
                data-testid="academy-programs"
              >
                {programs.map((program, index) => (
                  <article
                    key={program.slug}
                    className="border-b border-navy-200 py-8"
                  >
                    <div className="grid gap-5 sm:grid-cols-[48px_1fr]">
                      <span
                        className="font-heading font-bold text-gold-500"
                        aria-hidden
                      >
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <div>
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-bold uppercase tracking-[0.14em] text-gold-500">
                              {program.tag}
                            </p>
                            <h3 className="mt-2 font-heading text-2xl font-semibold text-navy">
                              {program.name}
                            </h3>
                          </div>
                          <span className="text-xs font-bold uppercase tracking-[0.12em] text-navy-400">
                            {program.duration}
                          </span>
                        </div>
                        <p className="mt-3 font-semibold text-navy-700">
                          {program.focus}
                        </p>
                        <p className="mt-2 leading-7 text-navy-600">
                          {program.description}
                        </p>
                        <ul className="mt-5 grid gap-2 text-sm text-navy-600 sm:grid-cols-2">
                          {program.highlights.map((highlight) => (
                            <li key={highlight} className="flex gap-3">
                              <span
                                className="font-heading font-bold text-gold-500"
                                aria-hidden
                              >
                                +
                              </span>
                              <span>{highlight}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-navy-100 pt-5">
                          <p className="font-bold text-navy">
                            {formatCurrency(program.priceKes, 'KES')} /{' '}
                            {formatCurrency(program.priceUsd, 'USD')}
                            {program.recurring ? ' per month' : ''}
                          </p>
                          <Link
                            href={`/academy/masterclasses/${program.slug}`}
                            className="inline-flex min-h-11 items-center font-semibold text-navy underline decoration-gold-500 decoration-2 underline-offset-4 hover:text-gold-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                          >
                            View curriculum and apply
                          </Link>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white" aria-labelledby="formats-heading">
          <div className="mx-auto max-w-content px-6 py-20 sm:py-24">
            <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
              <div className="border-t-4 border-gold-500 bg-navy-50 p-8 sm:p-10">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
                  Available Now
                </p>
                <h2
                  id="formats-heading"
                  className="mt-3 font-heading text-3xl font-bold text-navy"
                >
                  Live programs and masterclasses
                </h2>
                <p className="mt-5 leading-7 text-navy-600">
                  Choose from flagship programs, private or cohort tracks,
                  bootcamps, intensives, and monthly memberships with direct
                  links to current details and payment.
                </p>
                <Button href="/academy/masterclasses" className="mt-8">
                  Browse Live Programs
                </Button>
              </div>
              <div className="border-t-4 border-navy-300 bg-navy-50 p-8 sm:p-10">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-navy-400">
                  In Development
                </p>
                <h2 className="mt-3 font-heading text-3xl font-bold text-navy">
                  Self-paced recorded courses
                </h2>
                <p className="mt-5 leading-7 text-navy-600">
                  Planned subjects include Relationship Mastery, Defining
                  Manhood, Kingdom Mentality, Purpose Discovery, Marriage
                  Intelligence, and Emotional Maturity.
                </p>
                <Button
                  href="/academy/courses"
                  variant="outline"
                  className="mt-8"
                >
                  View the Course Roadmap
                </Button>
              </div>
            </div>
          </div>
        </section>

        <section
          className="bg-navy-50"
          aria-labelledby="academy-questions-heading"
        >
          <div className="mx-auto max-w-content px-6 py-20 sm:py-24">
            <div className="grid gap-10 lg:grid-cols-[0.62fr_1.38fr] lg:gap-20">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
                  Before You Enroll
                </p>
                <h2
                  id="academy-questions-heading"
                  className="mt-3 font-heading text-3xl font-bold text-navy sm:text-4xl"
                >
                  Academy questions
                </h2>
              </div>
              <dl className="border-t border-navy-200">
                {academyQuestions.map((item) => (
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
              Choose With Clarity
            </p>
            <h2 className="mx-auto mt-3 max-w-3xl font-heading text-3xl font-bold text-navy sm:text-4xl">
              Tell us what you want to change, and we will help you identify the
              right learning path.
            </h2>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button href="/contact" size="lg">
                Ask About a Program
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
