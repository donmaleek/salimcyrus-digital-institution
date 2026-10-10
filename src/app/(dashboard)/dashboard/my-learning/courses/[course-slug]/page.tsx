import { notFound, redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { CoursePlayer } from '@/components/courses/CoursePlayer'
import { enrollUser } from '@/services/courses/course-service'
import { hasActiveParentMembership, PARENT_MEMBERSHIP_COURSE_CATEGORY } from '@/services/payments/parent-membership'

export const dynamic = 'force-dynamic'

export default async function CourseLearningPage(props: { params: Promise<{ 'course-slug': string }> }) {
  const params = await props.params
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) redirect('/login')

  const course = await db.course.findUnique({
    where: { slug: params['course-slug'] },
    include: {
      sections: {
        include: { lessons: { where: { status: 'published' }, orderBy: { position: 'asc' } } },
        orderBy: { position: 'asc' },
      },
    },
  })
  if (!course) notFound()

  let enrollment = await db.courseEnrollment.findUnique({
    where: { courseId_userId: { courseId: course.id, userId } },
    include: { progress: true },
  })

  // A Parent Membership covers every Parental Guidance course without a
  // separate purchase. Rather than teach the progress-tracking machinery a
  // second "has access" check, grant a zero-amount enrollment the first
  // time a member opens a course, same synthetic-reference pattern as a
  // free course's auto-enroll (see /api/courses/[courseId]/enroll) so
  // CoursePlayer and lesson-progress saves work identically either way.
  if (!enrollment && course.category === PARENT_MEMBERSHIP_COURSE_CATEGORY && (await hasActiveParentMembership(userId))) {
    await enrollUser(course.id, userId, `parent-membership:${course.id}:${userId}`, 'parent-membership')
    enrollment = await db.courseEnrollment.findUnique({
      where: { courseId_userId: { courseId: course.id, userId } },
      include: { progress: true },
    })
  }

  if (!enrollment) redirect(`/${course.kind === 'masterclass' ? 'academy/masterclasses' : 'academy/courses'}/${course.slug}`)

  const lessons = course.sections.flatMap((section) =>
    section.lessons.map((lesson) => ({ ...lesson, sectionTitle: section.title }))
  )
  return (
    <CoursePlayer
      courseId={course.id}
      courseTitle={course.title}
      lessons={lessons}
      initiallyCompleted={enrollment.progress.filter((p) => p.completedAt).map((p) => p.lessonId)}
      initialLessonId={enrollment.lastLessonId}
    />
  )
}
