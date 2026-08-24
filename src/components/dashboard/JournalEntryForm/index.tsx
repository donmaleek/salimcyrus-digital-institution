'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'

export interface JournalEntryFormValues {
  id?: string
  title: string
  subtitle: string
  category: string
  summary: string
  thesis: string
  body: string
  readingTime: string
  status: 'draft' | 'published'
}

const categories = [
  'Relationships and Society',
  'Identity',
  'Manhood',
  'Purpose and Work',
  'Kingdom Life',
  'Society',
]

export function JournalEntryForm({ initial }: { initial?: JournalEntryFormValues }) {
  const [values, setValues] = useState<JournalEntryFormValues>(
    initial ?? {
      title: '',
      subtitle: '',
      category: categories[0],
      summary: '',
      thesis: '',
      body: '',
      readingTime: '',
      status: 'draft',
    }
  )
  const [submitting, setSubmitting] = useState<'draft' | 'published' | null>(null)
  const { showToast } = useToast()
  const router = useRouter()

  function update<K extends keyof JournalEntryFormValues>(field: K, value: JournalEntryFormValues[K]) {
    setValues((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSave(status: 'draft' | 'published') {
    setSubmitting(status)

    try {
      const payload = {
        title: values.title,
        subtitle: values.subtitle || undefined,
        category: values.category,
        summary: values.summary,
        thesis: values.thesis || undefined,
        body: values.body,
        readingTime: values.readingTime || undefined,
        status,
      }

      const res = values.id
        ? await fetch(`/api/admin/journal/${values.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })
        : await fetch('/api/admin/journal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        showToast(typeof body.error === 'string' ? body.error : 'Could not save. Check every field.', 'error')
        return
      }

      showToast(status === 'published' ? 'Published.' : 'Draft saved.')
      router.push('/dashboard/admin/journal')
      router.refresh()
    } finally {
      setSubmitting(null)
    }
  }

  const fieldClass =
    'mt-3 w-full rounded-none border border-navy-200 bg-white px-4 py-3 text-base text-navy focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold/30'

  return (
    <form className="space-y-7" data-testid="journal-entry-form">
      <div>
        <label htmlFor="entry-title" className="block font-semibold text-navy">
          Title
        </label>
        <input
          id="entry-title"
          required
          minLength={3}
          value={values.title}
          onChange={(e) => update('title', e.target.value)}
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor="entry-subtitle" className="block font-semibold text-navy">
          Subtitle <span className="font-normal text-navy-400">(optional)</span>
        </label>
        <input
          id="entry-subtitle"
          value={values.subtitle}
          onChange={(e) => update('subtitle', e.target.value)}
          className={fieldClass}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="entry-category" className="block font-semibold text-navy">
            Category
          </label>
          <select
            id="entry-category"
            value={values.category}
            onChange={(e) => update('category', e.target.value)}
            className={fieldClass}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="entry-reading-time" className="block font-semibold text-navy">
            Reading time <span className="font-normal text-navy-400">(optional)</span>
          </label>
          <input
            id="entry-reading-time"
            placeholder="e.g. 8 minute read"
            value={values.readingTime}
            onChange={(e) => update('readingTime', e.target.value)}
            className={fieldClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="entry-summary" className="block font-semibold text-navy">
          Summary
        </label>
        <p className="mt-2 text-sm text-navy-500">
          A short overview shown on the Journal listing page and used as the page description.
        </p>
        <textarea
          id="entry-summary"
          required
          minLength={10}
          rows={3}
          value={values.summary}
          onChange={(e) => update('summary', e.target.value)}
          className={`${fieldClass} resize-y leading-7`}
        />
      </div>

      <div>
        <label htmlFor="entry-thesis" className="block font-semibold text-navy">
          Central thesis <span className="font-normal text-navy-400">(optional)</span>
        </label>
        <p className="mt-2 text-sm text-navy-500">
          One sentence stating the essay&apos;s core argument. Shown pulled out on the entry page.
        </p>
        <textarea
          id="entry-thesis"
          rows={2}
          value={values.thesis}
          onChange={(e) => update('thesis', e.target.value)}
          className={`${fieldClass} resize-y leading-7`}
        />
      </div>

      <div>
        <label htmlFor="entry-body" className="block font-semibold text-navy">
          Essay
        </label>
        <p className="mt-2 text-sm text-navy-500">
          The full essay. Leave a blank line between paragraphs.
        </p>
        <textarea
          id="entry-body"
          required
          minLength={50}
          rows={20}
          value={values.body}
          onChange={(e) => update('body', e.target.value)}
          className={`${fieldClass} resize-y leading-7`}
        />
      </div>

      <div className="flex flex-wrap gap-4 border-t border-navy-200 pt-6">
        <Button
          type="button"
          variant="outline"
          disabled={submitting !== null}
          onClick={() => handleSave('draft')}
        >
          {submitting === 'draft' ? 'Saving…' : 'Save Draft'}
        </Button>
        <Button
          type="button"
          disabled={submitting !== null}
          onClick={() => handleSave('published')}
        >
          {submitting === 'published' ? 'Publishing…' : 'Publish'}
        </Button>
      </div>
    </form>
  )
}
