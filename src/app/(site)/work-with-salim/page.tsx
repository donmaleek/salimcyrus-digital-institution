import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Work With Salim',
  description: 'Private coaching, speaking, and consulting with Salim Cyrus.',
}

const paths = [
  {
    title: 'Coaching',
    description: 'Relationship, marriage, life & purpose, and manhood & leadership coaching.',
    href: '/work-with-salim/coaching',
  },
  {
    title: 'Speaking',
    description: 'Conferences, churches, corporates, men’s conferences, and marriage seminars.',
    href: '/work-with-salim/speaking',
  },
  {
    title: 'Consulting',
    description: 'Leadership, relationships, and personal development strategy for organizations.',
    href: '/work-with-salim/consulting',
  },
]

export default function WorkWithSalimPage() {
  return (
    <section className="bg-cream">
      <div className="mx-auto max-w-content px-6 py-20">
        <p className="font-body text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
          Work With Salim
        </p>
        <h1 className="mt-4 font-heading text-4xl font-bold text-navy sm:text-5xl">
          Private Coaching, Speaking &amp; Consulting
        </h1>
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {paths.map((path) => (
            <Link
              key={path.href}
              href={path.href}
              className="rounded-2xl border border-navy-100 bg-white p-8 transition-shadow hover:shadow-lg"
            >
              <h2 className="font-heading text-xl font-semibold text-navy">{path.title}</h2>
              <p className="mt-3 text-sm text-navy-500">{path.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
