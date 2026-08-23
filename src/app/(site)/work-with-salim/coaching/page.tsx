import type { Metadata } from 'next'
import { Button } from '@/components/ui/Button'
import { CoachingPackageCard } from '@/components/sections/coaching/CoachingPackageCard'
import { PricingTable } from '@/components/sections/coaching/PricingTable'

export const metadata: Metadata = {
  title: 'Coaching',
  description: 'Private relationship, life & purpose, and manhood & leadership coaching with Salim Cyrus.',
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

export default function CoachingPage() {
  return (
    <>
      <section className="border-b border-navy-100 bg-cream">
        <div className="mx-auto max-w-content px-6 py-20">
          <p className="font-body text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
            Private Coaching
          </p>
          <h1 className="mt-4 font-heading text-4xl font-bold text-navy sm:text-5xl">
            Salim Cyrus Private Coaching
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-navy-600">
            Choose a service, select a date and time, pay, and receive confirmation — coaching is
            always one booking away.
          </p>
          <Button href="/contact" size="lg" className="mt-8">
            Book a Private Session
          </Button>
        </div>
      </section>

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
          <h2 className="font-heading text-3xl font-bold text-navy sm:text-4xl">Pricing</h2>
          <div className="mt-10">
            <PricingTable />
          </div>
        </div>
      </section>
    </>
  )
}
