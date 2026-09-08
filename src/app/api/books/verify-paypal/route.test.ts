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
jest.mock('../../../../services/payments/book-purchases', () => ({
  recordBookPurchase: jest.fn(),
  createDownloadGrant: jest.fn(),
  downloadUrlFor: jest.fn(() => 'https://salimcyrus.com/api/books/download/fresh-token'),
}))

import { GET } from './route'
import { getServerSession } from 'next-auth'
import { getPayPalAccessToken, capturePayPalOrder } from '@/lib/api/paypal'
import { recordBookPurchase, createDownloadGrant } from '@/services/payments/book-purchases'
import { books } from '@/lib/data/books'

const mockGetServerSession = getServerSession as jest.Mock
const mockGetToken = getPayPalAccessToken as jest.Mock
const mockCapture = capturePayPalOrder as jest.Mock
const mockRecordPurchase = recordBookPurchase as jest.Mock
const mockCreateGrant = createDownloadGrant as jest.Mock

const book = books.find((b) => b.fileName)!

function request(query: string) {
  return new NextRequest(`https://salimcyrus.com/api/books/verify-paypal?${query}`)
}

describe('GET /api/books/verify-paypal', () => {
  const originalId = process.env.PAYPAL_CLIENT_ID
  const originalSecret = process.env.PAYPAL_CLIENT_SECRET

  beforeEach(() => {
    process.env.PAYPAL_CLIENT_ID = 'client-id'
    process.env.PAYPAL_CLIENT_SECRET = 'client-secret'
    mockGetServerSession.mockResolvedValue({ user: { id: 'user-1', email: 'reader@example.com', name: 'Reader' } })
    mockGetToken.mockResolvedValue('tok_123')
  })

  afterEach(() => {
    process.env.PAYPAL_CLIENT_ID = originalId
    process.env.PAYPAL_CLIENT_SECRET = originalSecret
    jest.clearAllMocks()
  })

  it('returns 401 when signed out', async () => {
    mockGetServerSession.mockResolvedValue(null)
    const response = await GET(request(`token=order-1&slug=${book.slug}`))
    expect(response.status).toBe(401)
  })

  it('returns 400 when token or slug is missing', async () => {
    const response = await GET(request('token=order-1'))
    expect(response.status).toBe(400)
  })

  it('returns 402 when the capture is not COMPLETED', async () => {
    mockCapture.mockResolvedValue({ status: 'PENDING' })
    const response = await GET(request(`token=order-1&slug=${book.slug}`))
    expect(response.status).toBe(402)
    expect(mockRecordPurchase).not.toHaveBeenCalled()
  })

  it('returns 402 when PayPal capture throws (order not approved)', async () => {
    mockCapture.mockRejectedValue(new Error('ORDER_NOT_APPROVED'))
    const response = await GET(request(`token=order-1&slug=${book.slug}`))
    expect(response.status).toBe(402)
  })

  it('returns 403 when the reference does not match this session and book (tamper guard)', async () => {
    mockCapture.mockResolvedValue({
      status: 'COMPLETED',
      captureId: 'cap-1',
      amountValue: '5.00',
      referenceId: `book:${book.slug}:someone-else`,
    })
    const response = await GET(request(`token=order-1&slug=${book.slug}`))
    expect(response.status).toBe(403)
    expect(mockRecordPurchase).not.toHaveBeenCalled()
  })

  it('records the purchase in USD using the session identity, not PayPal payer info', async () => {
    mockCapture.mockResolvedValue({
      status: 'COMPLETED',
      captureId: 'cap-1',
      amountValue: '5.00',
      currencyCode: 'USD',
      payerEmail: 'different-paypal-account@example.com',
      payerName: 'Someone Else',
      referenceId: `book:${book.slug}:user-1`,
    })
    mockRecordPurchase.mockResolvedValue({ purchaseId: 'purchase-1', book, isNew: true })
    mockCreateGrant.mockResolvedValue({ rawToken: 'fresh-token', expiresAt: new Date() })

    const response = await GET(request(`token=order-1&slug=${book.slug}`))
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload.downloadUrl).toBe('https://salimcyrus.com/api/books/download/fresh-token')
    expect(mockRecordPurchase).toHaveBeenCalledWith(
      expect.objectContaining({
        slug: book.slug,
        reference: 'cap-1',
        provider: 'paypal',
        amountKobo: 500,
        currency: 'USD',
        email: 'reader@example.com',
        name: 'Reader',
      })
    )
  })
})
