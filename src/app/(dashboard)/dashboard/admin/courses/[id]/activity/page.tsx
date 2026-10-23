import { notFound } from 'next/navigation'
import { requireCrmPage } from '@/services/crm/access'
import { db } from '@/lib/db'
import { getCourseStreamingActivity, SUSPICIOUS_DISTINCT_IP_THRESHOLD } from '@/services/courses/streaming-activity'
import { CourseActivityManager } from '@/components/dashboard/CourseActivityManager'

export const dynamic = 'force-dynamic'

export default async function CourseActivityPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  await requireCrmPage('content:write')

  const course = await db.course.findUnique({ where: { id: params.id }, select: { id: true, title: true, kind: true } })
  if (!course) notFound()

  const activity = await getCourseStreamingActivity(course.id)
  const flaggedCount = activity.filter((row) => row.suspicious).length

  return (
    <div>
      <div className="rounded-3xl bg-navy px-7 py-9 text-white">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">Streaming activity</p>
        <h1 className="mt-3 font-heading text-3xl font-bold">{course.title}</h1>
        <p className="mt-3 max-w-2xl text-white/70">
          Distinct IP addresses that streamed a lesson under each enrollment in the last 7 days. More than{' '}
          {SUSPICIOUS_DISTINCT_IP_THRESHOLD} is flagged for review, it is a signal to judge, not proof of sharing:
          travel, VPNs, and mobile networks all churn IPs for one honest buyer too.
          {flaggedCount > 0 && (
            <strong className="mt-2 block text-gold-200">
              {flaggedCount} enrollment{flaggedCount === 1 ? '' : 's'} flagged right now.
            </strong>
          )}
        </p>
      </div>
      <div className="mt-8">
        <CourseActivityManager
          courseId={course.id}
          rows={activity.map((row) => ({
            enrollmentId: row.enrollmentId,
            userName: row.userName,
            userEmail: row.userEmail,
            enrolledAt: row.enrolledAt.toISOString(),
            distinctIpCount: row.distinctIpCount,
            streamCount: row.streamCount,
            suspicious: row.suspicious,
          }))}
        />
      </div>
    </div>
  )
}
