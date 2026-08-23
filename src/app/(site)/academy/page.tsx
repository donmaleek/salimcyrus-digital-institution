import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHero } from '@/components/layout/PageHero'
import { programs } from '@/lib/data/programs'

export const metadata: Metadata = {
  title: 'Academy',
  description: 'Structured courses and programs for scalable transformation.',
}

export default function AcademyPage() {
  return (
    <>
      <PageHero
        eyebrow="Academy"
        title="A Session Inspires. A System Transforms."
        description="Structured paths that move people from information to formation to transformation."
      />
      <section className="bg-cream">
        <div className="mx-auto max-w-content px-6 py-20">
          <div className="grid gap-6 sm:grid-cols-2">
            <Link
              href="/academy/masterclasses"
              className="rounded-2xl border border-navy-100 bg-white p-8 transition-shadow hover:shadow-lg"
            >
              <h2 className="font-heading text-xl font-semibold text-navy">Programs &amp; Masterclasses</h2>
              <p className="mt-3 text-sm text-navy-500">
                {programs.length} live programs — flagship transformation tracks, bootcamps,
                intensives, and memberships.
              </p>
            </Link>
            <Link
              href="/academy/courses"
              className="rounded-2xl border border-navy-100 bg-white p-8 transition-shadow hover:shadow-lg"
            >
              <h2 className="font-heading text-xl font-semibold text-navy">Self-Paced Courses</h2>
              <p className="mt-3 text-sm text-navy-500">
                Recorded courses for self-paced learning — in development.
              </p>
            </Link>
          </div>
        </div>
      </section>
    </>
  )
}
