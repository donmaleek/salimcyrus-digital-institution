/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

jest.mock('../../../../../../../services/crm/access', () => ({
  requireCrmApi: jest.fn(),
}))
jest.mock('../../../../../../../lib/db', () => ({
  db: { courseEnrollment: { findUnique: jest.fn(), delete: jest.fn() } },
}))

import { DELETE } from './route'
import { requireCrmApi } from '@/services/crm/access'
import { db } from '@/lib/db'

const mockRequireCrmApi = requireCrmApi as jest.Mock
const mockFindUnique = db.courseEnrollment.findUnique as jest.Mock
const mockDelete = db.courseEnrollment.delete as jest.Mock

function request() {
  return new NextRequest('https://salimcyrus.com/api/admin/courses/c1/enrollments/enrollment-1', { method: 'DELETE' })
}

describe('DELETE /api/admin/courses/[id]/enrollments/[enrollmentId]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRequireCrmApi.mockResolvedValue(true)
  })

  it('returns 403 without the content:write permission', async () => {
    mockRequireCrmApi.mockResolvedValue(false)
    const response = await DELETE(request(), { params: Promise.resolve({ id: 'c1', enrollmentId: 'enrollment-1' }) })
    expect(response.status).toBe(403)
    expect(mockDelete).not.toHaveBeenCalled()
  })

  it('returns 404 for an unknown enrollment', async () => {
    mockFindUnique.mockResolvedValue(null)
    const response = await DELETE(request(), { params: Promise.resolve({ id: 'c1', enrollmentId: 'enrollment-1' }) })
    expect(response.status).toBe(404)
  })

  it('returns 404 when the enrollment belongs to a different course (cannot revoke across courses)', async () => {
    mockFindUnique.mockResolvedValue({ id: 'enrollment-1', courseId: 'different-course', userId: 'user-1' })
    const response = await DELETE(request(), { params: Promise.resolve({ id: 'c1', enrollmentId: 'enrollment-1' }) })
    expect(response.status).toBe(404)
    expect(mockDelete).not.toHaveBeenCalled()
  })

  it('deletes the enrollment outright, cascading to its progress and stream-event rows', async () => {
    mockFindUnique.mockResolvedValue({ id: 'enrollment-1', courseId: 'c1', userId: 'user-1' })
    const response = await DELETE(request(), { params: Promise.resolve({ id: 'c1', enrollmentId: 'enrollment-1' }) })
    expect(response.status).toBe(200)
    expect(mockDelete).toHaveBeenCalledWith({ where: { id: 'enrollment-1' } })
  })
})
