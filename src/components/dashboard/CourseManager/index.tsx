'use client'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { formatCurrency } from '@/lib/utils/currency'

type Row = { id: string; slug: string; title: string; kind: string; status: string; priceKes: number; lessons: number; enrollments: number; updatedAt: string }
export function CourseManager({ courses }: { courses: Row[] }) {
  const [busyId, setBusyId] = useState<string | null>(null); const router = useRouter()
  async function changeStatus(course: Row, status: 'published' | 'archived') { setBusyId(course.id); const response = await fetch(`/api/admin/courses/${course.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) }); setBusyId(null); if (response.ok) router.refresh() }
  return <div className="space-y-6"><div className="flex justify-end"><Button href="/dashboard/admin/courses/new">Create a Course</Button></div>
    {courses.length === 0 ? <div className="border border-dashed border-navy-200 bg-white p-10 text-center"><h2 className="font-heading text-xl font-bold text-navy">No courses yet</h2><p className="mt-2 text-navy-500">Create the first curriculum, preview it, then publish when it is ready.</p></div> : <div className="space-y-3">{courses.map((course) => <article key={course.id} className="grid gap-4 rounded-2xl border border-navy-100 bg-white p-5 sm:grid-cols-[1fr_auto] sm:items-center"><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-heading text-lg font-bold text-navy">{course.title}</h2><span className="rounded-full bg-navy-50 px-2.5 py-1 text-xs font-bold uppercase text-navy-500">{course.kind}</span><span className={course.status === 'published' ? 'text-xs font-bold uppercase text-green-700' : 'text-xs font-bold uppercase text-navy-400'}>{course.status}</span></div><p className="mt-2 text-sm text-navy-500">{course.lessons} lessons · {course.enrollments} members · {formatCurrency(course.priceKes)}</p></div><div className="flex flex-wrap gap-2"><Link href={`/academy/${course.kind === 'masterclass' ? 'masterclasses' : 'courses'}/${course.slug}`} target="_blank" className="inline-flex min-h-10 items-center px-3 text-sm font-semibold text-navy underline">Preview</Link><Button href={`/dashboard/admin/courses/${course.id}/edit`} variant="outline" size="sm">Edit</Button>{course.status === 'published' ? <Button type="button" variant="ghost" size="sm" disabled={busyId === course.id} onClick={() => changeStatus(course, 'archived')}>Archive</Button> : <Button type="button" variant="ghost" size="sm" disabled={busyId === course.id} onClick={() => changeStatus(course, 'published')}>Publish</Button>}</div></article>)}</div>}
  </div>
}
