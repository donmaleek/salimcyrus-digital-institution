import type { Metadata } from 'next'
import { AskSalimForm } from '@/components/forms/AskSalimForm'

export const metadata: Metadata = {
  title: 'Ask Salim',
  description: 'Submit a question — selected answers are published publicly.',
}

export default function AskSalimPage() {
  return (
    <section className="bg-cream">
      <div className="mx-auto max-w-content px-6 py-20">
        <p className="font-body text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
          Ask Salim
        </p>
        <h1 className="mt-4 font-heading text-4xl font-bold text-navy sm:text-5xl">
          Your Question, Answered Publicly
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-navy-600">
          Submit a question on relationships, marriage, manhood, purpose, business, kingdom, or
          leadership. Selected questions are answered here, on video, and in the newsletter.
        </p>

        <div className="mt-14 max-w-xl rounded-2xl border border-navy-100 bg-white p-8">
          <AskSalimForm />
        </div>

        <p className="mt-10 text-sm text-navy-400">
          Answered questions will be published here as they&apos;re recorded.
        </p>
      </div>
    </section>
  )
}
