import type { Metadata } from 'next'
import { AskSalimForm } from '@/components/forms/AskSalimForm'
import { PageHero } from '@/components/layout/PageHero'

export const metadata: Metadata = {
  title: 'Ask Salim',
  description: 'Submit a question — selected answers are published publicly.',
}

export default function AskSalimPage() {
  return (
    <>
      <PageHero
        eyebrow="Ask Salim"
        title="Your Question, Answered Publicly"
        description="Submit a question on relationships, marriage, manhood, purpose, business, kingdom, or leadership. Selected questions are answered here, on video, and in the newsletter."
      />
      <section className="bg-cream">
        <div className="mx-auto max-w-content px-6 py-20">
          <div className="max-w-xl rounded-2xl border border-navy-100 bg-white p-8">
            <AskSalimForm />
          </div>

          <p className="mt-10 text-sm text-navy-400">
            Answered questions will be published here as they&apos;re recorded.
          </p>
        </div>
      </section>
    </>
  )
}
