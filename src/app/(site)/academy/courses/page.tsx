import type { Metadata } from 'next'
import { Button } from '@/components/ui/Button'
import { PageHero } from '@/components/layout/PageHero'

export const metadata: Metadata = {
  title: 'Courses',
  description: 'Self-paced recorded courses are in development.',
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
    <>
      <PageHero
        eyebrow="Courses"
        title="Self-Paced Courses"
        description="Recorded courses are in development. In the meantime, the live programs and masterclasses cover most of this ground with direct access to Salim."
      />
      <section className="bg-cream">
        <div className="mx-auto max-w-content px-6 py-20">
          <div className="flex flex-wrap gap-2">
            {planned.map((title) => (
              <span
                key={title}
                className="rounded-full border border-dashed border-navy-200 bg-white px-4 py-2 text-sm text-navy-500"
              >
                {title}: Planned
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
    </>
  )
}
