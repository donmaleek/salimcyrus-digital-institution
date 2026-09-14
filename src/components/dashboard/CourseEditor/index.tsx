'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'

type LessonDraft = { title: string; description: string; content: string; videoUrl: string; durationMinutes: number; isPreview: boolean }
type SectionDraft = { title: string; description: string; lessons: LessonDraft[] }
type InitialCourse = { id: string; title: string; subtitle: string | null; description: string; kind: string; category: string; level: string; priceKes: number; priceUsd: number; thumbnailUrl: string | null; trailerUrl: string | null; outcomes: string[]; status: string; featured: boolean; sections: Array<{ title: string; description: string | null; lessons: Array<{ title: string; description: string | null; content: string | null; videoUrl: string | null; durationSeconds: number | null; isPreview: boolean }> }> }

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
  const [sections, setSections] = useState<SectionDraft[]>(initial?.sections.map((s) => ({ title: s.title, description: s.description ?? '', lessons: s.lessons.map((l) => ({ title: l.title, description: l.description ?? '', content: l.content ?? '', videoUrl: l.videoUrl ?? '', durationMinutes: Math.round((l.durationSeconds ?? 0) / 60), isPreview: l.isPreview })) })) ?? [{ title: 'Start Here', description: '', lessons: [blankLesson()] }])
  const [saving, setSaving] = useState(false)
  const { showToast } = useToast()
  const router = useRouter()

  function patchSection(index: number, patch: Partial<SectionDraft>) { setSections((all) => all.map((s, i) => i === index ? { ...s, ...patch } : s)) }
  function patchLesson(si: number, li: number, patch: Partial<LessonDraft>) { patchSection(si, { lessons: sections[si].lessons.map((l, i) => i === li ? { ...l, ...patch } : l) }) }

  async function save(status: 'draft' | 'published') {
    setSaving(true)
    const payload = { title, subtitle, description, kind, category, level, priceKes, priceUsd, thumbnailUrl, trailerUrl, outcomes: outcomes.split('\n').map((x) => x.trim()).filter(Boolean), sections, status, featured }
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
      <div className="mt-5 grid gap-5 sm:grid-cols-2"><label className="font-semibold text-navy">Price (KES)<input type="number" min="0" className={field} value={priceKes} onChange={(e) => setPriceKes(Number(e.target.value))} /></label><label className="font-semibold text-navy">Price (USD)<input type="number" min="0" className={field} value={priceUsd} onChange={(e) => setPriceUsd(Number(e.target.value))} /></label><label className="font-semibold text-navy">Thumbnail URL<input type="url" className={field} value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)} /></label><label className="font-semibold text-navy">Trailer URL<input type="url" className={field} value={trailerUrl} onChange={(e) => setTrailerUrl(e.target.value)} /></label></div>
      <label className="mt-5 block font-semibold text-navy">Learning outcomes <span className="font-normal text-navy-400">(one per line)</span><textarea rows={4} className={field} value={outcomes} onChange={(e) => setOutcomes(e.target.value)} /></label>
    </section>
    <section><div className="flex items-end justify-between"><div><h2 className="font-heading text-2xl font-bold text-navy">Curriculum</h2><p className="mt-1 text-sm text-navy-500">Organize lessons in the order members should follow.</p></div><Button type="button" variant="outline" onClick={() => setSections([...sections, { title: '', description: '', lessons: [blankLesson()] }])}>Add section</Button></div>
      <div className="mt-5 space-y-5">{sections.map((section, si) => <div key={si} className="rounded-2xl border border-navy-100 bg-white p-5"><div className="flex gap-3"><input aria-label={`Section ${si + 1} title`} placeholder={`Section ${si + 1} title`} className={field} value={section.title} onChange={(e) => patchSection(si, { title: e.target.value })} />{sections.length > 1 && <Button type="button" variant="ghost" onClick={() => setSections(sections.filter((_, i) => i !== si))}>Remove</Button>}</div>
        <div className="mt-5 space-y-4">{section.lessons.map((lesson, li) => <div key={li} className="border-l-4 border-gold/50 bg-cream p-4"><div className="grid gap-4 sm:grid-cols-2"><label className="font-semibold text-navy">Lesson title<input className={field} value={lesson.title} onChange={(e) => patchLesson(si, li, { title: e.target.value })} /></label><label className="font-semibold text-navy">Video URL<input type="url" className={field} value={lesson.videoUrl} onChange={(e) => patchLesson(si, li, { videoUrl: e.target.value })} /></label><label className="font-semibold text-navy">Duration (minutes)<input type="number" min="0" className={field} value={lesson.durationMinutes} onChange={(e) => patchLesson(si, li, { durationMinutes: Number(e.target.value) })} /></label><label className="flex items-end gap-2 pb-3 font-semibold text-navy"><input type="checkbox" checked={lesson.isPreview} onChange={(e) => patchLesson(si, li, { isPreview: e.target.checked })} /> Free preview</label></div><label className="mt-3 block font-semibold text-navy">Lesson notes<textarea rows={4} className={field} value={lesson.content} onChange={(e) => patchLesson(si, li, { content: e.target.value })} /></label>{section.lessons.length > 1 && <button type="button" className="mt-3 text-sm font-semibold text-red-700" onClick={() => patchSection(si, { lessons: section.lessons.filter((_, i) => i !== li) })}>Remove lesson</button>}</div>)}</div>
        <Button type="button" variant="outline" size="sm" onClick={() => patchSection(si, { lessons: [...section.lessons, blankLesson()] })}>Add lesson</Button></div>)}</div>
    </section>
    <div className="sticky bottom-4 flex justify-end gap-3 rounded-2xl border border-navy-100 bg-white/95 p-4 shadow-xl"><Button type="button" variant="outline" disabled={saving} onClick={() => save('draft')}>Save draft</Button><Button type="button" disabled={saving} onClick={() => save('published')}>{saving ? 'Saving…' : 'Publish'}</Button></div>
  </form>
}
