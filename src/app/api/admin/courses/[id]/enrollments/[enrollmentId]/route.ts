import { NextRequest, NextResponse } from 'next/server'
import { requireCrmApi } from '@/services/crm/access'
import { db } from '@/lib/db'

/**
 * Revokes one member's access to a course: an explicit, admin-only,
 * one-click action for exactly the case this platform otherwise only
 * detects and reports (see streaming-activity.ts), an enrollment being
 * watched from far more places than one buyer plausibly would. Deletes
 * the CourseEnrollment outright rather than flipping a status flag, since
 * there is no partial-access state for a course; cascades to its
 * progress and stream-event rows. Never automatic: a human reviewed the
 * activity and chose this.
 */
export async function DELETE(_request: NextRequest, props: { params: Promise<{ id: string; enrollmentId: string }> }) {
  const params = await props.params
  if (!(await requireCrmApi('content:write'))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const enrollment = await db.courseEnrollment.findUnique({ where: { id: params.enrollmentId } })
  if (!enrollment || enrollment.courseId !== params.id) {
    return NextResponse.json({ error: 'Enrollment not found.' }, { status: 404 })
  }

  await db.courseEnrollment.delete({ where: { id: enrollment.id } })
  console.info('Admin revoked course access', { courseId: params.id, enrollmentId: enrollment.id, userId: enrollment.userId })
  return NextResponse.json({ status: 'ok' })
}
