'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'

const fieldClass =
  'mt-3 w-full rounded-none border border-navy-200 bg-white px-4 py-3 text-base text-navy focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold/30'

// Matches the fixed rate already used for the existing 14 books and for
// programs, not a live FX lookup. Only pre-fills a starting suggestion;
// Salim can overwrite it with any price he wants.
const KES_PER_USD = 129.4

export function BookUploadForm() {
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [description, setDescription] = useState('')
  const [priceKes, setPriceKes] = useState('')
  const [priceUsd, setPriceUsd] = useState('')
  const [priceUsdTouched, setPriceUsdTouched] = useState(false)
  const [pageCount, setPageCount] = useState('')
  const [pdf, setPdf] = useState<File | null>(null)
  const [cover, setCover] = useState<File | null>(null)
  const [progress, setProgress] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState<'draft' | 'available' | null>(null)
  const { showToast } = useToast()
  const router = useRouter()

  function handlePriceKesChange(value: string) {
    setPriceKes(value)
    if (!priceUsdTouched) {
      const kes = Number(value)
      setPriceUsd(kes > 0 ? String(Math.max(1, Math.round(kes / KES_PER_USD))) : '')
    }
  }

  function upload(publish: boolean): Promise<{ ok: boolean; error?: string }> {
    return new Promise((resolve) => {
      const form = new FormData()
      form.set('title', title)
      if (subtitle) form.set('subtitle', subtitle)
      form.set('description', description)
      form.set('priceKes', priceKes)
      form.set('priceUsd', priceUsd)
      if (pageCount) form.set('pageCount', pageCount)
      form.set('publish', String(publish))
      if (pdf) form.set('pdf', pdf)
      if (cover) form.set('cover', cover)

      const xhr = new XMLHttpRequest()
      xhr.open('POST', '/api/admin/books')
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) setProgress(Math.round((event.loaded / event.total) * 100))
      }
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve({ ok: true })
          return
        }
        const body = (() => {
          try {
            return JSON.parse(xhr.responseText)
          } catch {
            return {}
          }
        })()
        resolve({ ok: false, error: typeof body.error === 'string' ? body.error : 'Upload failed.' })
      }
      xhr.onerror = () => resolve({ ok: false, error: 'Upload failed. Check your connection and try again.' })
      xhr.send(form)
    })
  }

  async function handleSubmit(publish: boolean) {
    if (!pdf) {
      showToast('Attach the book PDF first.', 'error')
      return
    }
    if (!cover) {
      showToast('Attach a cover image first.', 'error')
      return
    }
    setSubmitting(publish ? 'available' : 'draft')
    setProgress(0)

    const result = await upload(publish)

    setSubmitting(null)
    setProgress(null)

    if (!result.ok) {
      showToast(result.error ?? 'Upload failed.', 'error')
      return
    }

    showToast(publish ? 'Published.' : 'Draft saved.')
    router.push('/dashboard/admin/books')
    router.refresh()
  }

  return (
    <form
      className="space-y-7 rounded-2xl border border-navy-100 bg-white p-6 shadow-sm sm:p-8"
      data-testid="book-upload-form"
      onSubmit={(event) => event.preventDefault()}
    >
      <div>
        <label htmlFor="book-title" className="block font-semibold text-navy">
          Title
        </label>
        <input
          id="book-title"
          required
          minLength={3}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor="book-subtitle" className="block font-semibold text-navy">
          Subtitle <span className="font-normal text-navy-400">(optional)</span>
        </label>
        <input
          id="book-subtitle"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor="book-description" className="block font-semibold text-navy">
          Description
        </label>
        <p className="mt-2 text-sm text-navy-500">Shown on the book&apos;s page before purchase.</p>
        <textarea
          id="book-description"
          required
          minLength={10}
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className={`${fieldClass} resize-y leading-7`}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <div>
          <label htmlFor="book-price-kes" className="block font-semibold text-navy">
            Price (KES)
          </label>
          <input
            id="book-price-kes"
            type="number"
            required
            min={1}
            value={priceKes}
            onChange={(e) => handlePriceKesChange(e.target.value)}
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="book-price-usd" className="block font-semibold text-navy">
            Price (USD)
          </label>
          <p className="mt-2 text-xs text-navy-400">Suggested from KES; change it if you want a different amount.</p>
          <input
            id="book-price-usd"
            type="number"
            required
            min={1}
            value={priceUsd}
            onChange={(e) => {
              setPriceUsdTouched(true)
              setPriceUsd(e.target.value)
            }}
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="book-page-count" className="block font-semibold text-navy">
            Pages <span className="font-normal text-navy-400">(optional)</span>
          </label>
          <input
            id="book-page-count"
            type="number"
            min={1}
            value={pageCount}
            onChange={(e) => setPageCount(e.target.value)}
            className={fieldClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="book-pdf" className="block font-semibold text-navy">
          Book PDF
        </label>
        <p className="mt-2 text-sm text-navy-500">The exact file buyers will download. Up to 200MB.</p>
        <input
          id="book-pdf"
          type="file"
          required
          accept="application/pdf"
          onChange={(e) => setPdf(e.target.files?.[0] ?? null)}
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor="book-cover" className="block font-semibold text-navy">
          Cover image
        </label>
        <p className="mt-2 text-sm text-navy-500">WebP, JPEG, or PNG. Shown on the catalog and the book&apos;s page.</p>
        <input
          id="book-cover"
          type="file"
          required
          accept="image/webp,image/jpeg,image/png"
          onChange={(e) => setCover(e.target.files?.[0] ?? null)}
          className={fieldClass}
        />
      </div>

      {progress !== null && (
        <div className="rounded-xl bg-navy-50 p-4">
          <div className="h-2 w-full overflow-hidden rounded-full bg-navy-100">
            <div className="h-full rounded-full bg-gold transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-2 text-sm text-navy-500">Uploading… {progress}%</p>
        </div>
      )}

      <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-end gap-3 rounded-2xl border border-navy-100 bg-white/95 p-4 shadow-xl backdrop-blur">
        <Button type="button" variant="outline" disabled={submitting !== null} onClick={() => handleSubmit(false)}>
          {submitting === 'draft' ? 'Saving…' : 'Save Draft'}
        </Button>
        <Button type="button" disabled={submitting !== null} onClick={() => handleSubmit(true)}>
          {submitting === 'available' ? 'Publishing…' : 'Publish'}
        </Button>
      </div>
    </form>
  )
}
