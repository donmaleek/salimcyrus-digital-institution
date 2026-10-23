'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'

const fieldClass =
  'mt-3 w-full rounded-none border border-navy-200 bg-white px-4 py-3 text-base text-navy focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold/30'

export interface BookEditFormProps {
  id: string
  title: string
  subtitle: string | null
  description: string
  priceKes: number
  priceUsd: number
  pageCount: number | null
  coverPath: string
  maxPriceKes: number
}

export function BookEditForm({ id, title: initialTitle, subtitle: initialSubtitle, description: initialDescription, priceKes: initialPriceKes, priceUsd: initialPriceUsd, pageCount: initialPageCount, coverPath, maxPriceKes }: BookEditFormProps) {
  const [title, setTitle] = useState(initialTitle)
  const [subtitle, setSubtitle] = useState(initialSubtitle ?? '')
  const [description, setDescription] = useState(initialDescription)
  const [priceKes, setPriceKes] = useState(String(initialPriceKes))
  const [priceUsd, setPriceUsd] = useState(String(initialPriceUsd))
  const [pageCount, setPageCount] = useState(initialPageCount ? String(initialPageCount) : '')
  const [pdf, setPdf] = useState<File | null>(null)
  const [cover, setCover] = useState<File | null>(null)
  const [progress, setProgress] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const { showToast } = useToast()
  const router = useRouter()

  function save(): Promise<{ ok: boolean; error?: string }> {
    return new Promise((resolve) => {
      const form = new FormData()
      form.set('title', title)
      if (subtitle) form.set('subtitle', subtitle)
      form.set('description', description)
      form.set('priceKes', priceKes)
      form.set('priceUsd', priceUsd)
      if (pageCount) form.set('pageCount', pageCount)
      if (pdf) form.set('pdf', pdf)
      if (cover) form.set('cover', cover)

      const xhr = new XMLHttpRequest()
      xhr.open('PUT', `/api/admin/books/${id}`)
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
        resolve({ ok: false, error: typeof body.error === 'string' ? body.error : 'Save failed.' })
      }
      xhr.onerror = () => resolve({ ok: false, error: 'Save failed. Check your connection and try again.' })
      xhr.send(form)
    })
  }

  async function handleSubmit() {
    setSubmitting(true)
    setProgress(0)

    const result = await save()

    setSubmitting(false)
    setProgress(null)

    if (!result.ok) {
      showToast(result.error ?? 'Save failed.', 'error')
      return
    }

    showToast('Book updated.')
    router.push('/dashboard/admin/books')
    router.refresh()
  }

  return (
    <form
      className="space-y-7 rounded-2xl border border-navy-100 bg-white p-6 shadow-sm sm:p-8"
      data-testid="book-edit-form"
      onSubmit={(event) => event.preventDefault()}
    >
      <div>
        <label htmlFor="book-edit-title" className="block font-semibold text-navy">
          Title
        </label>
        <input
          id="book-edit-title"
          required
          minLength={3}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor="book-edit-subtitle" className="block font-semibold text-navy">
          Subtitle <span className="font-normal text-navy-400">(optional)</span>
        </label>
        <input
          id="book-edit-subtitle"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor="book-edit-description" className="block font-semibold text-navy">
          Description
        </label>
        <textarea
          id="book-edit-description"
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
          <label htmlFor="book-edit-price-kes" className="block font-semibold text-navy">
            Price (KES)
          </label>
          <p className="mt-2 text-xs text-navy-400">Capped at KES {maxPriceKes.toLocaleString()}.</p>
          <input
            id="book-edit-price-kes"
            type="number"
            required
            min={1}
            max={maxPriceKes}
            value={priceKes}
            onChange={(e) => setPriceKes(e.target.value)}
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="book-edit-price-usd" className="block font-semibold text-navy">
            Price (USD)
          </label>
          <input
            id="book-edit-price-usd"
            type="number"
            required
            min={1}
            value={priceUsd}
            onChange={(e) => setPriceUsd(e.target.value)}
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="book-edit-page-count" className="block font-semibold text-navy">
            Pages <span className="font-normal text-navy-400">(optional)</span>
          </label>
          <input
            id="book-edit-page-count"
            type="number"
            min={1}
            value={pageCount}
            onChange={(e) => setPageCount(e.target.value)}
            className={fieldClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="book-edit-pdf" className="block font-semibold text-navy">
          Replace book PDF <span className="font-normal text-navy-400">(optional)</span>
        </label>
        <p className="mt-2 text-sm text-navy-500">Leave empty to keep the current file. Up to 200MB.</p>
        <input
          id="book-edit-pdf"
          type="file"
          accept="application/pdf"
          onChange={(e) => setPdf(e.target.files?.[0] ?? null)}
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor="book-edit-cover" className="block font-semibold text-navy">
          Replace cover image <span className="font-normal text-navy-400">(optional)</span>
        </label>
        <div className="mt-3 flex items-center gap-4">
          <div className="relative h-24 w-16 shrink-0 overflow-hidden rounded-md bg-navy-50">
            <Image src={coverPath} alt="" fill unoptimized className="object-contain" />
          </div>
          <input
            id="book-edit-cover"
            type="file"
            accept="image/webp,image/jpeg,image/png"
            onChange={(e) => setCover(e.target.files?.[0] ?? null)}
            className={fieldClass}
          />
        </div>
      </div>

      {progress !== null && (
        <div className="rounded-xl bg-navy-50 p-4">
          <div className="h-2 w-full overflow-hidden rounded-full bg-navy-100">
            <div className="h-full rounded-full bg-gold transition-all" style={{ width: `${progress}%` }} />
          </div>
          <p className="mt-2 text-sm text-navy-500">Saving… {progress}%</p>
        </div>
      )}

      <div className="sticky bottom-4 z-10 flex flex-wrap items-center justify-end gap-3 rounded-2xl border border-navy-100 bg-white/95 p-4 shadow-xl backdrop-blur">
        <Button type="button" disabled={submitting} onClick={handleSubmit}>
          {submitting ? 'Saving…' : 'Save Changes'}
        </Button>
      </div>
    </form>
  )
}
