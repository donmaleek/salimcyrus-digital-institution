/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

jest.mock('next-auth', () => ({ getServerSession: jest.fn() }))
jest.mock('../../../../lib/auth', () => ({ authOptions: {} }))
jest.mock('../../../../services/payments/paystack', () => ({
  teachingCheckoutRequestSchema: jest.requireActual('../../../../services/payments/paystack')
    .teachingCheckoutRequestSchema,
  initializePaystackTeachingCheckout: jest.fn(),
}))
jest.mock('../../../../lib/db', () => ({
  db: { teaching: { findUnique: jest.fn() } },
}))

import { POST } from './route'
import { getServerSession } from 'next-auth'
import { initializePaystackTeachingCheckout } from '@/services/payments/paystack'
import { db } from '@/lib/db'

const mockInitialize = initializePaystackTeachingCheckout as jest.Mock
const mockGetServerSession = getServerSession as jest.Mock
const mockFindUnique = db.teaching.findUnique as jest.Mock

function request(body: unknown) {
  return new NextRequest('https://salimcyrus.com/api/teachings/checkout', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

describe('POST /api/teachings/checkout', () => {
  const originalKey = process.env.PAYSTACK_SECRET_KEY

  beforeEach(() => {
    jest.clearAllMocks()
    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1', email: 'reader@example.com' } })
    mockFindUnique.mockResolvedValue({
      id: 'teaching-1',
      slug: 'leading-a-family',
      title: 'Leading a Family',
      priceKes: 800,
      status: 'published',
    })
  })

  afterEach(() => {
    process.env.PAYSTACK_SECRET_KEY = originalKey
  })

  it('returns 503 when Paystack is not configured', async () => {
    delete process.env.PAYSTACK_SECRET_KEY
    const response = await POST(request({ email: 'reader@example.com', teachingId: 'teaching-1' }))
    expect(response.status).toBe(503)
  })

  it('returns 401 when the buyer is not signed in', async () => {
    process.env.PAYSTACK_SECRET_KEY = 'sk_test'
    mockGetServerSession.mockResolvedValue(null)
    const response = await POST(request({ email: 'reader@example.com', teachingId: 'teaching-1' }))
    expect(response.status).toBe(401)
    expect(mockInitialize).not.toHaveBeenCalled()
  })

  it('returns 400 for an invalid request body', async () => {
    process.env.PAYSTACK_SECRET_KEY = 'sk_test'
    const response = await POST(request({ email: 'reader@example.com' }))
    expect(response.status).toBe(400)
  })

  it('returns 404 for an unknown teaching', async () => {
    process.env.PAYSTACK_SECRET_KEY = 'sk_test'
    mockFindUnique.mockResolvedValue(null)
    const response = await POST(request({ email: 'reader@example.com', teachingId: 'does-not-exist' }))
    expect(response.status).toBe(404)
  })

  it('returns 404 for a draft (unpublished) teaching', async () => {
    process.env.PAYSTACK_SECRET_KEY = 'sk_test'
    mockFindUnique.mockResolvedValue({
      id: 'teaching-1',
      slug: 'leading-a-family',
      title: 'Leading a Family',
      priceKes: 800,
      status: 'draft',
    })
    const response = await POST(request({ email: 'reader@example.com', teachingId: 'teaching-1' }))
    expect(response.status).toBe(404)
    expect(mockInitialize).not.toHaveBeenCalled()
  })

  it('starts checkout using the session identity, tagging the order with userId for the webhook', async () => {
    process.env.PAYSTACK_SECRET_KEY = 'sk_test'
    mockInitialize.mockResolvedValue({
      authorizationUrl: 'https://checkout.paystack.com/x',
      reference: 'ref_1',
    })

    const response = await POST(request({ email: 'reader@example.com', teachingId: 'teaching-1' }))
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload.authorizationUrl).toBe('https://checkout.paystack.com/x')
    expect(mockInitialize).toHaveBeenCalledWith(
      expect.objectContaining({
        teachingId: 'teaching-1',
        userId: 'user-1',
        email: 'reader@example.com',
        slug: 'leading-a-family',
        priceKes: 800,
      })
    )
  })

  it('returns 502 when Paystack initialization fails', async () => {
    process.env.PAYSTACK_SECRET_KEY = 'sk_test'
    mockInitialize.mockRejectedValue(new Error('Paystack down'))
    const response = await POST(request({ email: 'reader@example.com', teachingId: 'teaching-1' }))
    expect(response.status).toBe(502)
  })
})
