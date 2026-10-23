import { db } from '@/lib/db'

/** More distinct IPs than this watching one enrollment inside a week is
 * the threshold for flagging it to an admin. Deliberately generous: home
 * wifi + mobile data + a work laptop is already 2-3 IPs for one honest
 * buyer, and VPNs/travel push that further. This is a signal for a human
 * to judge, never an automatic cutoff. */
export const SUSPICIOUS_DISTINCT_IP_THRESHOLD = 4
const ACTIVITY_WINDOW_DAYS = 7

export interface EnrollmentActivity {
  enrollmentId: string
  userId: string
  userName: string
  userEmail: string
  enrolledAt: Date
  distinctIpCount: number
  streamCount: number
  suspicious: boolean
}

/**
 * Per-enrollment streaming activity for one course over the last 7 days,
 * sorted most-suspicious first. Used only to surface a signal to an admin
 * on /dashboard/admin/courses/[id]/activity, never to automatically
 * revoke anything, see SUSPICIOUS_DISTINCT_IP_THRESHOLD.
 */
export async function getCourseStreamingActivity(courseId: string): Promise<EnrollmentActivity[]> {
  const since = new Date(Date.now() - ACTIVITY_WINDOW_DAYS * 24 * 60 * 60 * 1000)
  const enrollments = await db.courseEnrollment.findMany({
    where: { courseId },
    include: {
      user: { select: { id: true, name: true, email: true } },
      streamEvents: { where: { createdAt: { gte: since } }, select: { ipAddress: true } },
    },
    orderBy: { enrolledAt: 'desc' },
  })

  const activity = enrollments.map((enrollment) => {
    const distinctIpCount = new Set(enrollment.streamEvents.map((event) => event.ipAddress)).size
    return {
      enrollmentId: enrollment.id,
      userId: enrollment.user.id,
      userName: enrollment.user.name,
      userEmail: enrollment.user.email,
      enrolledAt: enrollment.enrolledAt,
      distinctIpCount,
      streamCount: enrollment.streamEvents.length,
      suspicious: distinctIpCount > SUSPICIOUS_DISTINCT_IP_THRESHOLD,
    }
  })

  return activity.sort((a, b) => b.distinctIpCount - a.distinctIpCount)
}
