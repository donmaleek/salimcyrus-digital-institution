import type { Metadata } from 'next'
import { Accordion } from '@/components/ui/Accordion'
import { JsonLd } from '@/components/sections/shared/SEO'
import { PageHero } from '@/components/layout/PageHero'

export const metadata: Metadata = {
  title: 'FAQ',
  description:
    'Frequently asked questions about coaching, booking, and payments.',
}

const faqs = [
  {
    question: 'How much does coaching cost?',
    answer:
      'Pricing for each session type is shown on the Coaching page and at checkout.',
  },
  {
    question: 'How do I book?',
    answer:
      'Use the "Book a Session" button anywhere on the site, or the Contact page.',
  },
  {
    question: 'Is coaching online?',
    answer:
      'Yes — sessions are conducted online, with in-person availability for select engagements.',
  },
  {
    question: 'Do you coach couples?',
    answer: 'Yes, couples coaching is available alongside individual coaching.',
  },
  {
    question: 'Do you coach internationally?',
    answer: 'Yes — international clients can pay by card at checkout.',
  },
  {
    question: 'How do payments work?',
    answer:
      'M-PESA and card payments are supported for Kenyan clients; international clients pay by card.',
  },
  {
    question: 'What happens after booking?',
    answer:
      'You will receive a confirmation with session details and any preparation notes.',
  },
  {
    question: 'Can I cancel?',
    answer: 'See the Refund/Cancellation Policy for full terms.',
  },
  {
    question: 'Is coaching confidential?',
    answer: 'Yes, sessions are treated as confidential.',
  },
  {
    question: 'Do you provide therapy?',
    answer:
      'Coaching is not a substitute for licensed therapy or medical care — see the Coaching Disclaimer.',
  },
  {
    question: 'Do you provide financial/investment advice?',
    answer:
      'Business content is educational and not individualized financial or investment advice.',
  },
]

export default function FaqPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  }

  return (
    <>
      <PageHero
        eyebrow="FAQ"
        title="Frequently Asked Questions"
        description="Clear answers about coaching, booking, payments, confidentiality, and what to expect."
      />
      <section className="bg-cream">
        <JsonLd data={jsonLd} />
        <div className="mx-auto max-w-content px-6 py-20">
          <div className="mt-12">
            <Accordion
              items={faqs.map((f) => ({
                question: f.question,
                answer: f.answer,
              }))}
            />
          </div>
        </div>
      </section>
    </>
  )
}
