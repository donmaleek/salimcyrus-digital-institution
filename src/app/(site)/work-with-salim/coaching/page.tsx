import type { Metadata } from 'next'
import { Button } from '@/components/ui/Button'
import { PageHero } from '@/components/layout/PageHero'
import { Accordion } from '@/components/ui/Accordion'
import { JsonLd } from '@/components/sections/shared/SEO'
import { CoachingPackageCard } from '@/components/sections/coaching/CoachingPackageCard'
import { PricingTable } from '@/components/sections/coaching/PricingTable'
import { coachingProcess, coachingStats, coachingFaqs } from '@/lib/data/coaching-offers'
import { WHATSAPP_URL } from '@/lib/utils/constants'

export const metadata: Metadata = {
  title: 'Coaching',
  description: 'Private coaching for leaders in transition — clarity, structure, and accountability with Salim Cyrus.',
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: coachingFaqs.map((faq) => ({
    '@type': 'Question',
    name: faq.q,
    acceptedAnswer: { '@type': 'Answer', text: faq.a },
  })),
}

const packages = [
  {
    title: 'Relationship Coaching',
    topics: [
      'Dating & relationship clarity',
      'Communication',
      'Trust & betrayal',
      'Marriage preparation',
      'Conflict resolution',
      'Emotional maturity',
    ],
  },
  {
    title: 'Life & Purpose Coaching',
    topics: ['Identity', 'Purpose', 'Calling', 'Direction', 'Personal growth', 'Decision-making'],
  },
  {
    title: 'Manhood & Leadership',
    topics: [
      'Defining manhood',
      'Responsibility',
      'Leadership',
      'Character',
      'Purpose-driven masculinity',
    ],
  },
]

const forWho = [
  { title: 'High-responsibility people', description: 'You carry expectations set by others; this program gives you private structure so your energy serves the priorities you actually choose.' },
  { title: 'Transitions (career, identity, relationships, purpose)', description: 'Every meaningful move ripples into your days — together we map the cost, the gain, and the simplest next action that keeps momentum alive.' },
  { title: 'Burnout, drift, indecision', description: 'We diagnose the repeating pattern, isolate the drain, and turn that insight into a decision you can defend internally and externally.' },
]

const notForWho = [
  { title: 'People looking for motivation, not structure', description: 'If you want a pep talk instead of a detailed accountability plan, this isn’t the right place.' },
  { title: 'People unwilling to make decisions', description: 'The work asks for deliberate moves; we pause rather than progress when you need more time to choose.' },
]

export default function CoachingPage() {
  return (
    <>
      <PageHero
        eyebrow="Private Coaching"
        title="Private Coaching for Leaders in Transition"
        description="Clarity, structure, and accountability for people ready to stop negotiating with the same problems."
        image={{ src: '/images/salim/coaching.webp', alt: 'Salim Cyrus', width: 840, height: 1125 }}
        actions={
          <>
            <Button href="/contact" size="lg">
              Contact Me
            </Button>
            <Button href={WHATSAPP_URL} variant="outline-inverse" size="lg">
              Message on WhatsApp
            </Button>
          </>
        }
      />

      <section className="bg-navy-50">
        <div className="mx-auto max-w-content px-6 py-20">
          <div className="grid gap-6 sm:grid-cols-3">
            {packages.map((pkg) => (
              <CoachingPackageCard key={pkg.title} title={pkg.title} topics={pkg.topics} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-cream">
        <div className="mx-auto max-w-content px-6 py-20">
          <div className="grid gap-10 sm:grid-cols-2">
            <div>
              <h2 className="font-heading text-2xl font-bold text-navy">Who It&apos;s For</h2>
              <div className="mt-6 space-y-6">
                {forWho.map((item) => (
                  <div key={item.title}>
                    <p className="font-semibold text-navy">{item.title}</p>
                    <p className="mt-1 text-sm text-navy-500">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h2 className="font-heading text-2xl font-bold text-navy">Who It&apos;s Not For</h2>
              <div className="mt-6 space-y-6">
                {notForWho.map((item) => (
                  <div key={item.title}>
                    <p className="font-semibold text-navy">{item.title}</p>
                    <p className="mt-1 text-sm text-navy-500">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-navy-50">
        <div className="mx-auto max-w-content px-6 py-20">
          <h2 className="font-heading text-3xl font-bold text-navy sm:text-4xl">Offers</h2>
          <div className="mt-10">
            <PricingTable />
          </div>
        </div>
      </section>

      <section className="bg-navy">
        <div className="mx-auto max-w-content px-6 py-20">
          <p className="font-body text-sm font-semibold uppercase tracking-[0.2em] text-gold">
            Process
          </p>
          <h2 className="mt-3 font-heading text-2xl font-bold text-cream sm:text-3xl">
            {coachingProcess.join(' → ')}
          </h2>
          <p className="mt-4 max-w-3xl text-navy-200">
            Every phase follows the same cadence: we diagnose the hidden loop, decide the next
            defense, build the rituals that guard the new move, execute with weekly
            accountability, and review before the next session. You also get midweek summaries so
            follow-through stays visible without needless meetings.
          </p>

          <div className="mt-14 grid gap-8 sm:grid-cols-3">
            {coachingStats.map((stat) => (
              <div key={stat.label}>
                <p className="font-heading text-4xl font-bold text-gold">{stat.value}</p>
                <p className="mt-2 text-sm uppercase tracking-wide text-cream/70">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-cream">
        <JsonLd data={faqJsonLd} />
        <div className="mx-auto max-w-content px-6 py-20">
          <h2 className="font-heading text-2xl font-bold text-navy">FAQ</h2>
          <div className="mt-8">
            <Accordion items={coachingFaqs.map((f) => ({ question: f.q, answer: f.a }))} />
          </div>
        </div>
      </section>
    </>
  )
}
