/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

jest.mock('../../../../../lib/db', () => ({
  db: {
    teaching: { findUnique: jest.fn(), update: jest.fn(), delete: jest.fn() },
  },
}))
jest.mock('../../../../../services/crm/access', () => ({
  requireCrmApi: jest.fn(),
}))

import { PATCH, DELETE } from './route'
import { db } from '@/lib/db'
import { requireCrmApi } from '@/services/crm/access'

const mockRequireCrmApi = requireCrmApi as jest.Mock
const mockFindUnique = db.teaching.findUnique as jest.Mock
const mockUpdate = db.teaching.update as jest.Mock
const mockDelete = db.teaching.delete as jest.Mock

function patchRequest(body: unknown) {
  return new NextRequest('https://salimcyrus.com/api/admin/teachings/t1', {
    method: 'PATCH',
    body: JSON.stringify(body),
  })
}

describe('PATCH /api/admin/teachings/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 403 without the content:write permission', async () => {
    mockRequireCrmApi.mockResolvedValue(false)
    const response = await PATCH(patchRequest({ status: 'published' }), { params: { id: 't1' } })
    expect(response.status).toBe(403)
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('returns 400 for an invalid status', async () => {
    mockRequireCrmApi.mockResolvedValue(true)
    const response = await PATCH(patchRequest({ status: 'archived' }), { params: { id: 't1' } })
    expect(response.status).toBe(400)
  })

  it('returns 404 when the teaching does not exist', async () => {
    mockRequireCrmApi.mockResolvedValue(true)
    mockFindUnique.mockResolvedValue(null)
    const response = await PATCH(patchRequest({ status: 'published' }), { params: { id: 't1' } })
    expect(response.status).toBe(404)
  })

  it('publishes a draft teaching', async () => {
    mockRequireCrmApi.mockResolvedValue(true)
    mockFindUnique.mockResolvedValue({ id: 't1', status: 'draft' })
    mockUpdate.mockResolvedValue({ id: 't1', status: 'published' })

    const response = await PATCH(patchRequest({ status: 'published' }), { params: { id: 't1' } })

    expect(response.status).toBe(200)
    expect(mockUpdate).toHaveBeenCalledWith({ where: { id: 't1' }, data: { status: 'published' } })
  })
})

describe('DELETE /api/admin/teachings/[id]', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 403 without permission', async () => {
    mockRequireCrmApi.mockResolvedValue(false)
    const response = await DELETE(new NextRequest('https://salimcyrus.com/x'), { params: { id: 't1' } })
    expect(response.status).toBe(403)
    expect(mockDelete).not.toHaveBeenCalled()
  })

  it('returns 404 when the teaching does not exist', async () => {
    mockRequireCrmApi.mockResolvedValue(true)
    mockFindUnique.mockResolvedValue(null)
    const response = await DELETE(new NextRequest('https://salimcyrus.com/x'), { params: { id: 't1' } })
    expect(response.status).toBe(404)
  })

  it('deletes an existing teaching', async () => {
    mockRequireCrmApi.mockResolvedValue(true)
    mockFindUnique.mockResolvedValue({ id: 't1' })
    const response = await DELETE(new NextRequest('https://salimcyrus.com/x'), { params: { id: 't1' } })
    expect(response.status).toBe(200)
    expect(mockDelete).toHaveBeenCalledWith({ where: { id: 't1' } })
  })
})
