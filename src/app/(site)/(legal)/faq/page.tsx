import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Frequently asked questions about coaching, booking, and payments.',
}

const faqs = [
  { q: 'How much does coaching cost?', a: 'Pricing is listed on the Coaching page, starting at KES 3,500 for a single session.' },
  { q: 'How do I book?', a: 'Use the "Book a Session" button anywhere on the site, or the Contact page.' },
  { q: 'Is coaching online?', a: 'Yes — sessions are conducted online, with in-person availability for select engagements.' },
  { q: 'Do you coach couples?', a: 'Yes, couples coaching is available alongside individual coaching.' },
  { q: 'Do you coach internationally?', a: 'Yes — international clients can pay by card at checkout.' },
  { q: 'How do payments work?', a: 'M-PESA and card payments are supported for Kenyan clients; international clients pay by card.' },
  { q: 'What happens after booking?', a: 'You will receive a confirmation with session details and any preparation notes.' },
  { q: 'Can I cancel?', a: 'See the Refund/Cancellation Policy for full terms.' },
  { q: 'Is coaching confidential?', a: 'Yes, sessions are treated as confidential.' },
  { q: 'Do you provide therapy?', a: 'Coaching is not a substitute for licensed therapy or medical care — see the Coaching Disclaimer.' },
  { q: 'Do you provide financial/investment advice?', a: 'Business content is educational and not individualized financial or investment advice.' },
]

export default function FaqPage() {
  return (
    <section className="bg-cream">
      <div className="mx-auto max-w-content px-6 py-20">
        <h1 className="font-heading text-4xl font-bold text-navy sm:text-5xl">
          Frequently Asked Questions
        </h1>
        <dl className="mt-12 divide-y divide-navy-100">
          {faqs.map((faq) => (
            <div key={faq.q} className="py-6">
              <dt className="font-heading text-lg font-semibold text-navy">{faq.q}</dt>
              <dd className="mt-2 text-navy-600">{faq.a}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
