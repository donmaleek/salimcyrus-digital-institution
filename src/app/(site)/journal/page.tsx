import type { Metadata } from 'next'
import { Button } from '@/components/ui/Button'

export const metadata: Metadata = {
  title: 'Journal',
  description: 'Long-form writing and deeper thinking from Salim Cyrus.',
}

const plannedTopics = [
  'Why Marriage Cannot Fix an Identity Crisis',
  'The Difference Between Being Male and Becoming a Man',
  'Why Purpose Must Precede Partnership',
  'The Psychology of Entitlement',
  'Grace Does Not Cancel Responsibility',
]

export default function JournalPage() {
  return (
    <section className="bg-cream">
      <div className="mx-auto max-w-content px-6 py-20">
        <p className="font-body text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
          Journal
        </p>
        <h1 className="mt-4 font-heading text-4xl font-bold text-navy sm:text-5xl">
          Deep Thinking, Not Motivation
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-navy-600">
          Long-form writing that challenges assumptions — where Salim writes as a thinker, not
          just a content creator.
        </p>

        <div className="mt-14 space-y-3">
          {plannedTopics.map((topic) => (
            <div
              key={topic}
              className="rounded-xl border border-dashed border-navy-200 bg-white p-5"
            >
              <p className="font-heading font-medium text-navy">{topic}</p>
              <p className="mt-1 text-xs text-navy-400">Planned</p>
            </div>
          ))}
        </div>

        <div className="mt-12">
          <Button href="/resources/free-guides" variant="outline">
            Join the Newsletter to Get Notified
          </Button>
        </div>
      </div>
    </section>
  )
}
