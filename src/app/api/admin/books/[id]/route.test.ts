/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

jest.mock('../../../../../lib/db', () => ({
  db: { book: { findUnique: jest.fn(), update: jest.fn(), delete: jest.fn() } },
}))
jest.mock('../../../../../services/crm/access', () => ({
  requireCrmApi: jest.fn(),
}))

import { PATCH, DELETE } from './route'
import { db } from '@/lib/db'
import { requireCrmApi } from '@/services/crm/access'

const mockRequireCrmApi = requireCrmApi as jest.Mock
const mockFindUnique = db.book.findUnique as jest.Mock
const mockUpdate = db.book.update as jest.Mock
const mockDelete = db.book.delete as jest.Mock

function patchRequest(body: unknown) {
  return new NextRequest('https://salimcyrus.com/api/admin/books/b1', {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

describe('PATCH /api/admin/books/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRequireCrmApi.mockResolvedValue(true)
    mockFindUnique.mockResolvedValue({ id: 'b1', status: 'draft' })
  })

  it('returns 403 without the content:write permission', async () => {
    mockRequireCrmApi.mockResolvedValue(false)
    const response = await PATCH(patchRequest({ status: 'available' }), { params: { id: 'b1' } })
    expect(response.status).toBe(403)
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('returns 400 for an invalid status', async () => {
    const response = await PATCH(patchRequest({ status: 'published' }), { params: { id: 'b1' } })
    expect(response.status).toBe(400)
  })

  it('returns 404 for an unknown book', async () => {
    mockFindUnique.mockResolvedValue(null)
    const response = await PATCH(patchRequest({ status: 'available' }), { params: { id: 'missing' } })
    expect(response.status).toBe(404)
  })

  it('publishes a draft book', async () => {
    mockUpdate.mockResolvedValue({ id: 'b1', status: 'available' })
    const response = await PATCH(patchRequest({ status: 'available' }), { params: { id: 'b1' } })
    expect(response.status).toBe(200)
    expect(mockUpdate).toHaveBeenCalledWith({ where: { id: 'b1' }, data: { status: 'available' } })
  })
})

describe('DELETE /api/admin/books/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockRequireCrmApi.mockResolvedValue(true)
    mockFindUnique.mockResolvedValue({ id: 'b1' })
  })

  it('returns 403 without the content:write permission', async () => {
    mockRequireCrmApi.mockResolvedValue(false)
    const response = await DELETE(new NextRequest('https://salimcyrus.com/x'), { params: { id: 'b1' } })
    expect(response.status).toBe(403)
    expect(mockDelete).not.toHaveBeenCalled()
  })

  it('returns 404 for an unknown book', async () => {
    mockFindUnique.mockResolvedValue(null)
    const response = await DELETE(new NextRequest('https://salimcyrus.com/x'), { params: { id: 'missing' } })
    expect(response.status).toBe(404)
  })

  it('deletes an existing book', async () => {
    const response = await DELETE(new NextRequest('https://salimcyrus.com/x'), { params: { id: 'b1' } })
    expect(response.status).toBe(200)
    expect(mockDelete).toHaveBeenCalledWith({ where: { id: 'b1' } })
  })
})
