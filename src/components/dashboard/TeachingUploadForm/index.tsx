'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { TEACHING_CATEGORIES } from '@/lib/data/teaching-categories'

const fieldClass =
  'mt-3 w-full rounded-none border border-navy-200 bg-white px-4 py-3 text-base text-navy focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold/30'

export function TeachingUploadForm() {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState<string>(TEACHING_CATEGORIES[0])
  const [priceKes, setPriceKes] = useState('')
  const [priceUsd, setPriceUsd] = useState('')
  const [video, setVideo] = useState<File | null>(null)
  const [thumbnail, setThumbnail] = useState<File | null>(null)
  const [progress, setProgress] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState<'draft' | 'published' | null>(null)
  const { showToast } = useToast()
  const router = useRouter()

  function upload(publish: boolean): Promise<{ ok: boolean; error?: string }> {
    return new Promise((resolve) => {
      const form = new FormData()
      form.set('title', title)
      form.set('description', description)
      form.set('category', category)
      form.set('priceKes', priceKes)
      form.set('priceUsd', priceUsd)
      form.set('publish', String(publish))
      if (video) form.set('video', video)
      if (thumbnail) form.set('thumbnail', thumbnail)

      const xhr = new XMLHttpRequest()
      xhr.open('POST', '/api/admin/teachings')
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
    if (!video) {
      showToast('Attach a video file first.', 'error')
      return
    }
    setSubmitting(publish ? 'published' : 'draft')
    setProgress(0)

    const result = await upload(publish)

    setSubmitting(null)
    setProgress(null)

    if (!result.ok) {
      showToast(result.error ?? 'Upload failed.', 'error')
      return
    }

    showToast(publish ? 'Published.' : 'Draft saved.')
    router.push('/dashboard/admin/teachings')
    router.refresh()
  }

  return (
    <form
      className="space-y-7 rounded-2xl border border-navy-100 bg-white p-6 shadow-sm sm:p-8"
      data-testid="teaching-upload-form"
      onSubmit={(event) => event.preventDefault()}
    >
      <div>
        <label htmlFor="teaching-title" className="block font-semibold text-navy">
          Title
        </label>
        <input
          id="teaching-title"
          required
          minLength={3}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor="teaching-description" className="block font-semibold text-navy">
          Description
        </label>
        <p className="mt-2 text-sm text-navy-500">Shown on the teaching&apos;s page before purchase.</p>
        <textarea
          id="teaching-description"
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
          <label htmlFor="teaching-category" className="block font-semibold text-navy">
            Category
          </label>
          <select
            id="teaching-category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className={fieldClass}
          >
            {TEACHING_CATEGORIES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="teaching-price-kes" className="block font-semibold text-navy">
            Price (KES)
          </label>
          <input
            id="teaching-price-kes"
            type="number"
            required
            min={0}
            value={priceKes}
            onChange={(e) => setPriceKes(e.target.value)}
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="teaching-price-usd" className="block font-semibold text-navy">
            Price (USD)
          </label>
          <input
            id="teaching-price-usd"
            type="number"
            required
            min={0}
            value={priceUsd}
            onChange={(e) => setPriceUsd(e.target.value)}
            className={fieldClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="teaching-video" className="block font-semibold text-navy">
          Video file
        </label>
        <p className="mt-2 text-sm text-navy-500">MP4, WebM, or MOV. Up to 2GB.</p>
        <input
          id="teaching-video"
          type="file"
          required
          accept="video/mp4,video/webm,video/quicktime"
          onChange={(e) => setVideo(e.target.files?.[0] ?? null)}
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor="teaching-thumbnail" className="block font-semibold text-navy">
          Thumbnail <span className="font-normal text-navy-400">(optional)</span>
        </label>
        <p className="mt-2 text-sm text-navy-500">WebP, JPEG, or PNG.</p>
        <input
          id="teaching-thumbnail"
          type="file"
          accept="image/webp,image/jpeg,image/png"
          onChange={(e) => setThumbnail(e.target.files?.[0] ?? null)}
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
          {submitting === 'published' ? 'Publishing…' : 'Publish'}
        </Button>
      </div>
    </form>
  )
}
