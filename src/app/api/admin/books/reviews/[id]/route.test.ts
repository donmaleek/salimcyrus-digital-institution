/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

jest.mock('../../../../../../lib/db', () => ({
  db: {
    bookReview: { findUnique: jest.fn(), update: jest.fn(), delete: jest.fn() },
  },
}))
jest.mock('../../../../../../services/crm/access', () => ({
  requireCrmApi: jest.fn(),
}))

import { PATCH, DELETE } from './route'
import { db } from '@/lib/db'
import { requireCrmApi } from '@/services/crm/access'

const mockRequireCrmApi = requireCrmApi as jest.Mock
const mockFindUnique = db.bookReview.findUnique as jest.Mock
const mockUpdate = db.bookReview.update as jest.Mock
const mockDelete = db.bookReview.delete as jest.Mock

function patchRequest(body: unknown) {
  return new NextRequest('https://salimcyrus.com/api/admin/books/reviews/r1', {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

describe('PATCH /api/admin/books/reviews/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 403 when the caller lacks the content:write permission', async () => {
    mockRequireCrmApi.mockResolvedValue(false)
    const response = await PATCH(patchRequest({ status: 'approved' }), { params: { id: 'r1' } })
    expect(response.status).toBe(403)
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('returns 400 for an invalid status', async () => {
    mockRequireCrmApi.mockResolvedValue(true)
    const response = await PATCH(patchRequest({ status: 'maybe' }), { params: { id: 'r1' } })
    expect(response.status).toBe(400)
  })

  it('returns 404 when the review does not exist', async () => {
    mockRequireCrmApi.mockResolvedValue(true)
    mockFindUnique.mockResolvedValue(null)
    const response = await PATCH(patchRequest({ status: 'approved' }), { params: { id: 'r1' } })
    expect(response.status).toBe(404)
  })

  it('approves a review and stamps moderatedAt', async () => {
    mockRequireCrmApi.mockResolvedValue(true)
    mockFindUnique.mockResolvedValue({ id: 'r1', status: 'pending' })
    mockUpdate.mockResolvedValue({ id: 'r1', status: 'approved' })

    const response = await PATCH(patchRequest({ status: 'approved' }), { params: { id: 'r1' } })

    expect(response.status).toBe(200)
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: 'r1' },
      data: { status: 'approved', moderatedAt: expect.any(Date) },
    })
  })
})

describe('DELETE /api/admin/books/reviews/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 403 without permission', async () => {
    mockRequireCrmApi.mockResolvedValue(false)
    const response = await DELETE(new NextRequest('https://salimcyrus.com/x'), { params: { id: 'r1' } })
    expect(response.status).toBe(403)
    expect(mockDelete).not.toHaveBeenCalled()
  })

  it('deletes an existing review', async () => {
    mockRequireCrmApi.mockResolvedValue(true)
    mockFindUnique.mockResolvedValue({ id: 'r1' })
    const response = await DELETE(new NextRequest('https://salimcyrus.com/x'), { params: { id: 'r1' } })
    expect(response.status).toBe(200)
    expect(mockDelete).toHaveBeenCalledWith({ where: { id: 'r1' } })
  })
})
