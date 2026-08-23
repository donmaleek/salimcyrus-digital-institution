import type { Metadata } from 'next'
import { Button } from '@/components/ui/Button'
import { PageHero } from '@/components/layout/PageHero'

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
    <>
      <PageHero
        eyebrow="Journal"
        title="Deep Thinking, Not Motivation"
        description="Long-form writing that challenges assumptions — where Salim writes as a thinker, not just a content creator."
      />
      <section className="bg-cream">
        <div className="mx-auto max-w-content px-6 py-20">
          <div className="space-y-3">
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
    </>
  )
}
