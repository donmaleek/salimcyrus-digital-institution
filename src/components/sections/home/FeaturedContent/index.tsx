import Link from 'next/link'

const pillars = [
  { title: 'Relationships', question: 'How do we love with wisdom and maturity?', href: '/knowledge-centre/category/relationships' },
  { title: 'Manhood', question: 'What does mature strength require from a man?', href: '/knowledge-centre/category/manhood' },
  { title: 'Purpose', question: 'What is this season asking me to become and build?', href: '/knowledge-centre/category/purpose' },
  { title: 'Kingdom', question: 'How should revelation change the way I live?', href: '/knowledge-centre/category/kingdom' },
  { title: 'Leadership', question: 'Can my character carry the influence I want?', href: '/knowledge-centre/category/leadership' },
  { title: 'Business', question: 'What real problem am I equipped to solve well?', href: '/knowledge-centre/category/business' },
  { title: 'Society', question: 'What must change for people and communities to flourish?', href: '/knowledge-centre/category/society' },
]

export function FeaturedContent() {
  return (
    <section className="bg-navy text-cream" data-testid="home-knowledge">
      <div className="mx-auto max-w-content px-6 py-16 sm:py-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gold">Seven fields of thought</p>
            <h2 className="mt-3 font-heading text-4xl font-bold sm:text-5xl">
              A library organized around life&apos;s real questions.
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-cream/70">
              Study a question clearly, connect it to a larger body of thought, and leave with language you can use in real decisions.
            </p>
          </div>
          <Link href="/knowledge-centre" className="text-sm font-semibold text-gold underline decoration-gold/40 underline-offset-8">
            Open the complete knowledge map
          </Link>
        </div>
        <div className="mt-12 grid border-t border-white/15 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map((pillar) => (
            <Link
              key={pillar.href}
              href={pillar.href}
              className="group border-b border-white/15 py-7 sm:px-6 sm:first:pl-0 lg:border-r lg:last:border-r-0"
            >
              <h3 className="font-heading text-xl font-semibold text-cream group-hover:text-gold">{pillar.title}</h3>
              <p className="mt-3 leading-7 text-cream/60">{pillar.question}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
