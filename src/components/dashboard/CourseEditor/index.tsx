'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'

type LessonDraft = {
  id?: string
  title: string
  description: string
  content: string
  videoUrl: string
  durationMinutes: number
  isPreview: boolean
  resourceLabel?: string | null
  videoFileName?: string | null
  videoProcessingStatus?: string
}
type SectionDraft = { title: string; description: string; lessons: LessonDraft[] }
type InitialCourse = {
  id: string
  title: string
  subtitle: string | null
  description: string
  kind: string
  category: string
  level: string
  priceKes: number
  priceUsd: number
  thumbnailUrl: string | null
  trailerUrl: string | null
  outcomes: string[]
  status: string
  featured: boolean
  accessWindowDays: number | null
  sections: Array<{
    title: string
    description: string | null
    lessons: Array<{
      id: string
      title: string
      description: string | null
      content: string | null
      videoUrl: string | null
      durationSeconds: number | null
      isPreview: boolean
      resourceLabel: string | null
      videoFileName: string | null
      videoProcessingStatus: string
    }>
  }>
}

/** A lesson's downloadable PDF is uploaded against its real database id, so
 * it only shows once this lesson has been saved at least once (a brand
 * new, unsaved lesson draft has no id yet). Resaving the curriculum now
 * carries the attached resource forward automatically (see nestedSections
 * in course-service.ts), so uploading here is safe at any time. */
function LessonResourceUpload({ courseId, lessonId, currentLabel, onSaved }: { courseId: string; lessonId: string; currentLabel: string | null | undefined; onSaved: (label: string) => void }) {
  const [label, setLabel] = useState(currentLabel ?? '')
  const [uploading, setUploading] = useState(false)
  const { showToast } = useToast()

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    if (!label.trim()) { showToast('Enter a label for this resource first.', 'error'); event.target.value = ''; return }
    setUploading(true)
    const form = new FormData()
    form.set('label', label.trim())
    form.set('resource', file)
    const response = await fetch(`/api/admin/courses/${courseId}/lessons/${lessonId}/resource`, { method: 'POST', body: form }).catch(() => null)
    setUploading(false)
    event.target.value = ''
    if (!response || !response.ok) { showToast('Could not upload that resource.', 'error'); return }
    onSaved(label.trim())
    showToast('Resource attached.')
  }

  return <div className="mt-3 flex flex-wrap items-end gap-3 border-t border-navy-100 pt-3">
    <label className="flex-1 font-semibold text-navy">Downloadable resource label<input className={field} placeholder="e.g. Family rules planner" value={label} onChange={(e) => setLabel(e.target.value)} /></label>
    <label className="inline-flex min-h-11 cursor-pointer items-center rounded-full border border-navy-200 px-4 text-sm font-semibold text-navy hover:bg-navy-50">{uploading ? 'Uploading…' : currentLabel ? 'Replace PDF' : 'Attach PDF'}<input type="file" accept="application/pdf" className="hidden" disabled={uploading} onChange={handleFile} /></label>
    {currentLabel && <span className="text-xs text-navy-400">Current: {currentLabel}</span>}
  </div>
}

const PROCESSING_LABEL: Record<string, { text: string; className: string }> = {
  processing: { text: 'Compressing…', className: 'bg-blue-50 text-blue-600' },
  failed: { text: 'Compression failed (original file still plays)', className: 'bg-red-50 text-red-600' },
}

/** Uploads the self-hosted, protected video for a lesson: streamed
 * through the enrollment-gated route, never a public embeddable URL. This
 * is the recommended path for any paid content, especially a masterclass,
 * since the legacy "External video URL" field below is a plain public
 * link once embedded. Only shows once the lesson has a real id (same
 * reasoning as the resource upload above); a reupload replaces the file
 * in place and re-queues background compression. */
