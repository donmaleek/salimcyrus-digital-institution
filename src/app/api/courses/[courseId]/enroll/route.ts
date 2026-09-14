import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { enrollUser } from '@/services/courses/course-service'

export async function POST(_request: NextRequest, { params }: { params: { courseId: string } }) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) return NextResponse.json({ error: 'Sign in to enroll.' }, { status: 401 })
  const course = await db.course.findUnique({ where: { id: params.courseId } })
  if (!course || course.status !== 'published') return NextResponse.json({ error: 'This course is not available.' }, { status: 404 })
  if (course.priceKes > 0 || course.priceUsd > 0) return NextResponse.json({ error: 'Payment is required for this course.' }, { status: 402 })
  const enrollment = await enrollUser(course.id, userId, `free:${course.id}:${userId}`, 'free')
  return NextResponse.json({ enrollment, learnUrl: `/dashboard/my-learning/courses/${course.slug}` })
}
