import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { PageHero } from '@/components/layout/PageHero'
import { CourseCatalog } from '@/components/courses/CourseCatalog'
import { PARENT_MEMBERSHIP_COURSE_CATEGORY } from '@/services/payments/parent-membership'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Parental Guidance Courses',
  description:
    'Twelve structured parenting modules, plus the flagship course, The Foundations of Intentional Parenting. Self-paced, with lifetime access, or included with Parent Membership.',
}

export default async function ParentalGuidanceCoursesPage() {
  const courses = await db.course.findMany({
    where: { status: 'published', kind: 'course', category: PARENT_MEMBERSHIP_COURSE_CATEGORY },
    include: { sections: { include: { lessons: { where: { status: 'published' } } } } },
    orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
  })

  return (
    <>
      <PageHero
        eyebrow="Parental Guidance"
        title="Twelve Modules. One Framework. Real Practice."
        description="Each course is built around one area of parenting: development, self-awareness, connection, emotional intelligence, discipline, communication, character, purpose, digital safety, adolescence, money, and co-parenting. Every course is also included with Parent Membership."
      />
      <section className="bg-cream">
        <div className="mx-auto max-w-content px-6 py-16">
          <CourseCatalog
            kind="course"
            courses={courses.map((c) => ({
              ...c,
              lessonCount: c.sections.reduce((n, s) => n + s.lessons.length, 0),
              durationMinutes: Math.round(
                c.sections.flatMap((s) => s.lessons).reduce((n, l) => n + (l.durationSeconds ?? 0), 0) / 60
              ),
            }))}
          />
        </div>
      </section>
    </>
  )
}
