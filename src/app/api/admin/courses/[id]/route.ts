import { NextRequest, NextResponse } from 'next/server'
import { requireCrmApi } from '@/services/crm/access'
import { db } from '@/lib/db'
import { courseInputSchema } from '@/services/courses/contracts'
import { updateCourse } from '@/services/courses/course-service'

export async function GET(_request: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireCrmApi('content:write'))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const course = await db.course.findUnique({ where: { id: params.id }, include: { sections: { include: { lessons: { orderBy: { position: 'asc' } } }, orderBy: { position: 'asc' } } } })
  return course ? NextResponse.json({ course }) : NextResponse.json({ error: 'Not found' }, { status: 404 })
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireCrmApi('content:write'))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const parsed = courseInputSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid course.' }, { status: 400 })
  const existing = await db.course.findUnique({ where: { id: params.id } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  try {
    return NextResponse.json({ course: await updateCourse(params.id, parsed.data) })
  } catch (error) {
    if (error instanceof Error && error.message === 'COURSE_HAS_ENROLLMENTS') {
      return NextResponse.json({ error: 'This course has learners. Archive it instead of replacing its curriculum.' }, { status: 409 })
    }
    throw error
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireCrmApi('content:write'))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const enrollmentCount = await db.courseEnrollment.count({ where: { courseId: params.id } })
  if (enrollmentCount) return NextResponse.json({ error: 'Archive courses with enrolled members instead of deleting them.' }, { status: 409 })
  await db.course.delete({ where: { id: params.id } }).catch(() => null)
  return NextResponse.json({ status: 'ok' })
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireCrmApi('content:write'))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await request.json().catch(() => null) as { status?: unknown } | null
  if (!body || !['draft', 'published', 'archived'].includes(String(body.status))) return NextResponse.json({ error: 'Invalid status.' }, { status: 400 })
  const existing = await db.course.findUnique({ where: { id: params.id }, select: { id: true } })
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const course = await db.course.update({ where: { id: params.id }, data: { status: String(body.status) } })
  console.info('Admin changed course status', { courseId: course.id, status: course.status })
  return NextResponse.json({ course })
}
