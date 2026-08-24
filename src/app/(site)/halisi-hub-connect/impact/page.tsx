import type { Metadata } from 'next'
import { Button } from '@/components/ui/Button'
import { PageHero } from '@/components/layout/PageHero'

export const metadata: Metadata = {
  title: 'Impact and Accountability | Halisi Hub Connect',
  description:
    'See how Halisi Hub Connect defines, measures, and reports participation, formation, belonging, and contribution.',
}

const outcomeAreas = [
  [
    'Participation',
    'People reached through teaching, programs, mentorship, and community activity.',
  ],
  [
    'Formation',
    'Learning completed, personal practices adopted, and participant goals progressed.',
  ],
  [
    'Belonging',
    'Consistent engagement, peer relationships, and meaningful participation in community.',
  ],
  [
    'Contribution',
    'Volunteer service, partnerships, shared resources, and community initiatives delivered.',
  ],
  [
    'Continuity',
    'Programs sustained, leaders developed, and participants equipped to support others.',
  ],
  [
    'Stories',
    'Consent-based accounts that add human context to verified program data.',
  ],
]

const reportingPrinciples = [
  'Publish only figures that can be traced to a defined source',
  'Separate people reached from people actively engaged',
  'Distinguish activity completed from outcomes observed',
  'Protect participant privacy and request consent for personal stories',
  'State the reporting period and method beside every result',
]

export default function ImpactPage() {
  return (
    <>
      <PageHero
        eyebrow="Impact and Accountability"
        title="Measure the Work. Learn from It. Report It Honestly."
        description="Halisi Hub Connect is building an impact practice grounded in verified participation, observable progress, responsible storytelling, and clear public reporting."
      />
      <main data-testid="halisi-impact-content">
        <section className="bg-cream" aria-labelledby="impact-position-heading">
          <div className="mx-auto grid max-w-content gap-12 px-6 py-20 sm:py-24 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
                The Standard
              </p>
              <h2
                id="impact-position-heading"
                className="mt-3 font-heading text-4xl font-bold leading-tight text-navy sm:text-5xl"
              >
                Credibility begins before the first number is published.
              </h2>
            </div>
            <div className="space-y-6 text-lg leading-8 text-navy-600">
              <p>
                This page does not use empty counters or unverified claims.
                Public figures should follow a defined reporting period, a known
                source, and a clear explanation of what was counted.
              </p>
              <p>
                As programs and community initiatives mature, Halisi intends to
                report both reach and depth. That means recording who
                participated, what was delivered, what changed, and what still
                needs improvement.
              </p>
            </div>
          </div>
        </section>
        <section className="bg-white" aria-labelledby="outcomes-heading">
          <div className="mx-auto max-w-content px-6 py-20 sm:py-24">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
              Outcome Framework
            </p>
            <h2
              id="outcomes-heading"
              className="mt-3 max-w-3xl font-heading text-3xl font-bold text-navy sm:text-4xl"
            >
              Six areas that create a fuller picture of institutional impact
            </h2>
            <dl
              className="mt-12 grid gap-px overflow-hidden border border-navy-200 bg-navy-200 sm:grid-cols-2 lg:grid-cols-3"
              data-testid="impact-outcomes"
            >
              {outcomeAreas.map(([term, detail], index) => (
                <div key={term} className="min-h-[230px] bg-white p-8">
                  <p className="font-heading text-sm font-bold text-gold-500">
                    {String(index + 1).padStart(2, '0')}
                  </p>
                  <dt className="mt-7 font-heading text-2xl font-semibold text-navy">
                    {term}
                  </dt>
                  <dd className="mt-4 leading-7 text-navy-600">{detail}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
        <section
          className="bg-navy text-cream"
          aria-labelledby="reporting-heading"
        >
          <div className="mx-auto grid max-w-content gap-12 px-6 py-20 sm:py-24 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">
                Reporting Principles
              </p>
              <h2
                id="reporting-heading"
                className="mt-3 font-heading text-3xl font-bold sm:text-4xl"
              >
                Evidence before promotion
              </h2>
              <p className="mt-5 text-lg leading-8 text-cream/70">
                The first public report will be published when the underlying
                records can support it.
              </p>
            </div>
            <ol className="border-t border-cream/20">
              {reportingPrinciples.map((principle, index) => (
                <li
                  key={principle}
                  className="grid grid-cols-[48px_1fr] border-b border-cream/20 py-5"
                >
                  <span className="font-heading font-bold text-gold">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="font-semibold leading-7 text-cream/85">
                    {principle}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </section>
        <section className="bg-cream" aria-labelledby="contribute-heading">
          <div className="mx-auto grid max-w-content gap-10 px-6 py-20 sm:py-24 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
                Help Build the Work
              </p>
              <h2
                id="contribute-heading"
                className="mt-3 font-heading text-4xl font-bold text-navy sm:text-5xl"
              >
                Contribution can take more than one form.
              </h2>
              <p className="mt-5 text-lg leading-8 text-navy-600">
                Support access, propose a partnership, volunteer relevant
                expertise, or invite a conversation about a community need.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 lg:justify-end">
              <Button href="/support-the-mission" size="lg">
                Support the Mission
              </Button>
              <Button href="/contact" variant="outline" size="lg">
                Discuss a Partnership
              </Button>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
