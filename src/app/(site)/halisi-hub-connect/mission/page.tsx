import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Our Mission',
  description: 'The mission and vision behind Halisi Hub Connect.',
}

const pillars = [
  { title: 'Mentorship', description: 'Structured spiritual and purpose mentorship for men and families.' },
  { title: 'Community', description: 'A fellowship where people are known, not just followed.' },
  { title: 'Masterclasses & Programs', description: 'Defining Manhood, Kingdom programs, and youth empowerment.' },
  { title: 'Community Initiatives', description: 'Events, partnerships, and on-the-ground impact.' },
]

export default function MissionPage() {
  return (
    <section className="bg-cream">
      <div className="mx-auto max-w-content px-6 py-20">
        <p className="font-body text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
          Mission
        </p>
        <h1 className="mt-4 font-heading text-4xl font-bold text-navy sm:text-5xl">
          Awakening Wisdom. Restoring Identity.
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-navy-600">
          Halisi Hub Connect separates the institutional platform from Salim&apos;s personal
          authority — a genuine knowledge, mentorship, education, and marketplace platform.
        </p>

        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {pillars.map((pillar) => (
            <div key={pillar.title} className="rounded-2xl border border-navy-100 bg-white p-6">
              <h2 className="font-heading text-lg font-semibold text-navy">{pillar.title}</h2>
              <p className="mt-2 text-sm text-navy-500">{pillar.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
