import type { Metadata } from 'next'
import { Button } from '@/components/ui/Button'
import { PageHero } from '@/components/layout/PageHero'

export const metadata: Metadata = {
  title: 'Podcast',
  description: 'The Salim Cyrus podcast — coming soon.',
}

const categories = [
  'Relationships',
  'Marriage',
  'Manhood',
  'Purpose',
  'Kingdom',
  'Leadership',
  'Business & Marketplace',
]

export default function PodcastPage() {
  return (
    <>
      <PageHero
        eyebrow="Podcast"
        title="The Salim Cyrus Podcast"
        description="Conversations about the ideas that shape relationships, purpose, leadership, and the marketplace."
      />
      <section className="bg-cream">
        <div className="mx-auto max-w-content px-6 py-20">
          <p className="mt-6 max-w-2xl text-lg text-navy-600">
            Coming soon, covering:
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {categories.map((c) => (
              <span
                key={c}
                className="rounded-full border border-navy-200 bg-white px-4 py-2 text-sm text-navy-700"
              >
                {c}
              </span>
            ))}
          </div>
          <Button href="/contact" variant="outline" className="mt-10">
            Get Notified at Launch
          </Button>
        </div>
      </section>
    </>
  )
}
