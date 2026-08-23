import Link from 'next/link'

const services = [
  {
    title: '1-on-1 & Couples Coaching',
    description: 'Private relationship, marriage, life & purpose, and manhood coaching.',
    href: '/work-with-salim/coaching',
  },
  {
    title: 'Masterclasses',
    description: 'Paid live online classes on relationships, purpose, and leadership.',
    href: '/academy/masterclasses',
  },
  {
    title: 'Academy Courses',
    description: 'Self-paced programs: Relationship Mastery, Defining Manhood, Kingdom Mentality.',
    href: '/academy/courses',
  },
  {
    title: 'Halisi Inner Circle',
    description: 'A monthly membership community for ongoing mentorship and teaching.',
    href: '/halisi-hub-connect/community',
  },
  {
    title: 'Books & Digital Library',
    description: 'E-books, guides, and workbooks including The Greatest Tragedy.',
    href: '/books',
  },
  {
    title: 'Speaking & Consulting',
    description: 'Corporate, church, and organizational bookings for events and conferences.',
    href: '/work-with-salim/speaking',
  },
]

export function ServicesOverview() {
  return (
    <section className="bg-cream">
      <div className="mx-auto max-w-content px-6 py-20">
        <h2 className="font-heading text-3xl font-bold text-navy sm:text-4xl">Work With Salim</h2>
        <p className="mt-3 max-w-2xl text-navy-600">
          From a single free teaching to premium transformation programs — find the path that
          fits where you are.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Link
              key={service.href}
              href={service.href}
              className="group rounded-2xl border border-navy-100 bg-white p-6 transition-shadow hover:shadow-lg"
            >
              <h3 className="font-heading text-lg font-semibold text-navy group-hover:text-gold-500">
                {service.title}
              </h3>
              <p className="mt-2 text-sm text-navy-500">{service.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
