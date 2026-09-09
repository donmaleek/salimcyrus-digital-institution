'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'

const fieldClass =
  'mt-3 w-full rounded-none border border-navy-200 bg-white px-4 py-3 text-base text-navy focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold/30'

export function TeachingAssetsForm({
  teachingId,
  title,
  currentThumbnail,
  hasPreview,
}: {
  teachingId: string
  title: string
  currentThumbnail: string | null
  hasPreview: boolean
}) {
  const [thumbnail, setThumbnail] = useState<File | null>(null)
  const [preview, setPreview] = useState<File | null>(null)
  const [progress, setProgress] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const { showToast } = useToast()
  const router = useRouter()

  function upload(): Promise<{ ok: boolean; error?: string }> {
    return new Promise((resolve) => {
      const form = new FormData()
      if (thumbnail) form.set('thumbnail', thumbnail)
      if (preview) form.set('preview', preview)

      const xhr = new XMLHttpRequest()
      xhr.open('POST', `/api/admin/teachings/${teachingId}/assets`)
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

  async function handleSubmit() {
    if (!thumbnail && !preview) {
      showToast('Choose a thumbnail and/or a preview clip first.', 'error')
      return
    }
    setSubmitting(true)
    setProgress(0)

    const result = await upload()

    setSubmitting(false)
    setProgress(null)

    if (!result.ok) {
      showToast(result.error ?? 'Upload failed.', 'error')
      return
    }

    showToast('Updated.')
    router.push('/dashboard/admin/teachings')
    router.refresh()
  }

  return (
    <form
      className="space-y-7 rounded-2xl border border-navy-100 bg-white p-6 shadow-sm sm:p-8"
      data-testid="teaching-assets-form"
      onSubmit={(event) => event.preventDefault()}
    >
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-navy-400">Editing</p>
        <p className="mt-1 font-semibold text-navy">{title}</p>
      </div>

      <div>
        <label htmlFor="assets-thumbnail" className="block font-semibold text-navy">
          Thumbnail {currentThumbnail && <span className="font-normal text-navy-400">(replaces the current one)</span>}
        </label>
        {currentThumbnail && (
          <div className="relative mt-3 aspect-video w-full max-w-xs overflow-hidden rounded-xl bg-navy-50">
            <Image src={currentThumbnail} alt="" fill unoptimized className="object-cover" />
          </div>
        )}
        <p className="mt-2 text-sm text-navy-500">WebP, JPEG, or PNG.</p>
        <input
          id="assets-thumbnail"
          type="file"
          accept="image/webp,image/jpeg,image/png"
          onChange={(e) => setThumbnail(e.target.files?.[0] ?? null)}
          className={fieldClass}
        />
      </div>

      <div>
        <label htmlFor="assets-preview" className="block font-semibold text-navy">
          Preview clip {hasPreview && <span className="font-normal text-navy-400">(replaces the current one)</span>}
        </label>
        <p className="mt-2 text-sm text-navy-500">
          A short teaser (10-30 seconds), MP4, WebM, or MOV. Plays muted on hover in the catalog, like a YouTube
          preview. Never the full teaching. Up to 100MB.
        </p>
        <input
          id="assets-preview"
          type="file"
          accept="video/mp4,video/webm,video/quicktime"
          onChange={(e) => setPreview(e.target.files?.[0] ?? null)}
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

      <div className="flex justify-end">
        <Button type="button" disabled={submitting} onClick={handleSubmit}>
          {submitting ? 'Saving…' : 'Save Changes'}
        </Button>
      </div>
    </form>
  )
}
