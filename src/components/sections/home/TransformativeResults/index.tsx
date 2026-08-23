import Link from 'next/link'

const stages = [
  { label: 'Before', description: 'Where a client started — the confusion, pain, or pattern they came in with.' },
  { label: 'The Process', description: 'What changed through coaching, mentorship, or the program itself.' },
  { label: 'After', description: 'The transformation — in their own words.' },
]

export function TransformativeResults() {
  return (
    <section className="bg-cream">
      <div className="mx-auto max-w-content px-6 py-20">
        <h2 className="font-heading text-3xl font-bold text-navy sm:text-4xl">
          Real Transformation
        </h2>
        <p className="mt-3 max-w-2xl text-navy-600">
          Every story here follows the same standard: specific, credible, and consented to by the
          client — not generic praise.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {stages.map((stage) => (
            <div key={stage.label} className="rounded-2xl border border-navy-100 bg-white p-6">
              <p className="font-heading text-sm font-semibold uppercase tracking-wide text-gold-500">
                {stage.label}
              </p>
              <p className="mt-3 text-sm text-navy-500">{stage.description}</p>
            </div>
          ))}
        </div>
        <div className="mt-8">
          <Link href="/testimonials" className="text-sm font-semibold text-gold-500 hover:underline">
            Read client stories &rarr;
          </Link>
        </div>
      </div>
    </section>
  )
}
