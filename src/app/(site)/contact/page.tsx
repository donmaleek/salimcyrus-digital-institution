import type { Metadata } from 'next'
import Link from 'next/link'
import { ContactForm } from '@/components/forms/ContactForm'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Pathways to engage with Salim Cyrus and Halisi Hub Connect.',
}

const pathways = [
  { label: 'I want coaching', action: 'Book a session', href: '/work-with-salim/coaching' },
  { label: 'I want to invite Salim to speak', action: 'Speaking enquiry', href: '/work-with-salim/speaking' },
  { label: 'I want to join Halisi Hub Connect', action: 'Membership', href: '/halisi-hub-connect/community' },
  { label: 'I have a business enquiry', action: 'Business contact', href: '/work-with-salim/consulting' },
  { label: 'I want to support the mission', action: 'Support page', href: '/support-the-mission' },
  { label: 'Media enquiry', action: 'Press kit', href: '/media/press-kit' },
]

export default function ContactPage() {
  return (
    <>
      <section className="border-b border-navy-100 bg-cream">
        <div className="mx-auto max-w-content px-6 py-20">
          <p className="font-body text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
            Contact
          </p>
          <h1 className="mt-4 font-heading text-4xl font-bold text-navy sm:text-5xl">
            How Can We Help?
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-navy-600">
            Choose the pathway that fits, or send a general message below.
          </p>
        </div>
      </section>

      <section className="bg-navy-50">
        <div className="mx-auto max-w-content px-6 py-16">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pathways.map((pathway) => (
              <Link
                key={pathway.href}
                href={pathway.href}
                className="rounded-2xl border border-navy-100 bg-white p-6 transition-shadow hover:shadow-lg"
              >
                <p className="font-medium text-navy">{pathway.label}</p>
                <p className="mt-1 text-sm font-semibold text-gold-500">{pathway.action} &rarr;</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-cream">
        <div className="mx-auto max-w-content px-6 py-16">
          <h2 className="font-heading text-2xl font-bold text-navy">General Message</h2>
          <div className="mt-8 max-w-xl rounded-2xl border border-navy-100 bg-white p-8">
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  )
}
