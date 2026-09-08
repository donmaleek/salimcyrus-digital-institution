/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

jest.mock('next-auth', () => ({ getServerSession: jest.fn() }))
jest.mock('../../../../lib/auth', () => ({ authOptions: {} }))
jest.mock('../../../../lib/api/paypal', () => ({
  getPayPalAccessToken: jest.fn(),
  createPayPalOrder: jest.fn(),
}))

import { POST } from './route'
import { getServerSession } from 'next-auth'
import { getPayPalAccessToken, createPayPalOrder } from '@/lib/api/paypal'
import { books } from '@/lib/data/books'

const mockGetServerSession = getServerSession as jest.Mock
const mockGetToken = getPayPalAccessToken as jest.Mock
const mockCreateOrder = createPayPalOrder as jest.Mock

function request(body: unknown) {
  return new NextRequest('https://salimcyrus.com/api/books/checkout-paypal', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

describe('POST /api/books/checkout-paypal', () => {
  const originalId = process.env.PAYPAL_CLIENT_ID
  const originalSecret = process.env.PAYPAL_CLIENT_SECRET

  beforeEach(() => {
    process.env.PAYPAL_CLIENT_ID = 'client-id'
    process.env.PAYPAL_CLIENT_SECRET = 'client-secret'
    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1', email: 'reader@example.com' } })
    mockGetToken.mockResolvedValue('tok_123')
  })

  afterEach(() => {
    process.env.PAYPAL_CLIENT_ID = originalId
    process.env.PAYPAL_CLIENT_SECRET = originalSecret
    jest.clearAllMocks()
  })

  it('returns 503 when PayPal is not configured', async () => {
    delete process.env.PAYPAL_CLIENT_ID
    const response = await POST(request({ slug: 'the-cost-of-infidelity' }))
    expect(response.status).toBe(503)
  })

  it('returns 401 when signed out', async () => {
    mockGetServerSession.mockResolvedValue(null)
    const response = await POST(request({ slug: 'the-cost-of-infidelity' }))
    expect(response.status).toBe(401)
    expect(mockCreateOrder).not.toHaveBeenCalled()
  })

  it('returns 404 for an unknown book', async () => {
    const response = await POST(request({ slug: 'does-not-exist' }))
    expect(response.status).toBe(404)
  })

  it('creates an order priced in USD with a reference tying it to this book and account', async () => {
    mockCreateOrder.mockResolvedValue({ id: 'order-1', approveUrl: 'https://paypal.com/approve/order-1' })
    const book = books.find((b) => b.fileName)!

    const response = await POST(request({ slug: book.slug }))
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload.approvalUrl).toBe('https://paypal.com/approve/order-1')
    expect(mockCreateOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        amountUsd: book.priceUsd,
        referenceId: `book:${book.slug}:user-1`,
      })
    )
  })

  it('returns 502 when PayPal order creation fails', async () => {
    mockCreateOrder.mockRejectedValue(new Error('PayPal down'))
    const book = books.find((b) => b.fileName)!
    const response = await POST(request({ slug: book.slug }))
    expect(response.status).toBe(502)
  })
})
