'use client'

import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { CONTACT_EMAIL } from '@/lib/utils/constants'

const categories = ['Relationships', 'Marriage', 'Manhood', 'Purpose', 'Business', 'Kingdom', 'Leadership']

export function AskSalimForm() {
  const [category, setCategory] = useState(categories[0])
  const [question, setQuestion] = useState('')
  const [name, setName] = useState('')
  const { showToast } = useToast()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const body = encodeURIComponent(`Category: ${category}\n\nQuestion: ${question}\n\nFrom: ${name}`)
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=Ask%20Salim&body=${body}`
    showToast('Opening your email client to send the question…')
    setQuestion('')
    setName('')
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <label className="block text-sm font-medium text-navy-700">
        Category
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="mt-1 w-full rounded-lg border border-navy-200 px-4 py-2 text-navy focus:outline-none focus:ring-2 focus:ring-gold"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>
      <label className="block text-sm font-medium text-navy-700">
        Your Question
        <textarea
          required
          rows={4}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="mt-1 w-full rounded-lg border border-navy-200 px-4 py-2 text-navy focus:outline-none focus:ring-2 focus:ring-gold"
        />
      </label>
      <label className="block text-sm font-medium text-navy-700">
        Your Name (or stay anonymous)
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Anonymous"
          className="mt-1 w-full rounded-lg border border-navy-200 px-4 py-2 text-navy focus:outline-none focus:ring-2 focus:ring-gold"
        />
      </label>
      <Button type="submit" className="justify-self-start">
        Submit Question
      </Button>
    </form>
  )
}
