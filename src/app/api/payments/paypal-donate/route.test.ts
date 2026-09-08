/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

jest.mock('../../../../lib/api/paypal', () => ({
  getPayPalAccessToken: jest.fn(),
  createPayPalOrder: jest.fn(),
}))

import { POST } from './route'
import { getPayPalAccessToken, createPayPalOrder } from '@/lib/api/paypal'

const mockGetToken = getPayPalAccessToken as jest.Mock
const mockCreateOrder = createPayPalOrder as jest.Mock

function request(body: unknown) {
  return new NextRequest('https://salimcyrus.com/api/payments/paypal-donate', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

describe('POST /api/payments/paypal-donate', () => {
  const originalId = process.env.PAYPAL_CLIENT_ID
  const originalSecret = process.env.PAYPAL_CLIENT_SECRET

  beforeEach(() => {
    process.env.PAYPAL_CLIENT_ID = 'client-id'
    process.env.PAYPAL_CLIENT_SECRET = 'client-secret'
    mockGetToken.mockResolvedValue('tok_123')
  })

  afterEach(() => {
    process.env.PAYPAL_CLIENT_ID = originalId
    process.env.PAYPAL_CLIENT_SECRET = originalSecret
    jest.clearAllMocks()
  })

  it('returns 503 when PayPal is not configured', async () => {
    delete process.env.PAYPAL_CLIENT_ID
    const response = await POST(request({ amountUsd: 10 }))
    expect(response.status).toBe(503)
  })

  it('returns 400 for an amount below $1', async () => {
    const response = await POST(request({ amountUsd: 0 }))
    expect(response.status).toBe(400)
  })

  it('creates a donation order with no account required', async () => {
    mockCreateOrder.mockResolvedValue({ id: 'order-1', approveUrl: 'https://paypal.com/approve/order-1' })
    const response = await POST(request({ amountUsd: 25 }))
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload.approvalUrl).toBe('https://paypal.com/approve/order-1')
    expect(mockCreateOrder).toHaveBeenCalledWith(
      expect.objectContaining({ amountUsd: 25, referenceId: 'donation:support-the-mission' })
    )
  })

  it('returns 502 when PayPal order creation fails', async () => {
    mockCreateOrder.mockRejectedValue(new Error('PayPal down'))
    const response = await POST(request({ amountUsd: 25 }))
    expect(response.status).toBe(502)
  })
})
