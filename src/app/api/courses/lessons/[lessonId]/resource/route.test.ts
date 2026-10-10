/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

jest.mock('next-auth', () => ({ getServerSession: jest.fn() }))
jest.mock('../../../../../../lib/auth', () => ({ authOptions: {} }))
jest.mock('../../../../../../lib/db', () => ({
  db: { courseLesson: { findUnique: jest.fn() }, courseEnrollment: { findUnique: jest.fn() } },
}))
jest.mock('../../../../../../lib/api/course-resources-storage', () => ({
  courseResourceFilePath: jest.fn(() => '/tmp/fake-worksheet.pdf'),
  courseResourceFileExists: jest.fn(() => true),
}))
jest.mock('../../../../../../services/payments/parent-membership', () => ({
  hasActiveParentMembership: jest.fn(),
  PARENT_MEMBERSHIP_COURSE_CATEGORY: 'Parental Guidance',
}))
jest.mock('fs', () => ({ createReadStream: jest.fn(() => require('stream').Readable.from(['x'])) }))

import { GET } from './route'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'
import { courseResourceFileExists } from '@/lib/api/course-resources-storage'
import { hasActiveParentMembership } from '@/services/payments/parent-membership'

const mockGetServerSession = getServerSession as jest.Mock
const mockFindLesson = db.courseLesson.findUnique as jest.Mock
const mockFindEnrollment = db.courseEnrollment.findUnique as jest.Mock
const mockFileExists = courseResourceFileExists as jest.Mock
const mockHasMembership = hasActiveParentMembership as jest.Mock

function request() {
  return new NextRequest('https://salimcyrus.com/api/courses/lessons/lesson-1/resource')
}

const publishedLesson = (overrides: Record<string, unknown> = {}) => ({
  id: 'lesson-1',
  status: 'published',
  resourceFileName: 'module-01-worksheet.pdf',
  resourceLabel: 'Age-based expectations and observation worksheet',
  title: 'Understanding Child Development',
  section: { course: { id: 'course-1', category: 'Parental Guidance' } },
  ...overrides,
})

describe('GET /api/courses/lessons/[lessonId]/resource', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFileExists.mockReturnValue(true)
  })

  it('returns 401 when signed out', async () => {
    mockGetServerSession.mockResolvedValue(null)
    const response = await GET(request(), { params: Promise.resolve({ lessonId: 'lesson-1' }) })
    expect(response.status).toBe(401)
  })

  it('returns 404 when the lesson has no attached resource', async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } })
    mockFindLesson.mockResolvedValue(publishedLesson({ resourceFileName: null }))
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
  })

  it('allows download for a directly enrolled user', async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } })
    mockFindLesson.mockResolvedValue(publishedLesson())
    mockFindEnrollment.mockResolvedValue({ id: 'enrollment-1' })
    const response = await GET(request(), { params: Promise.resolve({ lessonId: 'lesson-1' }) })
    expect(response.status).toBe(200)
    expect(mockHasMembership).not.toHaveBeenCalled()
  })

  it('allows download for a non-enrolled user covered by an active Parent Membership', async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } })
    mockFindLesson.mockResolvedValue(publishedLesson())
    mockFindEnrollment.mockResolvedValue(null)
    mockHasMembership.mockResolvedValue(true)
    const response = await GET(request(), { params: Promise.resolve({ lessonId: 'lesson-1' }) })
    expect(response.status).toBe(200)
  })

  it('never checks membership for a course outside the Parental Guidance category', async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } })
    mockFindLesson.mockResolvedValue(publishedLesson({ section: { course: { id: 'course-1', category: 'Leadership' } } }))
    mockFindEnrollment.mockResolvedValue(null)
    const response = await GET(request(), { params: Promise.resolve({ lessonId: 'lesson-1' }) })
    expect(response.status).toBe(403)
    expect(mockHasMembership).not.toHaveBeenCalled()
  })

  it('lets an admin download without enrollment (preview)', async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: 'admin-1', isAdmin: true } })
    mockFindLesson.mockResolvedValue(publishedLesson())
    const response = await GET(request(), { params: Promise.resolve({ lessonId: 'lesson-1' }) })
    expect(response.status).toBe(200)
    expect(mockFindEnrollment).not.toHaveBeenCalled()
  })

  it('returns 503 when the file is missing on disk', async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } })
    mockFindLesson.mockResolvedValue(publishedLesson())
    mockFindEnrollment.mockResolvedValue({ id: 'enrollment-1' })
    mockFileExists.mockReturnValue(false)
    const response = await GET(request(), { params: Promise.resolve({ lessonId: 'lesson-1' }) })
    expect(response.status).toBe(503)
  })

  it('sets Content-Disposition to the resource label, not the raw filename', async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } })
    mockFindLesson.mockResolvedValue(publishedLesson())
    mockFindEnrollment.mockResolvedValue({ id: 'enrollment-1' })
    const response = await GET(request(), { params: Promise.resolve({ lessonId: 'lesson-1' }) })
    expect(response.headers.get('Content-Disposition')).toContain('Age-based expectations and observation worksheet.pdf')
  })
})
