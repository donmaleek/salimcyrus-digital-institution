import type { Metadata } from 'next'
import { Button } from '@/components/ui/Button'
import { testimonials } from '@/lib/data/testimonials'

export const metadata: Metadata = {
  title: 'Testimonials',
  description: 'What clients say about coaching with Salim Cyrus.',
}

export default function TestimonialsPage() {
  const [featured, ...rest] = testimonials

  return (
    <section className="bg-cream">
      <div className="mx-auto max-w-content px-6 py-20">
        <p className="font-body text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
          Social Proof
        </p>
        <h1 className="mt-4 font-heading text-4xl font-bold text-navy sm:text-5xl">
          What Clients Say
        </h1>

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
            <div key={t.name} className="rounded-2xl border border-navy-100 bg-white p-6">
              <p className="text-navy-700">&ldquo;{t.quote}&rdquo;</p>
              <p className="mt-4 text-sm font-semibold uppercase tracking-wide text-navy-400">
                {t.name} &middot; {t.role}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-2xl border border-dashed border-navy-200 bg-white p-10 text-center">
          <p className="text-navy-400">Been through a session or program? Share your story.</p>
          <Button href="/contact" variant="outline" className="mt-6">
            Share Your Story
          </Button>
        </div>
      </div>
    </section>
  )
}
