jest.mock('../../lib/db', () => ({
  db: { courseEnrollment: { findMany: jest.fn() } },
}))

import { db } from '@/lib/db'
import { getCourseStreamingActivity, SUSPICIOUS_DISTINCT_IP_THRESHOLD } from './streaming-activity'

const mockFindMany = db.courseEnrollment.findMany as jest.Mock

describe('getCourseStreamingActivity', () => {
  beforeEach(() => jest.clearAllMocks())

  it('counts distinct IPs, not total stream events, for each enrollment', async () => {
    mockFindMany.mockResolvedValue([
      {
        id: 'enrollment-1',
        userId: 'user-1',
        enrolledAt: new Date('2026-01-01'),
        user: { id: 'user-1', name: 'Buyer One', email: 'buyer1@example.com' },
        streamEvents: [{ ipAddress: '1.1.1.1' }, { ipAddress: '1.1.1.1' }, { ipAddress: '1.1.1.1' }],
      },
    ])

    const [row] = await getCourseStreamingActivity('course-1')
    expect(row.distinctIpCount).toBe(1)
    expect(row.streamCount).toBe(3)
    expect(row.suspicious).toBe(false)
  })

  it(`flags an enrollment with more than ${SUSPICIOUS_DISTINCT_IP_THRESHOLD} distinct IPs`, async () => {
    const manyIps = Array.from({ length: SUSPICIOUS_DISTINCT_IP_THRESHOLD + 1 }, (_, i) => ({ ipAddress: `10.0.0.${i}` }))
    mockFindMany.mockResolvedValue([
      {
        id: 'enrollment-1',
        userId: 'user-1',
        enrolledAt: new Date('2026-01-01'),
        user: { id: 'user-1', name: 'Sharer', email: 'sharer@example.com' },
        streamEvents: manyIps,
      },
    ])

    const [row] = await getCourseStreamingActivity('course-1')
    expect(row.distinctIpCount).toBe(SUSPICIOUS_DISTINCT_IP_THRESHOLD + 1)
    expect(row.suspicious).toBe(true)
  })

  it(`does not flag exactly ${SUSPICIOUS_DISTINCT_IP_THRESHOLD} distinct IPs (the threshold itself is not suspicious, only exceeding it)`, async () => {
    const ips = Array.from({ length: SUSPICIOUS_DISTINCT_IP_THRESHOLD }, (_, i) => ({ ipAddress: `10.0.0.${i}` }))
    mockFindMany.mockResolvedValue([
      {
        id: 'enrollment-1',
        userId: 'user-1',
        enrolledAt: new Date('2026-01-01'),
        user: { id: 'user-1', name: 'Traveler', email: 'traveler@example.com' },
        streamEvents: ips,
      },
    ])

    const [row] = await getCourseStreamingActivity('course-1')
    expect(row.suspicious).toBe(false)
  })

  it('only looks at stream events within the last 7 days (enforced by the DB query filter passed to findMany)', async () => {
    mockFindMany.mockResolvedValue([])
    await getCourseStreamingActivity('course-1')
    const call = mockFindMany.mock.calls[0][0]
    expect(call.include.streamEvents.where.createdAt.gte).toBeInstanceOf(Date)
  })

  it('sorts the most-suspicious (highest distinct IP count) enrollment first', async () => {
    mockFindMany.mockResolvedValue([
      {
        id: 'enrollment-low',
        userId: 'user-1',
        enrolledAt: new Date(),
        user: { id: 'user-1', name: 'Low', email: 'low@example.com' },
        streamEvents: [{ ipAddress: '1.1.1.1' }],
      },
      {
        id: 'enrollment-high',
        userId: 'user-2',
        enrolledAt: new Date(),
        user: { id: 'user-2', name: 'High', email: 'high@example.com' },
        streamEvents: [{ ipAddress: '1.1.1.1' }, { ipAddress: '2.2.2.2' }, { ipAddress: '3.3.3.3' }],
      },
    ])

    const rows = await getCourseStreamingActivity('course-1')
    expect(rows[0].enrollmentId).toBe('enrollment-high')
  })
})
