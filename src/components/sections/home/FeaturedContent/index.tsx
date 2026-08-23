import Link from 'next/link'

const pillars = [
  { title: 'Relationships', description: 'Dating, marriage, communication, trust, boundaries.', href: '/knowledge-centre/category/relationships' },
  { title: 'Manhood & Leadership', description: 'Identity, responsibility, discipline, character.', href: '/knowledge-centre/category/manhood' },
  { title: 'Purpose', description: 'Identity, calling, destiny, meaning, vision.', href: '/knowledge-centre/category/purpose' },
  { title: 'Kingdom', description: 'Grace, sonship, spiritual maturity, biblical understanding.', href: '/knowledge-centre/category/kingdom' },
  { title: 'Business & Marketplace', description: 'Entrepreneurship, strategy, money, real estate.', href: '/knowledge-centre/category/business' },
  { title: 'Society', description: 'Culture, family, generational patterns, social reform.', href: '/knowledge-centre/category/society' },
]

export function FeaturedContent() {
  return (
    <section className="bg-navy-50">
      <div className="mx-auto max-w-content px-6 py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-heading text-3xl font-bold text-navy sm:text-4xl">
              The Knowledge Centre
            </h2>
            <p className="mt-3 max-w-2xl text-navy-600">
              A searchable library of teachings — not just a biography.
            </p>
          </div>
          <Link href="/knowledge-centre" className="text-sm font-semibold text-gold-500 hover:underline">
            Browse all categories &rarr;
          </Link>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {pillars.map((pillar) => (
            <Link
              key={pillar.href}
              href={pillar.href}
              className="rounded-2xl bg-white p-6 shadow-sm transition-shadow hover:shadow-lg"
            >
              <h3 className="font-heading text-lg font-semibold text-navy">{pillar.title}</h3>
              <p className="mt-2 text-sm text-navy-500">{pillar.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
