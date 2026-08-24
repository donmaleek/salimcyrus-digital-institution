import type { Metadata } from 'next'
import Link from 'next/link'
import { ContactForm } from '@/components/forms/ContactForm'
import { Button } from '@/components/ui/Button'
import { PageHero } from '@/components/layout/PageHero'
import { CONTACT_EMAIL, WHATSAPP_URL } from '@/lib/utils/constants'

export const metadata: Metadata = {
  title: 'Contact Salim Cyrus and Halisi Hub Connect',
  description:
    'Choose the right contact pathway for coaching, speaking, consulting, media, Halisi Hub Connect, partnerships, public questions, or general enquiries.',
}

const pathways = [
  {
    number: '01',
    label: 'Private Coaching',
    description:
      'For personal clarity, relationship work, identity formation, and structured private support.',
    action: 'Explore coaching',
    href: '/work-with-salim/coaching',
  },
  {
    number: '02',
    label: 'Speaking Invitations',
    description:
      'For conferences, churches, organizations, panels, workshops, and leadership gatherings.',
    action: 'Plan a speaking engagement',
    href: '/work-with-salim/speaking',
  },
  {
    number: '03',
    label: 'Consulting and Partnerships',
    description:
      'For institutions, founders, teams, programs, and aligned collaborative work.',
    action: 'Discuss consulting',
    href: '/work-with-salim/consulting',
  },
  {
    number: '04',
    label: 'Halisi Hub Connect',
    description:
      'For community participation, institutional programs, initiatives, and membership.',
    action: 'Enter Halisi Hub Connect',
    href: '/halisi-hub-connect',
  },
  {
    number: '05',
    label: 'Media and Interviews',
    description:
      'For interview requests, editorial enquiries, biographies, approved images, and press information.',
    action: 'Open the press kit',
    href: '/media/press-kit',
  },
  {
    number: '06',
    label: 'Ask Salim',
    description:
      'For a thoughtful question that may become a public written, recorded, or newsletter answer.',
    action: 'Ask a public question',
    href: '/ask-salim',
  },
]

