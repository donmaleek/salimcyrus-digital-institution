import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { PageHero } from '@/components/layout/PageHero'

export const metadata: Metadata = {
  title: 'Halisi Hub Connect | Wisdom, Identity, and Purpose',
  description:
    'Discover Halisi Hub Connect, an institution for mentorship, learning, community formation, and practical service rooted in wisdom, identity, and purposeful living.',
}

const pillars = [
  [
    '01',
    'Wisdom for life',
    'Teaching that connects enduring principles to relationships, leadership, work, faith, family, and everyday decisions.',
  ],
  [
    '02',
    'Identity and formation',
    'Guided reflection and mentorship that help people understand who they are, what they carry, and how to live with integrity.',
  ],
  [
    '03',
    'Community and belonging',
    'Purposeful spaces where people are known, challenged, supported, and connected to others who take growth seriously.',
  ],
  [
    '04',
    'Service and contribution',
    'Practical pathways for turning personal growth into stronger homes, responsible leadership, and meaningful community action.',
  ],
]

const pathways = [
  [
    'Understand the foundation',
    'Mission',
    'Read the convictions, responsibilities, and institutional commitments that guide the work.',
    '/halisi-hub-connect/mission',
    'Explore the mission',
  ],
  [
    'Grow with others',
    'Community',
    'Discover the Halisi Inner Circle and the rhythm of teaching, reflection, accountability, and connection.',
    '/halisi-hub-connect/community',
    'Enter the community',
  ],
  [
    'See how progress is defined',
    'Impact',
    'Review the outcomes Halisi intends to measure and the reporting standard it is building toward.',
    '/halisi-hub-connect/impact',
    'View the impact framework',
  ],
]

const operatingModel = [
  [
    'Listen',
    'Begin with the real questions affecting people, families, leaders, and communities.',
  ],
  [
    'Teach',
    'Translate wisdom into clear ideas, shared language, and practical tools for life.',
  ],
  [
    'Practice',
    'Create structured opportunities for reflection, accountability, and responsible action.',
  ],
  [
    'Multiply',
    'Equip participants to carry healthy principles into their homes, work, and communities.',
  ],
]

const audiences = [
  'Men seeking clarity, discipline, and responsible manhood',
  'Couples and families building healthier patterns of relationship',
  'Young people navigating identity, purpose, and transition',
  'Leaders and professionals aligning influence with character',
  'Communities looking for practical teaching and collaborative initiatives',
]

const measures = [
  [
    'Participation',
    'People reached, enrolled, mentored, and consistently engaged',
  ],
  ['Formation', 'Learning completed, practices adopted, and goals progressed'],
  [
    'Belonging',
    'Active participation, peer connection, and continued engagement',
  ],
  [
    'Contribution',
    'Volunteer action, partnerships, resources shared, and initiatives delivered',
  ],
]

