import Link from 'next/link'

const services = [
  {
    number: '01',
    title: 'I need clarity now',
    description: 'Private coaching for a decision, relationship, transition, recurring pattern, or season that needs honest structure and accountable action.',
    href: '/work-with-salim',
    action: 'Compare ways to work together',
  },
  {
    number: '02',
    title: 'I want structured formation',
    description: 'Courses, masterclasses, bootcamps, and intensives for identity, relationships, manhood, discipline, leadership, and Kingdom thinking.',
    href: '/academy',
    action: 'Enter the Academy',
  },
  {
    number: '03',
    title: 'I want ideas I can study',
    description: 'Read books, essays, practical frameworks, and seven fields of teaching at your own pace, then return when the next question appears.',
    href: '/knowledge-centre',
    action: 'Explore the Knowledge Centre',
  },
  {
    number: '04',
    title: 'I want community and contribution',
    description: 'Join Halisi Hub Connect for mentorship, learning, community formation, practical service, and work that strengthens people together.',
    href: '/halisi-hub-connect',
    action: 'Discover Halisi Hub Connect',
  },
]

export function ServicesOverview() {
  return (
    <section className="bg-cream" data-testid="home-pathways">
      <div className="mx-auto max-w-content px-6 py-16 sm:py-24">
        <div className="grid gap-6 border-b border-navy/15 pb-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gold-500">Choose by need</p>
            <h2 className="mt-3 font-heading text-4xl font-bold leading-tight text-navy sm:text-5xl">Start with the question you are carrying.</h2>
          </div>
          <p className="max-w-2xl text-lg leading-8 text-navy-600 lg:justify-self-end">You do not need to understand the whole institution before you begin. Choose the outcome you need now. Every path is designed to move insight into responsible action.</p>
        </div>
        <div className="divide-y divide-navy/15">
          {services.map((service) => (
            <Link key={service.href} href={service.href} className="group grid gap-4 py-8 sm:grid-cols-[64px_0.8fr_1.2fr_auto] sm:items-center sm:gap-6">
              <span className="font-heading text-2xl text-gold-500">{service.number}</span>
              <h3 className="font-heading text-2xl font-semibold text-navy group-hover:text-gold-500">{service.title}</h3>
              <p className="leading-7 text-navy-600">{service.description}</p>
              <span className="text-sm font-bold text-navy underline decoration-gold underline-offset-8">{service.action}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
