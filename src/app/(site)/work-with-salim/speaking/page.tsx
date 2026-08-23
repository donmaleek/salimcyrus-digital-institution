import type { Metadata } from 'next'
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
      <section className="border-b border-navy-100 bg-cream">
        <div className="mx-auto max-w-content px-6 py-20">
          <p className="font-body text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
            Speaking
          </p>
          <h1 className="mt-4 font-heading text-4xl font-bold text-navy sm:text-5xl">
            Book Salim Cyrus
          </h1>
          <div className="mt-10 flex flex-wrap gap-3">
            {topics.map((topic) => (
              <span
                key={topic}
                className="rounded-full border border-navy-200 bg-white px-4 py-2 text-sm text-navy-700"
              >
                {topic}
              </span>
            ))}
          </div>
        </div>
      </section>

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