const messageChecklist = [
  'State the purpose of the enquiry in the first sentence',
  'Include relevant dates, location, audience, or delivery format',
  'Explain the decision or response you need from the team',
  'Share a realistic deadline if the request is time-sensitive',
  'Use the specialist pathway above when it matches your request',
]

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Start With the Right Conversation"
        description="Contact Salim Cyrus and Halisi Hub Connect for coaching, speaking, consulting, media, partnerships, community, or general institutional enquiries."
        actions={
          <>
            <Button href="#contact-pathways" size="lg">
              Choose a Pathway
            </Button>
            <Button href="#general-enquiry" variant="outline-inverse" size="lg">
              Send a General Enquiry
            </Button>
          </>
        }
      />

      <main data-testid="contact-content">
        <section className="bg-cream" aria-labelledby="routing-heading">
          <div className="mx-auto grid max-w-content gap-12 px-6 py-16 sm:py-24 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
                The Contact Desk
              </p>
              <h2
                id="routing-heading"
                className="mt-3 font-heading text-4xl font-bold leading-tight text-navy sm:text-5xl"
              >
                One entrance. Clear routes to the right work.
              </h2>
            </div>
            <div className="space-y-6 text-lg leading-8 text-navy-600">
              <p>
                This page is the operational contact point for Salim Cyrus and
                Halisi Hub Connect. Choose the pathway closest to your request
                so you can see the relevant information before writing.
              </p>
              <p>
                Ask Salim remains separate because it serves a different
                purpose. It is for thoughtful questions that may receive public
                answers. Contact is for private coordination, bookings,
                partnerships, media, and administration.
              </p>
            </div>
          </div>
        </section>

        <section
          id="contact-pathways"
          className="scroll-mt-24 bg-white"
          aria-labelledby="pathways-heading"
        >
          <div className="mx-auto max-w-content px-6 py-16 sm:py-24">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
                Choose the Right Path
              </p>
              <h2
                id="pathways-heading"
                className="mt-3 font-heading text-3xl font-bold text-navy sm:text-4xl"
              >
                Where should your enquiry begin?
              </h2>
              <p className="mt-5 text-lg leading-8 text-navy-600">
                Each route answers common questions and gathers the information
                needed for that type of engagement.
              </p>
            </div>
            <ol
              className="mt-12 border-t border-navy-200"
              data-testid="contact-pathways"
            >
              {pathways.map((pathway) => (
                <li key={pathway.href} className="border-b border-navy-200">
                  <Link
                    href={pathway.href}
                    className="group grid gap-4 py-7 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold sm:grid-cols-[56px_0.55fr_1.05fr_0.7fr] sm:items-center sm:gap-7"
                  >
                    <span className="font-heading font-bold text-gold-500">
                      {pathway.number}
                    </span>
                    <h3 className="font-heading text-2xl font-semibold text-navy transition-colors group-hover:text-gold-500">
                      {pathway.label}
                    </h3>
                    <p className="leading-7 text-navy-600">
                      {pathway.description}
                    </p>
                    <span className="font-semibold text-navy group-hover:text-gold-500 sm:text-right">
                      {pathway.action} <span aria-hidden>→</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section
          className="bg-navy text-cream"
          aria-labelledby="direct-heading"
        >
          <div className="mx-auto grid max-w-content gap-12 px-6 py-16 sm:py-24 lg:grid-cols-[0.68fr_1.32fr] lg:gap-20">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">
                Direct Contact
              </p>
              <h2
                id="direct-heading"
                className="mt-3 font-heading text-3xl font-bold sm:text-4xl"
              >
                Prefer email or WhatsApp?
              </h2>
            </div>
            <div className="grid border-y border-cream/20 sm:grid-cols-2">
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="group py-7 sm:pr-8"
              >
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-gold">
                  Email
                </span>
                <span className="mt-3 block break-all font-heading text-xl font-semibold text-cream group-hover:text-gold">
                  {CONTACT_EMAIL}
                </span>
                <span className="mt-3 block text-sm leading-6 text-cream/60">
                  Best for detailed requests, documents, and formal
                  coordination.
                </span>
              </a>
              <a
                href={WHATSAPP_URL}
                className="group border-t border-cream/20 py-7 sm:border-l sm:border-t-0 sm:pl-8"
              >
                <span className="text-xs font-bold uppercase tracking-[0.16em] text-gold">
                  WhatsApp
                </span>
                <span className="mt-3 block font-heading text-xl font-semibold text-cream group-hover:text-gold">
                  Message the team
                </span>
                <span className="mt-3 block text-sm leading-6 text-cream/60">
                  Best for a concise first contact or time-sensitive
                  coordination.
                </span>
              </a>
            </div>
          </div>
        </section>

        <section
          id="general-enquiry"
          className="scroll-mt-24 bg-cream"
          aria-labelledby="enquiry-heading"
        >
          <div className="mx-auto grid max-w-content gap-12 px-6 py-16 sm:py-24 lg:grid-cols-[0.58fr_1.42fr] lg:gap-20">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
                General Enquiry
              </p>
              <h2
                id="enquiry-heading"
                className="mt-3 font-heading text-4xl font-bold text-navy sm:text-5xl"
              >
                Still not sure where it belongs?
              </h2>
              <p className="mt-5 text-lg leading-8 text-navy-600">
                Use this form for general institutional messages or requests
                that do not fit a specialist pathway.
              </p>
              <div className="mt-8 border-y border-navy-200 py-6 text-sm leading-6 text-navy-500">
                <p className="font-semibold text-navy">Before sending</p>
                <p className="mt-2">
                  Do not include passwords, payment card information, private
                  identity documents, medical records, or confidential material
                  that is not needed for the first contact.
                </p>
              </div>
            </div>
            <div className="border-t-4 border-gold-500 bg-white p-7 shadow-[0_24px_60px_rgba(15,27,45,0.08)] sm:p-10">
              <ContactForm />
            </div>
          </div>
        </section>

        <section className="bg-white" aria-labelledby="message-heading">
          <div className="mx-auto grid max-w-content gap-12 px-6 py-16 sm:py-24 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
                A Useful First Message
              </p>
              <h2
                id="message-heading"
                className="mt-3 font-heading text-3xl font-bold text-navy sm:text-4xl"
              >
                Help the team understand and route your request.
              </h2>
            </div>
            <ol
              className="border-t border-navy-200"
              data-testid="message-checklist"
            >
              {messageChecklist.map((item, index) => (
                <li
                  key={item}
                  className="grid grid-cols-[48px_1fr] border-b border-navy-200 py-5"
                >
                  <span className="font-heading font-bold text-gold-500">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="font-semibold leading-7 text-navy-700">
                    {item}
                  </span>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section
          className="bg-navy text-cream"
          aria-labelledby="expectations-heading"
        >
          <div className="mx-auto grid max-w-content gap-12 px-6 py-16 sm:py-24 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">
                Response Expectations
              </p>
              <h2
                id="expectations-heading"
                className="mt-3 font-heading text-3xl font-bold sm:text-4xl"
              >
                Clear communication works both ways.
              </h2>
            </div>
            <div className="space-y-5 text-lg leading-8 text-cream/75">
              <p>
                Every message should receive the level of attention appropriate
                to its purpose, but sending an enquiry does not confirm a
                booking, partnership, appearance, or professional engagement.
              </p>
              <p>
                Formal work begins only after scope, availability, terms, and
                the next step have been confirmed by the relevant parties.
                Urgent safety matters should be directed to appropriate local
                emergency or crisis services.
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
