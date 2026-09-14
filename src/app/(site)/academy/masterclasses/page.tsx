import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { PageHero } from '@/components/layout/PageHero'
import { CourseCatalog } from '@/components/courses/CourseCatalog'
export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Masterclasses', description: 'Focused Salim Cyrus masterclasses with clear outcomes and saved progress.' }
export default async function MasterclassesPage() { const courses = await db.course.findMany({ where: { status: 'published', kind: 'masterclass' }, include: { sections: { include: { lessons: { where: { status: 'published' } } } } }, orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }] }); return <><PageHero eyebrow="Masterclasses" title="Focused Learning. Practical Change." description="Find the right masterclass by topic, see the complete curriculum before buying, and follow your progress to completion." /><section className="bg-navy-50"><div className="mx-auto max-w-content px-6 py-16"><CourseCatalog kind="masterclass" courses={courses.map((c) => ({ ...c, lessonCount: c.sections.reduce((n, s) => n + s.lessons.length, 0), durationMinutes: Math.round(c.sections.flatMap((s) => s.lessons).reduce((n, l) => n + (l.durationSeconds ?? 0), 0) / 60) }))} /></div></section></> }
