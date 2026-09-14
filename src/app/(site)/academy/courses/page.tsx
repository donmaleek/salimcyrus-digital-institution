import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { PageHero } from '@/components/layout/PageHero'
import { CourseCatalog } from '@/components/courses/CourseCatalog'
export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Online Courses', description: 'Self-paced courses with structured lessons, saved progress, and lifetime access.' }
export default async function CoursesPage() { const courses = await db.course.findMany({ where: { status: 'published', kind: 'course' }, include: { sections: { include: { lessons: { where: { status: 'published' } } } } }, orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }] }); return <><PageHero eyebrow="Courses" title="Learn at Your Pace. Finish with Clarity." description="Choose a structured course, follow every lesson in order, and pick up exactly where you left off." /><section className="bg-cream"><div className="mx-auto max-w-content px-6 py-16"><CourseCatalog kind="course" courses={courses.map((c) => ({ ...c, lessonCount: c.sections.reduce((n, s) => n + s.lessons.length, 0), durationMinutes: Math.round(c.sections.flatMap((s) => s.lessons).reduce((n, l) => n + (l.durationSeconds ?? 0), 0) / 60) }))} /></div></section></> }
