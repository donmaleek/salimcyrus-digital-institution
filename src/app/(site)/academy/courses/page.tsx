import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { PageHero } from '@/components/layout/PageHero'
import { CourseCatalog } from '@/components/courses/CourseCatalog'
import { FormatComparisonStrip } from '@/components/courses/FormatComparisonStrip'
export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Online Courses', description: 'Self-paced, multi-lesson courses with structured curriculum, saved progress, and lifetime access, not a single masterclass session.' }
export default async function CoursesPage() {
  const courses = await db.course.findMany({ where: { status: 'published', kind: 'course' }, include: { sections: { include: { lessons: { where: { status: 'published' } } } } }, orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }] })
  return (
    <>
      <PageHero eyebrow="Courses" title="A Full Curriculum, Yours for Life." description="Structured, multi-lesson courses you work through at your own pace. Every course is yours to keep and revisit, no access window, no single-sitting pressure." />
      <section className="bg-cream">
        <div className="mx-auto max-w-content px-6 py-16">
          <CourseCatalog kind="course" courses={courses.map((c) => ({ ...c, lessonCount: c.sections.reduce((n, s) => n + s.lessons.length, 0), durationMinutes: Math.round(c.sections.flatMap((s) => s.lessons).reduce((n, l) => n + (l.durationSeconds ?? 0), 0) / 60) }))} />
          <FormatComparisonStrip current="course" />
        </div>
      </section>
    </>
  )
}
