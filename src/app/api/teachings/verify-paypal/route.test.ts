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
jest.mock('../../../../lib/db', () => ({
  db: { teaching: { findUnique: jest.fn() } },
}))
jest.mock('../../../../services/payments/teaching-purchases', () => ({
  recordTeachingPurchase: jest.fn(),
}))

import { GET } from './route'
import { getServerSession } from 'next-auth'
import { getPayPalAccessToken, capturePayPalOrder } from '@/lib/api/paypal'
import { db } from '@/lib/db'
import { recordTeachingPurchase } from '@/services/payments/teaching-purchases'

const mockGetServerSession = getServerSession as jest.Mock
const mockGetToken = getPayPalAccessToken as jest.Mock
const mockCapture = capturePayPalOrder as jest.Mock
const mockFindUnique = db.teaching.findUnique as jest.Mock
const mockRecord = recordTeachingPurchase as jest.Mock

function request(query: string) {
  return new NextRequest(`https://salimcyrus.com/api/teachings/verify-paypal?${query}`)
}

describe('GET /api/teachings/verify-paypal', () => {
  const originalId = process.env.PAYPAL_CLIENT_ID
  const originalSecret = process.env.PAYPAL_CLIENT_SECRET

  beforeEach(() => {
    process.env.PAYPAL_CLIENT_ID = 'client-id'
    process.env.PAYPAL_CLIENT_SECRET = 'client-secret'
    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1', email: 'reader@example.com', name: 'Reader' } })
    mockGetToken.mockResolvedValue('tok_123')
    mockFindUnique.mockResolvedValue({ id: 'teaching-1', slug: 'leading-a-family', title: 'Leading a Family' })
  })

  afterEach(() => {
    process.env.PAYPAL_CLIENT_ID = originalId
    process.env.PAYPAL_CLIENT_SECRET = originalSecret
    jest.clearAllMocks()
  })

  it('returns 401 when signed out', async () => {
    mockGetServerSession.mockResolvedValue(null)
    const response = await GET(request('token=order-1&teachingId=teaching-1'))
    expect(response.status).toBe(401)
  })

  it('returns 400 when token or teachingId is missing', async () => {
    const response = await GET(request('token=order-1'))
    expect(response.status).toBe(400)
  })

  it('returns 404 for an unknown teaching', async () => {
    mockFindUnique.mockResolvedValue(null)
    const response = await GET(request('token=order-1&teachingId=missing'))
    expect(response.status).toBe(404)
  })

  it('returns 402 when the capture is not COMPLETED', async () => {
    mockCapture.mockResolvedValue({ status: 'PENDING' })
    const response = await GET(request('token=order-1&teachingId=teaching-1'))
    expect(response.status).toBe(402)
    expect(mockRecord).not.toHaveBeenCalled()
  })

  it('returns 402 when PayPal capture throws (order not approved)', async () => {
    mockCapture.mockRejectedValue(new Error('ORDER_NOT_APPROVED'))
    const response = await GET(request('token=order-1&teachingId=teaching-1'))
    expect(response.status).toBe(402)
  })

  it('returns 403 when the reference does not match this session and teaching (tamper guard)', async () => {
    mockCapture.mockResolvedValue({
      status: 'COMPLETED',
      captureId: 'cap-1',
      amountValue: '8.00',
      referenceId: 'teaching:teaching-1:someone-else',
    })
    const response = await GET(request('token=order-1&teachingId=teaching-1'))
    expect(response.status).toBe(403)
    expect(mockRecord).not.toHaveBeenCalled()
  })

  it('records the purchase in USD using the session identity, not PayPal payer info', async () => {
    mockCapture.mockResolvedValue({
      status: 'COMPLETED',
      captureId: 'cap-1',
      amountValue: '8.00',
      payerEmail: 'different-paypal-account@example.com',
      payerName: 'Someone Else',
      referenceId: 'teaching:teaching-1:user-1',
    })
    mockRecord.mockResolvedValue({ purchaseId: 'purchase-1', isNew: true })

    const response = await GET(request('token=order-1&teachingId=teaching-1'))
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload).toEqual({ status: 'confirmed', teachingTitle: 'Leading a Family' })
    expect(mockRecord).toHaveBeenCalledWith(
      expect.objectContaining({
        teachingId: 'teaching-1',
        reference: 'cap-1',
        provider: 'paypal',
        amountKobo: 800,
        currency: 'USD',
        userId: 'user-1',
        email: 'reader@example.com',
        name: 'Reader',
      })
    )
  })
})
