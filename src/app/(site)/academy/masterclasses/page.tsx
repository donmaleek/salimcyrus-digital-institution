import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { PageHero } from '@/components/layout/PageHero'
import { CourseCatalog } from '@/components/courses/CourseCatalog'
import { FormatComparisonStrip } from '@/components/courses/FormatComparisonStrip'
export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Masterclasses', description: 'Single-session Salim Cyrus masterclass recordings: one concentrated breakthrough on one topic, not an ongoing course.' }
export default async function MasterclassesPage() {
  const courses = await db.course.findMany({ where: { status: 'published', kind: 'masterclass' }, include: { sections: { include: { lessons: { where: { status: 'published' } } } } }, orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }] })
  return (
    <>
      <PageHero eyebrow="Masterclasses" title="One Session. One Breakthrough." description="A masterclass is a single, concentrated recording on one topic, the kind of focused teaching you'd attend live in one sitting, not a multi-week curriculum. Each one lists its exact replay access window before you buy." />
      <section className="bg-navy-50">
        <div className="mx-auto max-w-content px-6 py-16">
          <CourseCatalog kind="masterclass" courses={courses.map((c) => ({ ...c, lessonCount: c.sections.reduce((n, s) => n + s.lessons.length, 0), durationMinutes: Math.round(c.sections.flatMap((s) => s.lessons).reduce((n, l) => n + (l.durationSeconds ?? 0), 0) / 60) }))} />
          <FormatComparisonStrip current="masterclass" />
        </div>
      </section>
    </>
  )
}
