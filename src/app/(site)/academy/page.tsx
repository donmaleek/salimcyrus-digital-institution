import type { Metadata } from 'next'
import Link from 'next/link'
import { programs } from '@/lib/data/programs'

export const metadata: Metadata = {
  title: 'Academy',
  description: 'Structured courses and programs for scalable transformation.',
}

export default function AcademyPage() {
  return (
    <section className="bg-cream">
      <div className="mx-auto max-w-content px-6 py-20">
        <p className="font-body text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
          Academy
        </p>
        <h1 className="mt-4 font-heading text-4xl font-bold text-navy sm:text-5xl">
          A Session Inspires. A System Transforms.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-navy-600">
          Structured paths that move people from information to formation to transformation.
        </p>

        <div className="mt-14 grid gap-6 sm:grid-cols-2">
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
  )
}
