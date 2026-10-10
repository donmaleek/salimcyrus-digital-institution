import { NextRequest, NextResponse } from 'next/server'
import { createReadStream } from 'fs'
import { Readable } from 'stream'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { courseResourceFilePath, courseResourceFileExists } from '@/lib/api/course-resources-storage'
import { hasActiveParentMembership, PARENT_MEMBERSHIP_COURSE_CATEGORY } from '@/services/payments/parent-membership'

/**
 * Downloads the PDF attached to a lesson (a worksheet, planner, or
 * checklist). Access mirrors the lesson itself: a session plus either a
 * CourseEnrollment row for the lesson's course, or (for a Parental
 * Guidance course) an active Parent Membership. Unlike a book's emailed,
 * token-gated download link, this is a logged-in-member download from
 * inside the course, so the credential is the session + enrollment check,
 * same mechanic as the teaching streaming route, not a mailed token.
 */
export async function GET(request: NextRequest, props: { params: Promise<{ lessonId: string }> }) {
  const params = await props.params
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  const isAdmin = (session?.user as { isAdmin?: boolean } | undefined)?.isAdmin === true
  if (!userId) {
    return NextResponse.json({ error: 'Sign in to download this resource.' }, { status: 401 })
  }

  const lesson = await db.courseLesson.findUnique({
    where: { id: params.lessonId },
    include: { section: { include: { course: true } } },
  })
  if (!lesson || !lesson.resourceFileName || lesson.status !== 'published') {
    return NextResponse.json({ error: 'Resource not found.' }, { status: 404 })
  }
  const course = lesson.section.course

  if (!isAdmin) {
    const enrolled = await db.courseEnrollment.findUnique({
      where: { courseId_userId: { courseId: course.id, userId } },
      select: { id: true },
    })
    const coveredByMembership =
      !enrolled && course.category === PARENT_MEMBERSHIP_COURSE_CATEGORY && (await hasActiveParentMembership(userId))
    if (!enrolled && !coveredByMembership) {
      return NextResponse.json({ error: 'Enroll in this course to download its resources.' }, { status: 403 })
    }
  }

  if (!courseResourceFileExists(lesson.resourceFileName)) {
    console.error('Course lesson resource: file missing', { lessonId: lesson.id })
    return NextResponse.json(
      { error: 'This resource is temporarily unavailable. Contact support for help.' },
      { status: 503 }
    )
  }

  const stream = Readable.toWeb(createReadStream(courseResourceFilePath(lesson.resourceFileName))) as ReadableStream
  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${lesson.resourceLabel ?? lesson.title}.pdf"`,
      'Cache-Control': 'private, no-store',
    },
  })
}
