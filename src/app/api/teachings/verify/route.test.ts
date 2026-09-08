/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

jest.mock('next-auth', () => ({ getServerSession: jest.fn() }))
jest.mock('../../../../lib/auth', () => ({ authOptions: {} }))
jest.mock('../../../../lib/api/paystack', () => ({ verifyPaystackTransaction: jest.fn() }))
jest.mock('../../../../lib/db', () => ({
  db: { teaching: { findUnique: jest.fn() } },
}))
jest.mock('../../../../services/payments/teaching-purchases', () => ({
  teachingOfferName: jest.requireActual('../../../../services/payments/teaching-purchases').teachingOfferName,
  recordTeachingPurchase: jest.fn(),
}))

import { GET } from './route'
import { getServerSession } from 'next-auth'
import { verifyPaystackTransaction } from '@/lib/api/paystack'
import { db } from '@/lib/db'
import { recordTeachingPurchase } from '@/services/payments/teaching-purchases'

const mockGetServerSession = getServerSession as jest.Mock
const mockVerify = verifyPaystackTransaction as jest.Mock
const mockFindUnique = db.teaching.findUnique as jest.Mock
const mockRecord = recordTeachingPurchase as jest.Mock

function request(params: Record<string, string>) {
  const url = new URL('https://salimcyrus.com/api/teachings/verify')
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value)
  return new NextRequest(url)
}

describe('GET /api/teachings/verify', () => {
  const originalKey = process.env.PAYSTACK_SECRET_KEY

  beforeEach(() => {
    jest.clearAllMocks()
    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1', email: 'reader@example.com' } })
    mockFindUnique.mockResolvedValue({ id: 'teaching-1', slug: 'leading-a-family', title: 'Leading a Family' })
    mockRecord.mockResolvedValue({ purchaseId: 'purchase-1', isNew: true })
  })

  afterEach(() => {
    process.env.PAYSTACK_SECRET_KEY = originalKey
  })

  it('returns 503 when Paystack is not configured', async () => {
    delete process.env.PAYSTACK_SECRET_KEY
    const response = await GET(request({ reference: 'ref-1', teachingId: 'teaching-1' }))
    expect(response.status).toBe(503)
  })

  it('returns 401 when not signed in', async () => {
    process.env.PAYSTACK_SECRET_KEY = 'sk_test'
    mockGetServerSession.mockResolvedValue(null)
    const response = await GET(request({ reference: 'ref-1', teachingId: 'teaching-1' }))
    expect(response.status).toBe(401)
  })

  it('returns 400 when reference or teachingId is missing', async () => {
    process.env.PAYSTACK_SECRET_KEY = 'sk_test'
    const response = await GET(request({ reference: 'ref-1' }))
    expect(response.status).toBe(400)
  })

  it('returns 404 for an unknown teaching', async () => {
    process.env.PAYSTACK_SECRET_KEY = 'sk_test'
    mockFindUnique.mockResolvedValue(null)
    const response = await GET(request({ reference: 'ref-1', teachingId: 'missing' }))
    expect(response.status).toBe(404)
  })

  it('returns 402 when the payment did not succeed', async () => {
    process.env.PAYSTACK_SECRET_KEY = 'sk_test'
    mockVerify.mockResolvedValue({ status: true, data: { status: 'failed' } })
    const response = await GET(request({ reference: 'ref-1', teachingId: 'teaching-1' }))
    expect(response.status).toBe(402)
  })

  it('returns 403 when the offer name does not match this teaching', async () => {
    process.env.PAYSTACK_SECRET_KEY = 'sk_test'
    mockVerify.mockResolvedValue({
      status: true,
      data: { status: 'success', amount: 80000, metadata: { offer_name: 'teaching:some-other-slug', user_id: 'user-1' } },
    })
    const response = await GET(request({ reference: 'ref-1', teachingId: 'teaching-1' }))
    expect(response.status).toBe(403)
    expect(mockRecord).not.toHaveBeenCalled()
  })

  it('returns 403 when the payment metadata user_id does not match the signed-in account (reference reuse guard)', async () => {
    process.env.PAYSTACK_SECRET_KEY = 'sk_test'
    mockVerify.mockResolvedValue({
      status: true,
      data: {
        status: 'success',
        amount: 80000,
        metadata: { offer_name: 'teaching:leading-a-family', user_id: 'a-different-user' },
      },
    })
    const response = await GET(request({ reference: 'ref-1', teachingId: 'teaching-1' }))
    expect(response.status).toBe(403)
    expect(mockRecord).not.toHaveBeenCalled()
  })

  it('records the purchase under the session identity on a matching, successful payment', async () => {
    process.env.PAYSTACK_SECRET_KEY = 'sk_test'
    mockVerify.mockResolvedValue({
      status: true,
      data: {
        status: 'success',
        amount: 80000,
        metadata: { offer_name: 'teaching:leading-a-family', user_id: 'user-1' },
      },
    })

    const response = await GET(request({ reference: 'ref-1', teachingId: 'teaching-1' }))
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload).toEqual({ status: 'confirmed', teachingTitle: 'Leading a Family' })
    expect(mockRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        teachingId: 'teaching-1',
        reference: 'ref-1',
        provider: 'paystack',
        currency: 'KES',
        userId: 'user-1',
        email: 'reader@example.com',
      })
    )
  })
})
