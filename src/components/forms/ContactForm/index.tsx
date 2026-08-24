'use client'

import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { CONTACT_EMAIL } from '@/lib/utils/constants'

const enquiryTypes = [
  'General enquiry',
  'Partnership or collaboration',
  'Halisi Hub Connect',
  'Books or resources',
  'Media or interview',
  'Website support',
]

const messageLimit = 1500

export function ContactForm() {
  const [values, setValues] = useState({
    enquiryType: enquiryTypes[0],
    name: '',
    email: '',
    organization: '',
    whatsapp: '',
    message: '',
  })
  const { showToast } = useToast()

  function update(
    field: keyof typeof values
  ): React.ChangeEventHandler<
    HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
  > {
    return (event) =>
      setValues((previous) => ({ ...previous, [field]: event.target.value }))
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const body = encodeURIComponent(
      [
        `Enquiry type: ${values.enquiryType}`,
        `Message: ${values.message.trim()}`,
        `From: ${values.name.trim()}`,
        `Email: ${values.email.trim()}`,
        `Organization: ${values.organization.trim() || 'Not provided'}`,
        `WhatsApp: ${values.whatsapp.trim() || 'Not provided'}`,
      ].join('\n\n')
    )
    const subject = encodeURIComponent(`Website enquiry: ${values.enquiryType}`)
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`
    showToast(
      'Email draft prepared. Review it and press send in your email app.'
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-7"
      data-testid="contact-form"
    >
      <div>
        <label htmlFor="enquiry-type" className="block font-semibold text-navy">
          Enquiry type
        </label>
        <select
          id="enquiry-type"
          value={values.enquiryType}
          onChange={update('enquiryType')}
          className="mt-3 min-h-12 w-full rounded-none border border-navy-200 bg-white px-4 py-3 text-base text-navy focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold/30"
        >
          {enquiryTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label
            htmlFor="contact-name"
            className="block font-semibold text-navy"
          >
            Name
          </label>
          <input
            id="contact-name"
            required
            autoComplete="name"
            maxLength={100}
            value={values.name}
            onChange={update('name')}
            className="mt-3 min-h-12 w-full rounded-none border border-navy-200 bg-white px-4 py-3 text-base text-navy focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold/30"
          />
        </div>
        <div>
          <label
            htmlFor="contact-email"
            className="block font-semibold text-navy"
          >
            Email
          </label>
          <input
            id="contact-email"
            type="email"
            required
            autoComplete="email"
            maxLength={200}
            value={values.email}
            onChange={update('email')}
            className="mt-3 min-h-12 w-full rounded-none border border-navy-200 bg-white px-4 py-3 text-base text-navy focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold/30"
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label
            htmlFor="contact-organization"
            className="block font-semibold text-navy"
          >
            Organization{' '}
            <span className="font-normal text-navy-400">(optional)</span>
          </label>
          <input
            id="contact-organization"
            autoComplete="organization"
            maxLength={160}
            value={values.organization}
            onChange={update('organization')}
            className="mt-3 min-h-12 w-full rounded-none border border-navy-200 bg-white px-4 py-3 text-base text-navy focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold/30"
          />
        </div>
        <div>
          <label
            htmlFor="contact-whatsapp"
            className="block font-semibold text-navy"
          >
            WhatsApp{' '}
            <span className="font-normal text-navy-400">(optional)</span>
          </label>
          <input
            id="contact-whatsapp"
            type="tel"
            autoComplete="tel"
            maxLength={40}
            value={values.whatsapp}
            onChange={update('whatsapp')}
            placeholder="Include country code"
            className="mt-3 min-h-12 w-full rounded-none border border-navy-200 bg-white px-4 py-3 text-base text-navy placeholder:text-navy-300 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold/30"
          />
        </div>
      </div>

      <div>
        <div className="flex items-end justify-between gap-4">
          <label
            htmlFor="contact-message"
            className="block font-semibold text-navy"
          >
            Message
          </label>
          <span
            className="text-xs font-medium text-navy-400"
            aria-live="polite"
          >
            {values.message.length}/{messageLimit}
          </span>
        </div>
        <p
          id="contact-message-guidance"
          className="mt-2 text-sm leading-6 text-navy-500"
        >
          Include the desired outcome, relevant dates, location or format, and
          the next decision you need from the team.
        </p>
        <textarea
          id="contact-message"
          required
          minLength={20}
          maxLength={messageLimit}
          rows={7}
          value={values.message}
          onChange={update('message')}
          aria-describedby="contact-message-guidance"
          placeholder="Tell us what you are planning and how we can help."
          className="mt-3 w-full resize-y rounded-none border border-navy-200 bg-white px-4 py-3 text-base leading-7 text-navy placeholder:text-navy-300 focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold/30"
        />
      </div>

      <div className="border-t border-navy-200 pt-6">
        <Button type="submit" size="lg">
          Prepare Email
        </Button>
        <p className="mt-4 max-w-xl text-sm leading-6 text-navy-500">
          This opens your email application with the enquiry prepared. Review
          the draft and press send to complete your message.
        </p>
      </div>
    </form>
  )
}
