/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

jest.mock('../../../../services/crm/access', () => ({
  requireCrmApi: jest.fn(),
}))
jest.mock('../../../../lib/db', () => ({
  db: {
    paymentClaim: { findMany: jest.fn() },
    teaching: { findMany: jest.fn() },
  },
}))

import { GET } from './route'
import { requireCrmApi } from '@/services/crm/access'
import { db } from '@/lib/db'
import { books } from '@/lib/data/books'

const mockRequireCrmApi = requireCrmApi as jest.Mock
const mockFindMany = db.paymentClaim.findMany as jest.Mock
const mockTeachingFindMany = db.teaching.findMany as jest.Mock

function request(query = '') {
  return new NextRequest(`https://salimcyrus.com/api/admin/payment-claims${query}`)
}

describe('GET /api/admin/payment-claims', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockTeachingFindMany.mockResolvedValue([])
  })

  it('returns 403 without the finance:read permission', async () => {
    mockRequireCrmApi.mockResolvedValue(false)
    const response = await GET(request())
    expect(response.status).toBe(403)
  })

  it('lists all claims ordered by newest first when no status filter is given', async () => {
    mockRequireCrmApi.mockResolvedValue(true)
    mockFindMany.mockResolvedValue([])
    await GET(request())
    expect(mockFindMany).toHaveBeenCalledWith({ where: undefined, orderBy: { createdAt: 'desc' } })
  })

  it('filters by status when given', async () => {
    mockRequireCrmApi.mockResolvedValue(true)
    mockFindMany.mockResolvedValue([])
    await GET(request('?status=pending'))
    expect(mockFindMany).toHaveBeenCalledWith({ where: { status: 'pending' }, orderBy: { createdAt: 'desc' } })
  })

  it('enriches a book claim with the real book title', async () => {
    mockRequireCrmApi.mockResolvedValue(true)
    const book = books[0]
    mockFindMany.mockResolvedValue([{ id: 'c1', offerType: 'book', bookSlug: book.slug, teachingId: null }])

    const response = await GET(request())
    const payload = await response.json()

    expect(payload.claims[0].offerTitle).toBe(book.title)
  })

  it('enriches a teaching claim with the real teaching title', async () => {
    mockRequireCrmApi.mockResolvedValue(true)
    mockFindMany.mockResolvedValue([{ id: 'c1', offerType: 'teaching', bookSlug: null, teachingId: 'teaching-1' }])
    mockTeachingFindMany.mockResolvedValue([{ id: 'teaching-1', title: 'Leading a Family' }])

    const response = await GET(request())
    const payload = await response.json()

    expect(payload.claims[0].offerTitle).toBe('Leading a Family')
  })

  it('labels a donation claim clearly', async () => {
    mockRequireCrmApi.mockResolvedValue(true)
    mockFindMany.mockResolvedValue([{ id: 'c1', offerType: 'donation', bookSlug: null, teachingId: null }])

    const response = await GET(request())
    const payload = await response.json()

    expect(payload.claims[0].offerTitle).toBe('Support the Mission')
  })
})
