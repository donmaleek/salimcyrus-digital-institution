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

  const isAdmin = (session?.user as { isAdmin?: boolean } | undefined)?.isAdmin === true
  const accessExpiresAt = course.accessWindowDays
    ? new Date(enrollment.enrolledAt.getTime() + course.accessWindowDays * 24 * 60 * 60 * 1000)
    : null
  const accessExpired = Boolean(accessExpiresAt && accessExpiresAt.getTime() < Date.now() && !isAdmin)

  if (accessExpired) {
    return (
      <div className="mx-auto max-w-xl py-20 text-center">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-700">Replay access ended</p>
        <h1 className="mt-3 font-heading text-3xl font-bold text-navy">{course.title}</h1>
        <p className="mt-4 text-base leading-7 text-navy-600">
          Your {course.accessWindowDays}-day replay access to this masterclass ended on{' '}
          {accessExpiresAt?.toISOString().slice(0, 10)}. Contact support if you believe this is a mistake.
        </p>
      </div>
    )
  }

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
      viewerLabel={session?.user?.name || session?.user?.email || ''}
      accessExpiresAt={accessExpiresAt?.toISOString() ?? null}
    />
  )
}
