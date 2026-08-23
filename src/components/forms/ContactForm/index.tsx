'use client'

import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/Button'

export function ContactForm() {
  const [values, setValues] = useState({ name: '', email: '', message: '' })

  function update(field: keyof typeof values) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setValues((prev) => ({ ...prev, [field]: e.target.value }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const body = encodeURIComponent(values.message + `\n\nFrom: ${values.name} (${values.email})`)
    window.location.href = `mailto:hello@salimcyrus.com?subject=Website%20Enquiry&body=${body}`
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <label className="block text-sm font-medium text-navy-700">
        Name
        <input
          required
          value={values.name}
          onChange={update('name')}
          className="mt-1 w-full rounded-lg border border-navy-200 px-4 py-2 text-navy focus:outline-none focus:ring-2 focus:ring-gold"
        />
      </label>
      <label className="block text-sm font-medium text-navy-700">
        Email
        <input
          type="email"
          required
          value={values.email}
          onChange={update('email')}
          className="mt-1 w-full rounded-lg border border-navy-200 px-4 py-2 text-navy focus:outline-none focus:ring-2 focus:ring-gold"
        />
      </label>
      <label className="block text-sm font-medium text-navy-700">
        Message
        <textarea
          required
          rows={5}
          value={values.message}
          onChange={update('message')}
          className="mt-1 w-full rounded-lg border border-navy-200 px-4 py-2 text-navy focus:outline-none focus:ring-2 focus:ring-gold"
        />
      </label>
      <Button type="submit" className="justify-self-start">
        Send Message
      </Button>
    </form>
  )
}