export default function HalisiHubConnectPage() {
  return (
    <>
      <PageHero
        eyebrow="Halisi Hub Connect"
        title="Wisdom That Forms People. People Who Strengthen Communities."
        description="A growing institution for mentorship, learning, community formation, and practical service, built to help people live with identity, responsibility, and purpose."
        actions={
          <>
            <Button href="#pathways" size="lg">
              Find Your Path
            </Button>
            <Button
              href="/halisi-hub-connect/mission"
              variant="outline-inverse"
              size="lg"
            >
              Read the Mission
            </Button>
          </>
        }
      />

      <main data-testid="halisi-hub-content">
        <section className="bg-cream" aria-labelledby="institution-heading">
          <div className="mx-auto max-w-content px-6 py-16 sm:py-24">
            <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
                  The Institution
                </p>
                <h2
                  id="institution-heading"
                  className="mt-3 font-heading text-4xl font-bold leading-tight text-navy sm:text-5xl"
                >
                  More than content. A place for formation and contribution.
                </h2>
              </div>
              <div className="space-y-6 text-lg leading-8 text-navy-600">
                <p>
                  Halisi Hub Connect brings teaching, mentorship, community, and
                  service into one connected institution. Its purpose is not
                  simply to distribute ideas, but to help people understand
                  truth, apply it responsibly, and become a constructive
                  presence wherever they live and lead.
                </p>
                <p>
                  The name Halisi speaks to what is genuine and authentic. The
                  work begins with the inner life, then moves outward into
                  relationships, families, leadership, enterprise, and society.
                </p>
              </div>
            </div>
            <div className="mt-16 grid border-y border-navy-200 sm:grid-cols-3">
              {[
                'Learn with clarity',
                'Grow in community',
                'Serve with purpose',
              ].map((principle, index) => (
                <div
                  key={principle}
                  className="py-7 sm:border-l sm:border-navy-200 sm:px-8 sm:first:border-l-0 sm:first:pl-0"
                >
                  <p className="font-heading text-sm font-bold text-gold-500">
                    {String(index + 1).padStart(2, '0')}
                  </p>
                  <p className="mt-2 font-heading text-xl font-semibold text-navy">
                    {principle}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white" aria-labelledby="pillars-heading">
          <div className="mx-auto max-w-content px-6 py-16 sm:py-24">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
                Four Commitments
              </p>
              <h2
                id="pillars-heading"
                className="mt-3 font-heading text-3xl font-bold text-navy sm:text-4xl"
              >
                The work is organized around what people need to become whole
                and useful.
              </h2>
            </div>
            <ol
              className="mt-12 border-t border-navy-200"
              data-testid="halisi-pillars"
            >
              {pillars.map(([number, title, description]) => (
                <li
                  key={number}
                  className="grid gap-4 border-b border-navy-200 py-7 sm:grid-cols-[64px_0.75fr_1.25fr] sm:gap-8"
                >
                  <span className="font-heading text-lg font-bold text-gold-500">
                    {number}
                  </span>
                  <h3 className="font-heading text-2xl font-semibold text-navy">
                    {title}
                  </h3>
                  <p className="leading-7 text-navy-600">{description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="bg-navy text-cream" aria-labelledby="model-heading">
          <div className="mx-auto max-w-content px-6 py-16 sm:py-24">
            <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">
                  How Halisi Works
                </p>
                <h2
                  id="model-heading"
                  className="mt-3 font-heading text-3xl font-bold sm:text-4xl"
                >
                  A repeatable path from insight to impact
                </h2>
                <p className="mt-5 max-w-md text-lg leading-8 text-cream/70">
                  Every program should help people move beyond inspiration into
                  informed and observable practice.
                </p>
              </div>
              <ol
                className="border-t border-cream/20"
                data-testid="operating-model"
              >
                {operatingModel.map(([step, detail], index) => (
                  <li
                    key={step}
                    className="grid gap-3 border-b border-cream/20 py-6 sm:grid-cols-[48px_0.6fr_1.4fr] sm:gap-6"
                  >
                    <span className="font-heading font-bold text-gold">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <h3 className="font-heading text-xl font-semibold">
                      {step}
                    </h3>
                    <p className="leading-7 text-cream/70">{detail}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section
          id="pathways"
          className="scroll-mt-24 bg-cream"
          aria-labelledby="pathways-heading"
        >
          <div className="mx-auto max-w-content px-6 py-16 sm:py-24">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
                Choose Your Entry Point
              </p>
              <h2
                id="pathways-heading"
                className="mt-3 font-heading text-3xl font-bold text-navy sm:text-4xl"
              >
                Start with the part of the institution you need now.
              </h2>
            </div>
            <div className="mt-12 grid gap-px overflow-hidden border border-navy-200 bg-navy-200 lg:grid-cols-3">
              {pathways.map(([label, title, description, href, action]) => (
                <Link
                  key={href}
                  href={href}
                  className="group flex min-h-[330px] flex-col bg-white p-8 transition-colors hover:bg-navy hover:text-cream sm:p-10"
                >
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold-500">
                    {label}
                  </p>
                  <h3 className="mt-8 font-heading text-3xl font-bold text-navy group-hover:text-cream">
                    {title}
                  </h3>
                  <p className="mt-4 leading-7 text-navy-600 group-hover:text-cream/70">
                    {description}
                  </p>
                  <span className="mt-auto pt-8 font-semibold text-navy group-hover:text-gold">
                    {action} <span aria-hidden>→</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-white" aria-labelledby="people-heading">
          <div className="mx-auto grid max-w-content gap-12 px-6 py-16 sm:py-24 lg:grid-cols-[0.82fr_1.18fr] lg:gap-20">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
                Who It Serves
              </p>
              <h2
                id="people-heading"
                className="mt-3 font-heading text-3xl font-bold text-navy sm:text-4xl"
              >
                One institution, several points of responsibility
              </h2>
              <p className="mt-5 text-lg leading-8 text-navy-600">
                Halisi is for people who want growth to change how they relate,
                decide, lead, and contribute, not simply what they know.
              </p>
            </div>
            <ul className="border-t border-navy-200">
              {audiences.map((audience, index) => (
                <li
                  key={audience}
                  className="grid grid-cols-[48px_1fr] border-b border-navy-200 py-5"
                >
                  <span className="font-heading font-bold text-gold-500">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="font-semibold leading-7 text-navy-700">
                    {audience}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="bg-cream" aria-labelledby="measurement-heading">
          <div className="mx-auto max-w-content px-6 py-16 sm:py-24">
            <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
                  Accountability
                </p>
                <h2
                  id="measurement-heading"
                  className="mt-3 font-heading text-3xl font-bold text-navy sm:text-4xl"
                >
                  Impact must be measured before it is celebrated.
                </h2>
                <p className="mt-5 text-lg leading-8 text-navy-600">
                  Halisi is building toward public reporting that separates
                  participation from progress and contribution. Until verified
                  figures are available, the institution will publish the
                  framework it intends to use instead of presenting unsupported
                  numbers.
                </p>
              </div>
              <dl
                className="border-t border-navy-200"
                data-testid="measurement-framework"
              >
                {measures.map(([term, detail]) => (
                  <div
                    key={term}
                    className="grid gap-2 border-b border-navy-200 py-5 sm:grid-cols-[0.5fr_1.5fr] sm:gap-6"
                  >
                    <dt className="font-heading text-lg font-semibold text-navy">
                      {term}
                    </dt>
                    <dd className="leading-7 text-navy-600">{detail}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        <section
          className="bg-navy text-cream"
          aria-labelledby="participate-heading"
        >
          <div className="mx-auto grid max-w-content gap-10 px-6 py-16 sm:py-24 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">
                Participate
              </p>
              <h2
                id="participate-heading"
                className="mt-3 font-heading text-4xl font-bold sm:text-5xl"
              >
                Learn deeply. Belong intentionally. Contribute responsibly.
              </h2>
              <p className="mt-5 text-lg leading-8 text-cream/70">
                Join the community, support access to the work, or start a
                conversation about a program or partnership.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 lg:justify-end">
              <Button href="/halisi-hub-connect/community" size="lg">
                Join the Community
              </Button>
              <Button href="/contact" variant="outline-inverse" size="lg">
                Start a Conversation
              </Button>
              <Button
                href="/support-the-mission"
                variant="ghost-inverse"
                size="lg"
              >
                Support the Mission
              </Button>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
