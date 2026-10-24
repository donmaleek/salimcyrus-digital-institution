import { NextRequest, NextResponse } from 'next/server'
import { requireCrmApi } from '@/services/crm/access'
import { db } from '@/lib/db'
import { courseInputSchema, courseInputErrorMessage } from '@/services/courses/contracts'
import { createCourse } from '@/services/courses/course-service'

export async function GET() {
  if (!(await requireCrmApi('content:write'))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const courses = await db.course.findMany({ include: { _count: { select: { enrollments: true } } }, orderBy: { updatedAt: 'desc' } })
  return NextResponse.json({ courses })
}

export async function POST(request: NextRequest) {
  if (!(await requireCrmApi('content:write'))) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const parsed = courseInputSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: courseInputErrorMessage(parsed.error) }, { status: 400 })
  const course = await createCourse(parsed.data)
  return NextResponse.json({ course }, { status: 201 })
}
