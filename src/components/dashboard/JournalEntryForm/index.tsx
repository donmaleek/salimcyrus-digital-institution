'use client'

import { useMemo, useRef, useState, type ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
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
  coverImageUrl?: string
  coverImageAlt: string
  coverImageCaption: string
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
      coverImageAlt: '',
      coverImageCaption: '',
    }
  )
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null)
  const [imageRemoved, setImageRemoved] = useState(false)
  const [imageError, setImageError] = useState('')
  const [previewMode, setPreviewMode] = useState(false)
  const [submitting, setSubmitting] = useState<'draft' | 'published' | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { showToast } = useToast()
  const router = useRouter()

  function update<K extends keyof JournalEntryFormValues>(field: K, value: JournalEntryFormValues[K]) {
    setValues((prev) => ({ ...prev, [field]: value }))
  }

  const wordCount = useMemo(() => values.body.trim().split(/\s+/).filter(Boolean).length, [values.body])
  const estimatedReadingTime = `${Math.max(1, Math.ceil(wordCount / 220))} min read`
  const imagePreview = imageDataUrl ?? (!imageRemoved ? values.coverImageUrl : undefined)

  function handleImage(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    setImageError('')
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setImageError('Use a JPG, PNG, or WebP image.')
      return
    }
    if (file.size > 4 * 1024 * 1024) {
      setImageError('Image must be smaller than 4 MB.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setImageDataUrl(String(reader.result))
      setImageRemoved(false)
      if (!values.coverImageAlt) update('coverImageAlt', values.title || 'Journal cover image')
    }
    reader.readAsDataURL(file)
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
        ...(imageDataUrl
          ? { coverImage: { dataUrl: imageDataUrl, alt: values.coverImageAlt, caption: values.coverImageCaption || undefined } }
          : imageRemoved
            ? { coverImage: null }
            : {}),
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
    <form className="space-y-8" data-testid="journal-entry-form" onSubmit={(event) => event.preventDefault()}>
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-navy-100 bg-white p-4 shadow-sm">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-500">Editorial workspace</p>
          <p className="mt-1 text-sm text-navy-500">{wordCount.toLocaleString()} words · {values.readingTime || estimatedReadingTime}</p>
        </div>
        <button type="button" onClick={() => setPreviewMode((value) => !value)} className="min-h-10 rounded-full border border-navy-200 px-5 text-sm font-semibold text-navy transition hover:border-gold-500 hover:text-gold-500">
          {previewMode ? 'Return to editor' : 'Preview article'}
        </button>
      </div>

      {previewMode ? (
        <article className="overflow-hidden rounded-2xl border border-navy-100 bg-white shadow-sm">
          {imagePreview && <div className="relative aspect-[16/9] w-full"><Image src={imagePreview} alt={values.coverImageAlt || ''} fill unoptimized className="object-cover" /></div>}
          <div className="px-6 py-10 sm:px-12">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold-500">{values.category}</p>
            <h2 className="mt-4 font-heading text-4xl font-bold leading-tight text-navy">{values.title || 'Untitled journal entry'}</h2>
            {values.subtitle && <p className="mt-4 text-xl leading-8 text-navy-500">{values.subtitle}</p>}
            <p className="mt-8 border-y border-navy-100 py-5 text-lg leading-8 text-navy-600">{values.summary || 'Your summary will appear here.'}</p>
            <div className="mt-8 space-y-6 text-lg leading-9 text-navy-700">
              {values.body.split(/\n\s*\n/).filter(Boolean).map((paragraph, index) => <p key={index}>{paragraph}</p>)}
            </div>
          </div>
        </article>
      ) : <>
      <section className="rounded-2xl border border-navy-100 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-500">Cover image</p>
        <h2 className="mt-2 font-heading text-xl font-bold text-navy">Give the essay a visual identity</h2>
        <div className="mt-5 grid gap-6 md:grid-cols-[240px_1fr]">
          <button type="button" onClick={() => fileInputRef.current?.click()} className="group relative aspect-[16/10] overflow-hidden rounded-xl border-2 border-dashed border-navy-200 bg-cream text-center transition hover:border-gold-500">
            {imagePreview ? <Image src={imagePreview} alt="Cover preview" fill unoptimized className="object-cover" /> : <span className="flex h-full items-center justify-center px-5 text-sm font-semibold text-navy-500">Choose a cover image</span>}
            {imagePreview && <span className="absolute inset-x-3 bottom-3 rounded-full bg-navy/85 px-3 py-2 text-xs font-bold text-white opacity-0 transition group-hover:opacity-100">Replace image</span>}
          </button>
          <div className="space-y-4">
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImage} className="sr-only" />
            <p className="text-sm leading-6 text-navy-500">JPG, PNG, or WebP. Maximum 4 MB. A landscape image works best across the Journal.</p>
            <label className="block text-sm font-semibold text-navy">Image description
              <input value={values.coverImageAlt} onChange={(e) => update('coverImageAlt', e.target.value)} required={Boolean(imagePreview)} placeholder="Describe the image for readers using assistive technology" className={fieldClass} />
            </label>
            <label className="block text-sm font-semibold text-navy">Caption <span className="font-normal text-navy-400">(optional)</span>
              <input value={values.coverImageCaption} onChange={(e) => update('coverImageCaption', e.target.value)} className={fieldClass} />
            </label>
            {imagePreview && <button type="button" onClick={() => { setImageDataUrl(null); setImageRemoved(true); if (fileInputRef.current) fileInputRef.current.value = '' }} className="text-sm font-semibold text-red-700 underline underline-offset-4">Remove cover image</button>}
            {imageError && <p role="alert" className="text-sm font-semibold text-red-700">{imageError}</p>}
          </div>
        </div>
      </section>

      <section className="space-y-7 rounded-2xl border border-navy-100 bg-white p-6 shadow-sm sm:p-8">
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

      </section>
      </>}

      <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-navy-100 bg-white/95 p-4 shadow-xl backdrop-blur">
        <p className="text-sm text-navy-500">{values.status === 'published' ? 'Currently published' : 'Currently a draft'}</p>
        <div className="flex flex-wrap gap-3">
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
      </div>
    </form>
  )
}
