import type { Metadata } from 'next'
import { Button } from '@/components/ui/Button'

export const metadata: Metadata = {
  title: 'Courses',
  description: 'Self-paced recorded courses — in development.',
}

const planned = [
  'Relationship Mastery',
  'Defining Manhood',
  'Kingdom Mentality',
  'Purpose Discovery',
  'Marriage Intelligence',
  'Emotional Maturity',
]

export default function CoursesPage() {
  return (
    <section className="bg-cream">
      <div className="mx-auto max-w-content px-6 py-20">
        <p className="font-body text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
          Courses
        </p>
        <h1 className="mt-4 font-heading text-4xl font-bold text-navy sm:text-5xl">
          Self-Paced Courses
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-navy-600">
          Recorded courses are in development. In the meantime, the live programs and masterclasses
          cover most of this ground with direct access to Salim.
        </p>

        <div className="mt-14 flex flex-wrap gap-2">
          {planned.map((title) => (
            <span
              key={title}
              className="rounded-full border border-dashed border-navy-200 bg-white px-4 py-2 text-sm text-navy-500"
            >
              {title} — Planned
            </span>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap gap-4">
          <Button href="/academy/masterclasses">Explore Live Programs</Button>
          <Button href="/contact" variant="outline">
            Get Notified When Courses Launch
          </Button>
        </div>
      </div>
    </section>
  )
}
