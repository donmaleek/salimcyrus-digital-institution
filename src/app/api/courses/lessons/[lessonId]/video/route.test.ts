/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

jest.mock('next-auth', () => ({ getServerSession: jest.fn() }))
jest.mock('../../../../../../lib/auth', () => ({ authOptions: {} }))
jest.mock('../../../../../../lib/db', () => ({
  db: {
    courseLesson: { findUnique: jest.fn() },
    courseEnrollment: { findUnique: jest.fn() },
    courseStreamEvent: { create: jest.fn().mockResolvedValue({}) },
  },
}))
jest.mock('../../../../../../lib/api/course-videos-storage', () => ({
  courseVideoFilePath: jest.fn(() => '/tmp/fake-video.mp4'),
  courseVideoFileExists: jest.fn(() => true),
  courseVideoFileSize: jest.fn(() => 1000),
}))
jest.mock('../../../../../../services/payments/parent-membership', () => ({
  hasActiveParentMembership: jest.fn(),
  PARENT_MEMBERSHIP_COURSE_CATEGORY: 'Parental Guidance',
}))
jest.mock('fs', () => ({ createReadStream: jest.fn(() => require('stream').Readable.from(['x'])) }))

import { GET } from './route'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'
import { courseVideoFileExists } from '@/lib/api/course-videos-storage'
import { hasActiveParentMembership } from '@/services/payments/parent-membership'

const mockGetServerSession = getServerSession as jest.Mock
const mockFindLesson = db.courseLesson.findUnique as jest.Mock
const mockFindEnrollment = db.courseEnrollment.findUnique as jest.Mock
const mockCreateStreamEvent = db.courseStreamEvent.create as jest.Mock
const mockFileExists = courseVideoFileExists as jest.Mock
const mockHasMembership = hasActiveParentMembership as jest.Mock

function request(headers: Record<string, string> = {}) {
  return new NextRequest('https://salimcyrus.com/api/courses/lessons/lesson-1/video', { headers })
}

const publishedLesson = (overrides: Record<string, unknown> = {}) => ({
  id: 'lesson-1',
  status: 'published',
  videoFileName: 'lesson-1.mp4',
  section: { course: { id: 'course-1', category: 'Personal Growth', accessWindowDays: null } },
  ...overrides,
})

describe('GET /api/courses/lessons/[lessonId]/video', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFileExists.mockReturnValue(true)
  })

  it('returns 401 when signed out', async () => {
    mockGetServerSession.mockResolvedValue(null)
    const response = await GET(request(), { params: Promise.resolve({ lessonId: 'lesson-1' }) })
    expect(response.status).toBe(401)
  })

  it('returns 404 when the lesson has no video or is unpublished', async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } })
    mockFindLesson.mockResolvedValue(publishedLesson({ videoFileName: null }))
    const response = await GET(request(), { params: Promise.resolve({ lessonId: 'lesson-1' }) })
    expect(response.status).toBe(404)
  })

  it('returns 403 when the caller is neither enrolled nor covered by membership', async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } })
    mockFindLesson.mockResolvedValue(publishedLesson())
    mockFindEnrollment.mockResolvedValue(null)
    mockHasMembership.mockResolvedValue(false)
    const response = await GET(request(), { params: Promise.resolve({ lessonId: 'lesson-1' }) })
    expect(response.status).toBe(403)
    expect(mockCreateStreamEvent).not.toHaveBeenCalled()
  })

  it('streams for a directly enrolled user and logs a stream event against their enrollment', async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } })
    mockFindLesson.mockResolvedValue(publishedLesson())
    mockFindEnrollment.mockResolvedValue({ id: 'enrollment-1', enrolledAt: new Date('2026-01-01') })
    const response = await GET(request(), { params: Promise.resolve({ lessonId: 'lesson-1' }) })
    expect(response.status).toBe(200)
    expect(mockCreateStreamEvent).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ enrollmentId: 'enrollment-1', lessonId: 'lesson-1' }) })
    )
  })

  it('streams for a non-enrolled user covered by an active Parent Membership, without logging a stream event (no enrollment row to attach it to)', async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } })
    mockFindLesson.mockResolvedValue(publishedLesson({ section: { course: { id: 'course-1', category: 'Parental Guidance', accessWindowDays: null } } }))
    mockFindEnrollment.mockResolvedValue(null)
    mockHasMembership.mockResolvedValue(true)
    const response = await GET(request(), { params: Promise.resolve({ lessonId: 'lesson-1' }) })
    expect(response.status).toBe(200)
    expect(mockCreateStreamEvent).not.toHaveBeenCalled()
  })

  it('lets an admin stream without an enrollment row (preview)', async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: 'admin-1', isAdmin: true } })
    mockFindLesson.mockResolvedValue(publishedLesson())
    const response = await GET(request(), { params: Promise.resolve({ lessonId: 'lesson-1' }) })
    expect(response.status).toBe(200)
    expect(mockFindEnrollment).not.toHaveBeenCalled()
  })

  it('returns 403 once the course access window has passed, even for a genuinely enrolled buyer', async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } })
    mockFindLesson.mockResolvedValue(publishedLesson({ section: { course: { id: 'course-1', category: 'Personal Growth', accessWindowDays: 30 } } }))
    mockFindEnrollment.mockResolvedValue({ id: 'enrollment-1', enrolledAt: new Date('2020-01-01') })
    const response = await GET(request(), { params: Promise.resolve({ lessonId: 'lesson-1' }) })
    expect(response.status).toBe(403)
    expect(mockCreateStreamEvent).not.toHaveBeenCalled()
  })

  it('still streams within the access window', async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } })
    mockFindLesson.mockResolvedValue(publishedLesson({ section: { course: { id: 'course-1', category: 'Personal Growth', accessWindowDays: 365 } } }))
    mockFindEnrollment.mockResolvedValue({ id: 'enrollment-1', enrolledAt: new Date() })
    const response = await GET(request(), { params: Promise.resolve({ lessonId: 'lesson-1' }) })
    expect(response.status).toBe(200)
  })

  it('an access window never applies to an admin preview', async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: 'admin-1', isAdmin: true } })
    mockFindLesson.mockResolvedValue(publishedLesson({ section: { course: { id: 'course-1', category: 'Personal Growth', accessWindowDays: 1 } } }))
    const response = await GET(request(), { params: Promise.resolve({ lessonId: 'lesson-1' }) })
    expect(response.status).toBe(200)
  })

  it('returns 503 when the file is missing on disk', async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } })
    mockFindLesson.mockResolvedValue(publishedLesson())
    mockFindEnrollment.mockResolvedValue({ id: 'enrollment-1', enrolledAt: new Date() })
    mockFileExists.mockReturnValue(false)
    const response = await GET(request(), { params: Promise.resolve({ lessonId: 'lesson-1' }) })
    expect(response.status).toBe(503)
  })

  it('returns 206 with a Content-Range for a partial request (seeking)', async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } })
    mockFindLesson.mockResolvedValue(publishedLesson())
    mockFindEnrollment.mockResolvedValue({ id: 'enrollment-1', enrolledAt: new Date() })
    const response = await GET(request({ range: 'bytes=100-199' }), { params: Promise.resolve({ lessonId: 'lesson-1' }) })
    expect(response.status).toBe(206)
    expect(response.headers.get('Content-Range')).toBe('bytes 100-199/1000')
  })
})
