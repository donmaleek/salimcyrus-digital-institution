import { NextRequest, NextResponse } from 'next/server'
import { createReadStream } from 'fs'
import { Readable } from 'stream'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { courseVideoFilePath, courseVideoFileExists, courseVideoFileSize } from '@/lib/api/course-videos-storage'
import { hasActiveParentMembership, PARENT_MEMBERSHIP_COURSE_CATEGORY } from '@/services/payments/parent-membership'
import { getClientIp } from '@/lib/utils/request'

function contentTypeFor(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase()
  if (ext === 'webm') return 'video/webm'
  if (ext === 'mov') return 'video/quicktime'
  return 'video/mp4'
}

/**
 * Enrollment-gated video streaming with HTTP Range support, the
 * self-hosted replacement for the legacy videoUrl iframe embed (a public
 * URL with no relationship to purchase once someone inspects the page).
 * Mirrors the teaching streaming route exactly: session + access check on
 * every request, Range support so the player can seek without downloading
 * the whole file. Two things it adds beyond teachings, both aimed at the
 * same goal (one purchase quietly shared to many people): a course can
 * define accessWindowDays, after which even a legitimate buyer's stream
 * stops working; and every successful stream start is logged (fire and
 * forget, never blocks the response) so an admin can see an enrollment
 * being watched from far more distinct IPs than one person plausibly
 * would, see getSuspiciousStreamingActivity.
 */
export async function GET(request: NextRequest, props: { params: Promise<{ lessonId: string }> }) {
  const params = await props.params
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  const isAdmin = (session?.user as { isAdmin?: boolean } | undefined)?.isAdmin === true
  if (!userId) {
    return NextResponse.json({ error: 'Sign in to watch this lesson.' }, { status: 401 })
  }

  const lesson = await db.courseLesson.findUnique({
    where: { id: params.lessonId },
    include: { section: { include: { course: true } } },
  })
  if (!lesson || !lesson.videoFileName || lesson.status !== 'published') {
    return NextResponse.json({ error: 'Video not found.' }, { status: 404 })
  }
  const course = lesson.section.course

  let enrollment: { id: string; enrolledAt: Date } | null = null
  if (!isAdmin) {
    enrollment = await db.courseEnrollment.findUnique({
      where: { courseId_userId: { courseId: course.id, userId } },
      select: { id: true, enrolledAt: true },
    })
    const coveredByMembership =
      !enrollment && course.category === PARENT_MEMBERSHIP_COURSE_CATEGORY && (await hasActiveParentMembership(userId))
    if (!enrollment && !coveredByMembership) {
      return NextResponse.json({ error: 'Enroll in this course to watch its lessons.' }, { status: 403 })
    }
    if (enrollment && course.accessWindowDays) {
      const expiresAt = new Date(enrollment.enrolledAt.getTime() + course.accessWindowDays * 24 * 60 * 60 * 1000)
      if (expiresAt.getTime() < Date.now()) {
        return NextResponse.json(
          { error: `Your replay access to this masterclass ended on ${expiresAt.toISOString().slice(0, 10)}.` },
          { status: 403 }
        )
      }
    }
  }

  if (!courseVideoFileExists(lesson.videoFileName)) {
    console.error('Course lesson stream: file missing', { lessonId: lesson.id })
    return NextResponse.json(
      { error: 'This video is temporarily unavailable. Contact support for help.' },
      { status: 503 }
    )
  }

  if (enrollment) {
    db.courseStreamEvent
      .create({ data: { enrollmentId: enrollment.id, lessonId: lesson.id, ipAddress: getClientIp(request) } })
      .catch((error) => console.error('Course stream event log failed (non-fatal)', { lessonId: lesson.id, error }))
  }

  const filePath = courseVideoFilePath(lesson.videoFileName)
  const fileSize = courseVideoFileSize(lesson.videoFileName)
  const contentType = contentTypeFor(lesson.videoFileName)
  const range = request.headers.get('range')

  if (!range) {
    const stream = Readable.toWeb(createReadStream(filePath)) as ReadableStream
    return new NextResponse(stream, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': String(fileSize),
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'private, no-store',
      },
    })
  }

  const match = /bytes=(\d*)-(\d*)/.exec(range)
  if (!match) {
    return NextResponse.json({ error: 'Invalid range header.' }, { status: 416 })
  }
  const start = match[1] ? parseInt(match[1], 10) : 0
  const end = match[2] ? parseInt(match[2], 10) : fileSize - 1
  if (Number.isNaN(start) || Number.isNaN(end) || start > end || end >= fileSize) {
    return new NextResponse(null, { status: 416, headers: { 'Content-Range': `bytes */${fileSize}` } })
  }

  const chunkSize = end - start + 1
  const stream = Readable.toWeb(createReadStream(filePath, { start, end })) as ReadableStream

  return new NextResponse(stream, {
    status: 206,
    headers: {
      'Content-Type': contentType,
      'Content-Length': String(chunkSize),
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'private, no-store',
    },
  })
}
