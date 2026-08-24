'use client'

import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'

const categories = [
  'Relationships',
  'Marriage',
  'Manhood',
  'Identity',
  'Purpose',
  'Kingdom Life',
  'Leadership',
  'Business',
  'Society',
]

const publicationOptions: { value: 'first_name' | 'anonymous' | 'private'; label: string }[] = [
  { value: 'first_name', label: 'You may publish my first name' },
  { value: 'anonymous', label: 'Publish anonymously if selected' },
  { value: 'private', label: 'Keep this question private' },
]

const questionLimit = 1000
const contextLimit = 600

export function AskSalimForm() {
  const [category, setCategory] = useState(categories[0])
  const [question, setQuestion] = useState('')
  const [context, setContext] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [publication, setPublication] = useState(publicationOptions[1].value)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const { showToast } = useToast()

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)

    try {
      const res = await fetch('/api/ask-salim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category,
          question,
          context: context.trim() || undefined,
          askerName: name.trim() || undefined,
          askerEmail: email.trim() || undefined,
          publicationPreference: publication,
        }),
      })

      if (!res.ok) {
        showToast('Could not submit your question. Please try again.', 'error')
        return
      }

      setSubmitted(true)
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="text-center" data-testid="ask-salim-submitted">
        <p className="font-heading text-xl font-semibold text-navy">Question received.</p>
        <p className="mt-3 text-navy-600">
          It has been added to the review queue. Selected questions are answered and
          published right here on Ask Salim. Check back, or watch for a response in
          the newsletter.
        </p>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-7"
      data-testid="ask-salim-form"
    >
      <div>
        <label
          htmlFor="question-category"
          className="block font-semibold text-navy"
        >
          What is your question about?
        </label>
        <select
          id="question-category"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="mt-3 min-h-12 w-full rounded-none border border-navy-200 bg-white px-4 py-3 text-base text-navy focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold/30"
        >
          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <div>
        <div className="flex items-end justify-between gap-4">
          <label htmlFor="question" className="block font-semibold text-navy">
            Your question
          </label>
          <span
            className="text-xs font-medium text-navy-400"
            aria-live="polite"
          >
            {question.length}/{questionLimit}
          </span>
        </div>
        <p
          id="question-guidance"
          className="mt-2 text-sm leading-6 text-navy-500"
        >
          Ask one precise question. Remove names or details that could identify
          another person.
        </p>
        <textarea
          id="question"
          required
          minLength={20}
          maxLength={questionLimit}
          rows={6}
          value={question}
          onChange={(event) => setQuestion(event.target.value)}
          aria-describedby="question-guidance"
          placeholder="What decision, pattern, or responsibility are you trying to understand?"
          className="mt-3 w-full resize-y rounded-none border border-navy-200 bg-white px-4 py-3 text-base leading-7 text-navy placeholder:text-navy-300 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold/30"
        />
      </div>

      <div>
        <div className="flex items-end justify-between gap-4">
          <label
            htmlFor="question-context"
            className="block font-semibold text-navy"
          >
            Helpful context{' '}
            <span className="font-normal text-navy-400">(optional)</span>
          </label>
          <span
            className="text-xs font-medium text-navy-400"
            aria-live="polite"
          >
            {context.length}/{contextLimit}
          </span>
        </div>
        <p
          id="context-guidance"
          className="mt-2 text-sm leading-6 text-navy-500"
        >
          Share only what changes the meaning of the question. Do not include
          confidential information.
        </p>
        <textarea
          id="question-context"
          maxLength={contextLimit}
          rows={4}
          value={context}
          onChange={(event) => setContext(event.target.value)}
          aria-describedby="context-guidance"
          placeholder="What has already happened, and what have you tried?"
          className="mt-3 w-full resize-y rounded-none border border-navy-200 bg-white px-4 py-3 text-base leading-7 text-navy placeholder:text-navy-300 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold/30"
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label
            htmlFor="question-name"
            className="block font-semibold text-navy"
          >
            Your first name{' '}
            <span className="font-normal text-navy-400">(optional)</span>
          </label>
          <input
            id="question-name"
            value={name}
            maxLength={80}
            onChange={(event) => setName(event.target.value)}
            placeholder="Anonymous"
            className="mt-3 min-h-12 w-full rounded-none border border-navy-200 bg-white px-4 py-3 text-base text-navy placeholder:text-navy-300 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold/30"
          />
        </div>
        <div>
          <label
            htmlFor="publication-preference"
            className="block font-semibold text-navy"
          >
            Publication preference
          </label>
          <select
            id="publication-preference"
            value={publication}
            onChange={(event) => setPublication(event.target.value as typeof publication)}
            className="mt-3 min-h-12 w-full rounded-none border border-navy-200 bg-white px-4 py-3 text-base text-navy focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold/30"
          >
            {publicationOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label htmlFor="question-email" className="block font-semibold text-navy">
          Your email <span className="font-normal text-navy-400">(optional)</span>
        </label>
        <p className="mt-2 text-sm leading-6 text-navy-500">
          Only used if a private follow-up is needed. Never published.
        </p>
        <input
          id="question-email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="mt-3 min-h-12 w-full rounded-none border border-navy-200 bg-white px-4 py-3 text-base text-navy focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold/30"
        />
      </div>

      <div className="border-t border-navy-200 pt-6">
        <Button type="submit" size="lg" disabled={submitting}>
          {submitting ? 'Submitting…' : 'Submit Your Question'}
        </Button>
      </div>
    </form>
  )
}
