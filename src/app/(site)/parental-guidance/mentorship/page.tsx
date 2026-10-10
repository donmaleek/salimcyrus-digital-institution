import type { Metadata } from 'next'
import { PageHero } from '@/components/layout/PageHero'
import { Button } from '@/components/ui/Button'

export const metadata: Metadata = {
  title: 'Parenting Mentorship',
  description:
    'A scheduled, one-on-one educational session focused on your parenting goals, drawn from the Parental Guidance curriculum.',
}

const steps = [
  'Submit a mentorship request with the topics you would like to focus on.',
  'Hear back with options for scheduling and session focus.',
  'Attend a one-on-one session built around your actual situation, not a generic script.',
]

export default function ParentingMentorshipPage() {
  return (
    <>
      <PageHero
        eyebrow="Parental Guidance"
        title="Parenting Mentorship"
        description="A scheduled, one-on-one educational session focused on your parenting goals, drawn directly from the Parental Guidance curriculum. This is education and mentorship, not clinical or therapeutic treatment."
        actions={
          <Button href="/book-now?category=parenting-mentorship#choose-session" size="lg">
            Request Mentorship
          </Button>
        }
      />
      <section className="bg-cream">
        <div className="mx-auto max-w-content px-6 py-16">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-700">How it works</p>
          <ol className="mt-6 space-y-4">
            {steps.map((step, index) => (
              <li key={step} className="grid grid-cols-[28px_1fr] gap-3 text-base leading-7 text-navy-600">
                <span className="font-bold text-gold-700">{index + 1}.</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <p className="mt-8 max-w-2xl text-sm leading-6 text-navy-400">
            Mentorship sessions are scheduled individually, so fees and timing are confirmed with you directly
            rather than fixed in advance. Submitting a request does not commit you to anything; it starts the
            conversation.
          </p>
        </div>
      </section>
    </>
  )
}
