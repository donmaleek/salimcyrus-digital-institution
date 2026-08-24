import type { Metadata } from 'next'
import { Button } from '@/components/ui/Button'
import { testimonials } from '@/lib/data/testimonials'
import { PageHero } from '@/components/layout/PageHero'

export const metadata: Metadata = {
  title: 'Testimonials',
  description: 'What clients say about coaching with Salim Cyrus.',
}

export default function TestimonialsPage() {
  const [featured, ...rest] = testimonials

  return (
    <>
      <PageHero
        eyebrow="Testimonials"
        title="What Clients Say"
        description="Reflections on the clarity, structure, and transformation people have found through the work."
      />
      <section className="bg-cream">
        <div className="mx-auto max-w-content px-6 py-20">
          <blockquote className="mt-14 rounded-2xl border border-gold-200 bg-gold-50 p-10">
            <p className="font-heading text-2xl italic leading-relaxed text-navy">
              &ldquo;{featured.quote}&rdquo;
            </p>
            <footer className="mt-6 text-sm font-semibold uppercase tracking-wide text-navy-500">
              {featured.name} &middot; {featured.role}
            </footer>
          </blockquote>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((t) => (
              <div
                key={t.name}
                className="rounded-2xl border border-navy-100 bg-white p-6"
              >
                <p className="text-navy-700">&ldquo;{t.quote}&rdquo;</p>
                <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-navy-400">
                  {t.name} &middot; {t.role}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-16 rounded-2xl border border-dashed border-navy-200 bg-white p-10 text-center">
            <p className="text-navy-400">
              Been through a session or program? Share your story.
            </p>
            <Button href="/contact" variant="outline" className="mt-6">
              Share Your Story
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
