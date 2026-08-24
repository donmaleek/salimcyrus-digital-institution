import Link from 'next/link'
import { testimonials } from '@/lib/data/testimonials'

export function TransformativeResults() {
  const [featured, ...rest] = testimonials

  return (
    <section className="bg-cream">
      <div className="mx-auto max-w-content px-6 py-16 sm:py-24">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gold-500">Evidence of movement</p>
        <h2 className="mt-3 max-w-3xl font-heading text-4xl font-bold text-navy sm:text-5xl">The work is measured by what changes after the conversation.</h2>

        <blockquote className="mt-10 border-y border-gold-300 bg-gold-50 p-8 sm:p-12">
          <p className="font-heading text-xl italic leading-relaxed text-navy">
            &ldquo;{featured.quote}&rdquo;
          </p>
          <footer className="mt-4 text-sm font-semibold uppercase tracking-wide text-navy-500">
            {featured.name} · {featured.role}
          </footer>
        </blockquote>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {rest.slice(0, 3).map((t) => (
            <div key={t.name} className="rounded-2xl border border-navy-100 bg-white p-5">
              <p className="text-sm text-navy-700">&ldquo;{t.quote}&rdquo;</p>
              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-navy-400">
                {t.name} · {t.role}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <Link href="/testimonials" className="text-sm font-semibold text-gold-500 hover:underline">
            Read all client stories
          </Link>
        </div>
      </div>
    </section>
  )
}