function LessonVideoUpload({ courseId, lessonId, hasVideo, processingStatus, onUploaded }: { courseId: string; lessonId: string; hasVideo: boolean; processingStatus?: string; onUploaded: () => void }) {
  const [uploading, setUploading] = useState(false)
  const { showToast } = useToast()
  const status = processingStatus && PROCESSING_LABEL[processingStatus]

  async function handleFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    setUploading(true)
    const form = new FormData()
    form.set('video', file)
    const response = await fetch(`/api/admin/courses/${courseId}/lessons/${lessonId}/video`, { method: 'POST', body: form }).catch(() => null)
    setUploading(false)
    event.target.value = ''
    if (!response || !response.ok) { showToast('Could not upload that video.', 'error'); return }
    onUploaded()
    showToast('Video uploaded. Compressing in the background, usually ready within a few minutes.')
  }

  return <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-navy-100 pt-3">
    <label className="inline-flex min-h-11 cursor-pointer items-center rounded-full border border-gold-400 bg-gold-50 px-4 text-sm font-bold text-navy hover:bg-gold-100">{uploading ? 'Uploading…' : hasVideo ? 'Replace protected video' : 'Upload protected video'}<input type="file" accept="video/mp4,video/webm,video/quicktime" className="hidden" disabled={uploading} onChange={handleFile} /></label>
    {hasVideo && <span className="text-xs font-semibold text-navy-500">Self-hosted, streamed only to enrolled members</span>}
    {status && <span className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide ${status.className}`}>{status.text}</span>}
  </div>
}

const blankLesson = (): LessonDraft => ({ title: '', description: '', content: '', videoUrl: '', durationMinutes: 0, isPreview: false })
const field = 'mt-2 w-full border border-navy-200 bg-white px-4 py-3 text-navy focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20'

export function CourseEditor({ initial }: { initial?: InitialCourse }) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [subtitle, setSubtitle] = useState(initial?.subtitle ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [kind, setKind] = useState(initial?.kind ?? 'course')
  const [category, setCategory] = useState(initial?.category ?? 'Personal Growth')
  const [level, setLevel] = useState(initial?.level ?? 'all-levels')
  const [priceKes, setPriceKes] = useState(initial?.priceKes ?? 0)
  const [priceUsd, setPriceUsd] = useState(initial?.priceUsd ?? 0)
  const [thumbnailUrl, setThumbnailUrl] = useState(initial?.thumbnailUrl ?? '')
  const [trailerUrl, setTrailerUrl] = useState(initial?.trailerUrl ?? '')
  const [outcomes, setOutcomes] = useState(initial?.outcomes.join('\n') ?? '')
  const [featured, setFeatured] = useState(initial?.featured ?? false)
  const [accessWindowDays, setAccessWindowDays] = useState(initial?.accessWindowDays ? String(initial.accessWindowDays) : '')
  const [sections, setSections] = useState<SectionDraft[]>(initial?.sections.map((s) => ({ title: s.title, description: s.description ?? '', lessons: s.lessons.map((l) => ({ id: l.id, title: l.title, description: l.description ?? '', content: l.content ?? '', videoUrl: l.videoUrl ?? '', durationMinutes: Math.round((l.durationSeconds ?? 0) / 60), isPreview: l.isPreview, resourceLabel: l.resourceLabel, videoFileName: l.videoFileName, videoProcessingStatus: l.videoProcessingStatus })) })) ?? [{ title: 'Start Here', description: '', lessons: [blankLesson()] }])
  const [saving, setSaving] = useState(false)
  const { showToast } = useToast()
  const router = useRouter()

  function patchSection(index: number, patch: Partial<SectionDraft>) { setSections((all) => all.map((s, i) => i === index ? { ...s, ...patch } : s)) }
  function patchLesson(si: number, li: number, patch: Partial<LessonDraft>) { patchSection(si, { lessons: sections[si].lessons.map((l, i) => i === li ? { ...l, ...patch } : l) }) }

  async function save(status: 'draft' | 'published') {
    setSaving(true)
    const payload = { title, subtitle, description, kind, category, level, priceKes, priceUsd, thumbnailUrl, trailerUrl, outcomes: outcomes.split('\n').map((x) => x.trim()).filter(Boolean), sections, status, featured, accessWindowDays: accessWindowDays.trim() ? Math.round(Number(accessWindowDays)) : null }
    const response = await fetch(initial ? `/api/admin/courses/${initial.id}` : '/api/admin/courses', { method: initial ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    const body = await response.json().catch(() => ({})) as { error?: string }
    setSaving(false)
    if (!response.ok) return showToast(body.error ?? 'Could not save course.', 'error')
    showToast(status === 'published' ? 'Course published.' : 'Draft saved.')
    router.push('/dashboard/admin/courses'); router.refresh()
  }

  return <form className="space-y-8" onSubmit={(e) => e.preventDefault()} data-testid="course-editor">
    <section className="rounded-2xl border border-navy-100 bg-white p-6 shadow-sm"><h2 className="font-heading text-xl font-bold text-navy">Course details</h2>
      <div className="mt-5 grid gap-5 sm:grid-cols-2"><label className="font-semibold text-navy">Title<input className={field} required value={title} onChange={(e) => setTitle(e.target.value)} /></label><label className="font-semibold text-navy">Short promise<input className={field} value={subtitle} onChange={(e) => setSubtitle(e.target.value)} /></label></div>
      <label className="mt-5 block font-semibold text-navy">Sales description<textarea rows={5} className={field} value={description} onChange={(e) => setDescription(e.target.value)} /></label>
      <div className="mt-5 grid gap-5 sm:grid-cols-4"><label className="font-semibold text-navy">Format<select className={field} value={kind} onChange={(e) => setKind(e.target.value)}><option value="course">Course</option><option value="masterclass">Masterclass</option></select></label><label className="font-semibold text-navy">Category<input className={field} value={category} onChange={(e) => setCategory(e.target.value)} /></label><label className="font-semibold text-navy">Level<select className={field} value={level} onChange={(e) => setLevel(e.target.value)}><option value="all-levels">All levels</option><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select></label><label className="flex items-end gap-2 pb-3 font-semibold text-navy"><input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} /> Feature in catalog</label></div>
      <div className="mt-5 grid gap-5 sm:grid-cols-2"><label className="font-semibold text-navy">Price (KES)<input type="number" min="0" step="1" className={field} value={priceKes} onChange={(e) => setPriceKes(Math.round(Number(e.target.value)))} /></label><label className="font-semibold text-navy">Price (USD)<input type="number" min="0" step="1" className={field} value={priceUsd} onChange={(e) => setPriceUsd(Math.round(Number(e.target.value)))} /></label><label className="font-semibold text-navy">Thumbnail URL<input type="url" className={field} value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)} /></label><label className="font-semibold text-navy">Trailer URL<input type="url" className={field} value={trailerUrl} onChange={(e) => setTrailerUrl(e.target.value)} /></label></div>
      <label className="mt-5 block font-semibold text-navy">Learning outcomes <span className="font-normal text-navy-400">(one per line)</span><textarea rows={4} className={field} value={outcomes} onChange={(e) => setOutcomes(e.target.value)} /></label>
      <label className="mt-5 block max-w-sm font-semibold text-navy">Replay access window (days) <span className="font-normal text-navy-400">(blank = lifetime)</span>
        <input type="number" min="1" step="1" placeholder={kind === 'masterclass' ? 'e.g. 180' : 'Lifetime'} className={field} value={accessWindowDays} onChange={(e) => setAccessWindowDays(e.target.value)} />
      </label>
      <p className="mt-2 max-w-xl text-sm leading-6 text-navy-500">
        {kind === 'masterclass'
          ? 'Masterclasses are usually sold as time-limited replay access rather than a permanent library addition. Leave blank for lifetime access instead.'
          : 'Courses default to lifetime access. Only set a window if this course should expire too.'}
      </p>
    </section>
    <section><div className="flex items-end justify-between"><div><h2 className="font-heading text-2xl font-bold text-navy">Curriculum</h2><p className="mt-1 text-sm text-navy-500">Organize lessons in the order members should follow.</p></div><Button type="button" variant="outline" onClick={() => setSections([...sections, { title: '', description: '', lessons: [blankLesson()] }])}>Add section</Button></div>
      <div className="mt-5 space-y-5">{sections.map((section, si) => <div key={si} className="rounded-2xl border border-navy-100 bg-white p-5"><div className="flex gap-3"><input aria-label={`Section ${si + 1} title`} placeholder={`Section ${si + 1} title`} className={field} value={section.title} onChange={(e) => patchSection(si, { title: e.target.value })} />{sections.length > 1 && <Button type="button" variant="ghost" onClick={() => setSections(sections.filter((_, i) => i !== si))}>Remove</Button>}</div>
        <div className="mt-5 space-y-4">{section.lessons.map((lesson, li) => <div key={li} className="border-l-4 border-gold/50 bg-cream p-4"><div className="grid gap-4 sm:grid-cols-2"><label className="font-semibold text-navy">Lesson title<input className={field} value={lesson.title} onChange={(e) => patchLesson(si, li, { title: e.target.value })} /></label><label className="font-semibold text-navy">External video URL <span className="font-normal text-navy-400">(legacy, public once embedded; prefer the upload below)</span><input type="url" className={field} value={lesson.videoUrl} onChange={(e) => patchLesson(si, li, { videoUrl: e.target.value })} /></label><label className="font-semibold text-navy">Duration (minutes)<input type="number" min="0" step="1" className={field} value={lesson.durationMinutes} onChange={(e) => patchLesson(si, li, { durationMinutes: Math.round(Number(e.target.value)) })} /></label><label className="flex items-end gap-2 pb-3 font-semibold text-navy"><input type="checkbox" checked={lesson.isPreview} onChange={(e) => patchLesson(si, li, { isPreview: e.target.checked })} /> Free preview</label></div><label className="mt-3 block font-semibold text-navy">Lesson notes<textarea rows={4} className={field} value={lesson.content} onChange={(e) => patchLesson(si, li, { content: e.target.value })} /></label>{initial && lesson.id && <LessonVideoUpload courseId={initial.id} lessonId={lesson.id} hasVideo={Boolean(lesson.videoFileName)} processingStatus={lesson.videoProcessingStatus} onUploaded={() => patchLesson(si, li, { videoFileName: 'pending-refresh', videoProcessingStatus: 'processing' })} />}{initial && lesson.id && <LessonResourceUpload courseId={initial.id} lessonId={lesson.id} currentLabel={lesson.resourceLabel} onSaved={(label) => patchLesson(si, li, { resourceLabel: label })} />}{section.lessons.length > 1 && <button type="button" className="mt-3 text-sm font-semibold text-red-700" onClick={() => patchSection(si, { lessons: section.lessons.filter((_, i) => i !== li) })}>Remove lesson</button>}</div>)}</div>
        <Button type="button" variant="outline" size="sm" onClick={() => patchSection(si, { lessons: [...section.lessons, blankLesson()] })}>Add lesson</Button></div>)}</div>
    </section>
    <div className="sticky bottom-4 flex justify-end gap-3 rounded-2xl border border-navy-100 bg-white/95 p-4 shadow-xl"><Button type="button" variant="outline" disabled={saving} onClick={() => save('draft')}>Save draft</Button><Button type="button" disabled={saving} onClick={() => save('published')}>{saving ? 'Saving…' : 'Publish'}</Button></div>
  </form>
}
