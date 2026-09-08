/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

jest.mock('next-auth', () => ({ getServerSession: jest.fn() }))
jest.mock('../../../../lib/auth', () => ({ authOptions: {} }))
jest.mock('../../../../lib/api/paypal', () => ({
  getPayPalAccessToken: jest.fn(),
  capturePayPalOrder: jest.fn(),
}))
jest.mock('../../../../services/payments/coaching-bookings', () => ({
  recordCoachingPayment: jest.fn(),
}))

import { GET } from './route'
import { getServerSession } from 'next-auth'
import { getPayPalAccessToken, capturePayPalOrder } from '@/lib/api/paypal'
import { recordCoachingPayment } from '@/services/payments/coaching-bookings'
import { coachingOffers } from '@/lib/data/coaching-offers'

const mockGetServerSession = getServerSession as jest.Mock
const mockGetToken = getPayPalAccessToken as jest.Mock
const mockCapture = capturePayPalOrder as jest.Mock
const mockRecord = recordCoachingPayment as jest.Mock

const offer = coachingOffers[0]
const validReferenceId = `coaching:${offer.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`

function request(query: string) {
  return new NextRequest(`https://salimcyrus.com/api/coaching/verify-paypal?${query}`)
}

describe('GET /api/coaching/verify-paypal', () => {
  const originalId = process.env.PAYPAL_CLIENT_ID
  const originalSecret = process.env.PAYPAL_CLIENT_SECRET

  beforeEach(() => {
    process.env.PAYPAL_CLIENT_ID = 'client-id'
    process.env.PAYPAL_CLIENT_SECRET = 'client-secret'
    mockGetServerSession.mockResolvedValue(null)
    mockGetToken.mockResolvedValue('tok_123')
    jest.clearAllMocks()
    mockGetServerSession.mockResolvedValue(null)
  })

  afterEach(() => {
    process.env.PAYPAL_CLIENT_ID = originalId
    process.env.PAYPAL_CLIENT_SECRET = originalSecret
  })

  it('returns 400 when token or offerName is missing', async () => {
    const response = await GET(request('token=order-1'))
    expect(response.status).toBe(400)
  })

  it('returns 404 for an unknown offer', async () => {
    const response = await GET(request('token=order-1&offerName=Private%20Coaching'))
    expect(response.status).toBe(404)
  })

  it('returns 402 when the capture is not COMPLETED', async () => {
    mockCapture.mockResolvedValue({ status: 'PENDING' })
    const response = await GET(request(`token=order-1&offerName=${encodeURIComponent(offer.name)}`))
    expect(response.status).toBe(402)
    expect(mockRecord).not.toHaveBeenCalled()
  })

  it('returns 403 when the reference does not match this exact session type (tamper guard)', async () => {
    mockCapture.mockResolvedValue({
      status: 'COMPLETED',
      captureId: 'cap-1',
      amountValue: String(offer.priceUsd),
      payerEmail: 'buyer@example.com',
      payerName: 'Buyer',
      referenceId: 'coaching:some-other-offer',
    })
    const response = await GET(request(`token=order-1&offerName=${encodeURIComponent(offer.name)}`))
    expect(response.status).toBe(403)
    expect(mockRecord).not.toHaveBeenCalled()
  })

  it('records the coaching payment using PayPal payer identity (no session exists for coaching)', async () => {
    mockCapture.mockResolvedValue({
      status: 'COMPLETED',
      captureId: 'cap-1',
      amountValue: String(offer.priceUsd),
      payerEmail: 'buyer@example.com',
      payerName: 'Buyer',
      referenceId: validReferenceId,
    })
    mockRecord.mockResolvedValue({ isNew: true })

    const response = await GET(request(`token=order-1&offerName=${encodeURIComponent(offer.name)}`))
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload).toEqual({
      status: 'confirmed',
      offerName: offer.name,
      email: 'buyer@example.com',
      name: 'Buyer',
      paymentReference: 'cap-1',
    })
    expect(mockRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        offerName: offer.name,
        reference: 'cap-1',
        provider: 'paypal',
        currency: 'USD',
        email: 'buyer@example.com',
        name: 'Buyer',
      })
    )
  })

  it('links a signed-in userId when a session happens to exist', async () => {
    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1' } })
    mockCapture.mockResolvedValue({
      status: 'COMPLETED',
      captureId: 'cap-2',
      amountValue: String(offer.priceUsd),
      payerEmail: 'buyer@example.com',
      payerName: 'Buyer',
      referenceId: validReferenceId,
    })
    mockRecord.mockResolvedValue({ isNew: true })

    await GET(request(`token=order-1&offerName=${encodeURIComponent(offer.name)}`))

    expect(mockRecord).toHaveBeenCalledWith(expect.objectContaining({ userId: 'user-1' }))
  })
})
