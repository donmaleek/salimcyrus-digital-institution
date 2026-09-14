import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { progressInputSchema } from '@/services/courses/contracts'

export async function PUT(request: NextRequest, { params }: { params: { courseId: string; lessonId: string } }) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) return NextResponse.json({ error: 'Sign in to save progress.' }, { status: 401 })
  const parsed = progressInputSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Invalid progress.' }, { status: 400 })
  const enrollment = await db.courseEnrollment.findUnique({ where: { courseId_userId: { courseId: params.courseId, userId } } })
  if (!enrollment) return NextResponse.json({ error: 'Enroll before starting this course.' }, { status: 403 })
  const lesson = await db.courseLesson.findFirst({ where: { id: params.lessonId, section: { courseId: params.courseId }, status: 'published' } })
  if (!lesson) return NextResponse.json({ error: 'Lesson not found.' }, { status: 404 })
  await db.courseLessonProgress.upsert({
    where: { enrollmentId_lessonId: { enrollmentId: enrollment.id, lessonId: lesson.id } },
    create: { enrollmentId: enrollment.id, lessonId: lesson.id, lastPositionSeconds: parsed.data.lastPositionSeconds, completedAt: parsed.data.completed ? new Date() : null },
    update: { lastPositionSeconds: parsed.data.lastPositionSeconds, completedAt: parsed.data.completed ? new Date() : null },
  })
  const [total, completed] = await Promise.all([
    db.courseLesson.count({ where: { section: { courseId: params.courseId }, status: 'published' } }),
    db.courseLessonProgress.count({ where: { enrollmentId: enrollment.id, completedAt: { not: null }, lesson: { status: 'published' } } }),
  ])
  const complete = total > 0 && completed === total
  await db.courseEnrollment.update({ where: { id: enrollment.id }, data: { lastLessonId: lesson.id, completedAt: complete ? new Date() : null } })
  return NextResponse.json({ completed, total, percent: total ? Math.round(completed / total * 100) : 0, courseCompleted: complete })
}
