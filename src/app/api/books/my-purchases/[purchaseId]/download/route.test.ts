/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

jest.mock('next-auth', () => ({ getServerSession: jest.fn() }))
jest.mock('../../../../../../lib/auth', () => ({ authOptions: {} }))
jest.mock('../../../../../../lib/db', () => ({
  db: { bookPurchase: { findUnique: jest.fn() } },
}))
jest.mock('../../../../../../services/payments/book-purchases', () => ({
  createDownloadGrant: jest.fn(),
  downloadUrlFor: jest.fn(() => 'https://salimcyrus.com/api/books/download/fresh-token'),
}))

import { POST } from './route'
import { getServerSession } from 'next-auth'
import { db } from '@/lib/db'
import { createDownloadGrant } from '@/services/payments/book-purchases'

const mockGetServerSession = getServerSession as jest.Mock
const mockFindUnique = db.bookPurchase.findUnique as jest.Mock
const mockCreateGrant = createDownloadGrant as jest.Mock

function request() {
  return new NextRequest('https://salimcyrus.com/api/books/my-purchases/p1/download', {
    method: 'POST',
  })
}

describe('POST /api/books/my-purchases/[purchaseId]/download', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 401 when signed out', async () => {
    mockGetServerSession.mockResolvedValue(null)
    const response = await POST(request(), { params: { purchaseId: 'p1' } })
    expect(response.status).toBe(401)
    expect(mockCreateGrant).not.toHaveBeenCalled()
  })

  it('returns 404 when the purchase does not exist', async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } })
    mockFindUnique.mockResolvedValue(null)
    const response = await POST(request(), { params: { purchaseId: 'p1' } })
    expect(response.status).toBe(404)
  })

  it('returns 404 when the purchase belongs to someone else (no ownership leak)', async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } })
    mockFindUnique.mockResolvedValue({ id: 'p1', userId: 'someone-else' })
    const response = await POST(request(), { params: { purchaseId: 'p1' } })
    expect(response.status).toBe(404)
    expect(mockCreateGrant).not.toHaveBeenCalled()
  })

  it('mints a fresh grant for the actual owner', async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } })
    mockFindUnique.mockResolvedValue({ id: 'p1', userId: 'user-1' })
    mockCreateGrant.mockResolvedValue({ rawToken: 'fresh-token', expiresAt: new Date() })

    const response = await POST(request(), { params: { purchaseId: 'p1' } })
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload.downloadUrl).toBe('https://salimcyrus.com/api/books/download/fresh-token')
    expect(mockCreateGrant).toHaveBeenCalledWith('p1')
  })
})
