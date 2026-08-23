'use client'

import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { CONTACT_EMAIL } from '@/lib/utils/constants'

const initialValues = {
  organization: '',
  eventType: '',
  date: '',
  location: '',
  audienceSize: '',
  topic: '',
  budget: '',
  contact: '',
}

export function SpeakingEnquiryForm() {
  const [values, setValues] = useState(initialValues)
  const { showToast } = useToast()

  function update(field: keyof typeof values) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setValues((prev) => ({ ...prev, [field]: e.target.value }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const body = Object.entries(values)
      .map(([key, value]) => `${key}: ${value}`)
      .join('%0D%0A')
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=Speaking%20Enquiry&body=${body}`
    showToast('Opening your email client to send the enquiry…')
    setValues(initialValues)
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
      <Field label="Organization" value={values.organization} onChange={update('organization')} required />
      <Field label="Event Type" value={values.eventType} onChange={update('eventType')} required />
      <Field label="Date" type="date" value={values.date} onChange={update('date')} />
      <Field label="Location" value={values.location} onChange={update('location')} />
      <Field label="Audience Size" value={values.audienceSize} onChange={update('audienceSize')} />
      <Field label="Budget Range" value={values.budget} onChange={update('budget')} />
      <Field label="Topic" value={values.topic} onChange={update('topic')} className="sm:col-span-2" />
      <Field label="Your Contact Details" value={values.contact} onChange={update('contact')} required className="sm:col-span-2" />
      <div className="sm:col-span-2">
        <Button type="submit">Request Salim Cyrus</Button>
      </div>
    </form>
  )
}

function Field({
  label,
  className = '',
  ...props
}: {
  label: string
  className?: string
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className={`block text-sm font-medium text-navy-700 ${className}`}>
      {label}
      <input
        {...props}
        className="mt-1 w-full rounded-lg border border-navy-200 px-4 py-2 text-navy focus:outline-none focus:ring-2 focus:ring-gold"
      />
    </label>
  )
}
