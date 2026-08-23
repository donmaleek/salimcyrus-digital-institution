import type { Metadata } from 'next'
import { PageHero } from '@/components/layout/PageHero'
import { SpeakingEnquiryForm } from '@/components/forms/SpeakingEnquiryForm'

export const metadata: Metadata = {
  title: 'Book Salim Cyrus',
  description: 'Invite Salim Cyrus to speak at your conference, church, corporate event, or seminar.',
}

const topics = [
  'Relationship Coaching', 'Marriage Seminars', "Men's Conferences", 'Leadership Training',
  'Kingdom & Purpose Conferences', 'Corporate Speaking', 'Youth Programs', 'Community Transformation',
]

export default function SpeakingPage() {
  return (
    <>
      <PageHero
        eyebrow="Speaking"
        title="Book Salim Cyrus"
        image={{
          src: '/images/salim/speaking-keynote.webp',
          alt: 'Salim Cyrus delivering a keynote on stage',
          width: 1672,
          height: 941,
        }}
      >
        <div className="mt-10 flex flex-wrap gap-3">
          {topics.map((topic) => (
            <span
              key={topic}
              className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm text-cream/90"
            >
              {topic}
            </span>
          ))}
        </div>
      </PageHero>

      <section className="bg-navy-50">
        <div className="mx-auto max-w-content px-6 py-16">
          <h2 className="font-heading text-2xl font-bold text-navy">Request Salim Cyrus</h2>
          <p className="mt-2 max-w-2xl text-sm text-navy-500">
            A conference organizer should be able to submit everything needed to book Salim within
            minutes.
          </p>
          <div className="mt-8 rounded-2xl border border-navy-100 bg-white p-8">
            <SpeakingEnquiryForm />
          </div>
        </div>
      </section>
    </>
  )
}
