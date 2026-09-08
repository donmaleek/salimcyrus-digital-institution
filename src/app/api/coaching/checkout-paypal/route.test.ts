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
import { coachingOffers } from '@/lib/data/coaching-offers'

const mockGetToken = getPayPalAccessToken as jest.Mock
const mockCreateOrder = createPayPalOrder as jest.Mock

function request(body: unknown) {
  return new NextRequest('https://salimcyrus.com/api/coaching/checkout-paypal', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

describe('POST /api/coaching/checkout-paypal', () => {
  const originalId = process.env.PAYPAL_CLIENT_ID
  const originalSecret = process.env.PAYPAL_CLIENT_SECRET

  beforeEach(() => {
    process.env.PAYPAL_CLIENT_ID = 'client-id'
    process.env.PAYPAL_CLIENT_SECRET = 'client-secret'
    mockGetToken.mockResolvedValue('tok_123')
    jest.clearAllMocks()
  })

  afterEach(() => {
    process.env.PAYPAL_CLIENT_ID = originalId
    process.env.PAYPAL_CLIENT_SECRET = originalSecret
  })

  it('returns 503 when PayPal is not configured', async () => {
    delete process.env.PAYPAL_CLIENT_ID
    const response = await POST(request({ offerName: 'Starter Session' }))
    expect(response.status).toBe(503)
  })

  it('returns 404 for an unknown offer (e.g. the removed Private Coaching)', async () => {
    const response = await POST(request({ offerName: 'Private Coaching' }))
    expect(response.status).toBe(404)
    expect(mockCreateOrder).not.toHaveBeenCalled()
  })

  it('creates an order priced in USD at the real offer price, with a tamper-checkable reference', async () => {
    mockCreateOrder.mockResolvedValue({ id: 'order-1', approveUrl: 'https://paypal.com/approve/order-1' })
    const offer = coachingOffers[0]

    const response = await POST(request({ offerName: offer.name }))
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload.approvalUrl).toBe('https://paypal.com/approve/order-1')
    expect(mockCreateOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        amountUsd: offer.priceUsd,
        referenceId: expect.stringContaining('coaching:'),
      })
    )
  })

  it('returns 502 when PayPal order creation fails', async () => {
    mockCreateOrder.mockRejectedValue(new Error('PayPal down'))
    const response = await POST(request({ offerName: coachingOffers[0].name }))
    expect(response.status).toBe(502)
  })
})
