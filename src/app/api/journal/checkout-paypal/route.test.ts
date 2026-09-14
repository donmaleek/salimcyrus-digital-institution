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

const mockGetServerSession = getServerSession as jest.Mock
const mockGetToken = getPayPalAccessToken as jest.Mock
const mockCreateOrder = createPayPalOrder as jest.Mock

function request() {
  return new NextRequest('https://salimcyrus.com/api/journal/checkout-paypal', { method: 'POST' })
}

describe('POST /api/journal/checkout-paypal', () => {
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
    const response = await POST(request())
    expect(response.status).toBe(503)
  })

  it('returns 401 when signed out', async () => {
    mockGetServerSession.mockResolvedValue(null)
    const response = await POST(request())
    expect(response.status).toBe(401)
    expect(mockCreateOrder).not.toHaveBeenCalled()
  })

  it('creates a $4 order tied to this account', async () => {
    mockCreateOrder.mockResolvedValue({ id: 'order-1', approveUrl: 'https://paypal.com/approve/order-1' })
    const response = await POST(request())
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload.approvalUrl).toBe('https://paypal.com/approve/order-1')
    expect(mockCreateOrder).toHaveBeenCalledWith(
      expect.objectContaining({ amountUsd: 4, referenceId: 'journal:user-1' })
    )
  })

  it('returns 502 when PayPal order creation fails', async () => {
    mockCreateOrder.mockRejectedValue(new Error('PayPal down'))
    const response = await POST(request())
    expect(response.status).toBe(502)
  })
})
