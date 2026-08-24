'use client'

import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { CONTACT_EMAIL } from '@/lib/utils/constants'

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

const publicationOptions = [
  'You may publish my first name',
  'Publish anonymously if selected',
  'Keep this question private',
]

const questionLimit = 1000
const contextLimit = 600

export function AskSalimForm() {
  const [category, setCategory] = useState(categories[0])
  const [question, setQuestion] = useState('')
  const [context, setContext] = useState('')
  const [name, setName] = useState('')
  const [publication, setPublication] = useState(publicationOptions[1])
  const { showToast } = useToast()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const sender = name.trim() || 'Anonymous'
    const body = encodeURIComponent(
      [
        `Category: ${category}`,
        `Question: ${question.trim()}`,
        `Helpful context: ${context.trim() || 'Not provided'}`,
        `From: ${sender}`,
        `Publication preference: ${publication}`,
      ].join('\n\n')
    )
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=Ask%20Salim%3A%20${encodeURIComponent(category)}&body=${body}`
    showToast(
      'Email draft prepared. Review it and press send in your email app.'
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
            onChange={(event) => setPublication(event.target.value)}
            className="mt-3 min-h-12 w-full rounded-none border border-navy-200 bg-white px-4 py-3 text-base text-navy focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold/30"
          >
            {publicationOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="border-t border-navy-200 pt-6">
        <Button type="submit" size="lg">
          Prepare Email
        </Button>
        <p className="mt-4 max-w-xl text-sm leading-6 text-navy-500">
          This opens your email application with the question prepared. Review
          the draft and press send to complete your submission.
        </p>
      </div>
    </form>
  )
}
