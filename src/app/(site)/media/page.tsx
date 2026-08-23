import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHero } from '@/components/layout/PageHero'

export const metadata: Metadata = {
  title: 'Media Centre',
  description: 'Videos, podcast, and press for Salim Cyrus.',
}

const sections = [
  {
    title: 'Videos',
    description: 'YouTube teachings, interviews, and masterclass clips.',
    href: '/media/videos',
  },
  {
    title: 'Podcast',
    description: 'The Salim Cyrus Connect Podcast.',
    href: '/media/podcast',
  },
  {
    title: 'Press Kit',
    description: 'Biography, photographs, and speaking topics for organizers.',
    href: '/media/press-kit',
  },
]

export default function MediaPage() {
  return (
    <>
      <PageHero
        eyebrow="Media"
        title="Proof of Authority"
        description="Watch, listen, and explore the public conversations shaping Salim's body of work."
      />
      <section className="bg-cream">
        <div className="mx-auto max-w-content px-6 py-20">
          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            {sections.map((section) => (
              <Link
                key={section.href}
                href={section.href}
                className="rounded-2xl border border-navy-100 bg-white p-8 transition-shadow hover:shadow-lg"
              >
                <h2 className="font-heading text-lg font-semibold text-navy">
                  {section.title}
                </h2>
                <p className="mt-2 text-sm text-navy-500">
                  {section.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
