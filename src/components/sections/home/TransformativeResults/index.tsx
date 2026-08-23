import Link from 'next/link'
import { testimonials } from '@/lib/data/testimonials'

export function TransformativeResults() {
  const [featured, ...rest] = testimonials

  return (
    <section className="bg-cream">
      <div className="mx-auto max-w-content px-6 py-20">
        <h2 className="font-heading text-3xl font-bold text-navy sm:text-4xl">
          What Clients Say
        </h2>

        <blockquote className="mt-10 rounded-2xl border border-gold-200 bg-gold-50 p-8">
          <p className="font-heading text-xl italic leading-relaxed text-navy">
            &ldquo;{featured.quote}&rdquo;
          </p>
          <footer className="mt-4 text-sm font-semibold uppercase tracking-wide text-navy-500">
            {featured.name} &middot; {featured.role}
          </footer>
        </blockquote>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {rest.slice(0, 3).map((t) => (
            <div key={t.name} className="rounded-2xl border border-navy-100 bg-white p-5">
              <p className="text-sm text-navy-700">&ldquo;{t.quote}&rdquo;</p>
              <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-navy-400">
                {t.name} &middot; {t.role}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8">
          <Link href="/testimonials" className="text-sm font-semibold text-gold-500 hover:underline">
            Read all client stories &rarr;
          </Link>
        </div>
      </div>
    </section>
  )
}
