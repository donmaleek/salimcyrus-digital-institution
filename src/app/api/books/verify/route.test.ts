/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

jest.mock('../../../../lib/api/paystack', () => ({
  verifyPaystackTransaction: jest.fn(),
}))
jest.mock('../../../../services/payments/book-purchases', () => {
  const actual = jest.requireActual('../../../../services/payments/book-purchases')
  return {
    ...actual,
    recordBookPurchase: jest.fn(),
    createDownloadGrant: jest.fn(),
  }
})

import { GET } from './route'
import { verifyPaystackTransaction } from '@/lib/api/paystack'
import { recordBookPurchase, createDownloadGrant, bookOfferName } from '@/services/payments/book-purchases'
import { books } from '@/lib/data/books'

const mockVerify = verifyPaystackTransaction as jest.Mock
const mockRecord = recordBookPurchase as jest.Mock
const mockGrant = createDownloadGrant as jest.Mock

const readyBook = books.find((b) => b.status === 'available' && b.fileName)!

function request(query: string) {
  return new NextRequest(`https://salimcyrus.com/api/books/verify?${query}`)
}

describe('GET /api/books/verify', () => {
  const originalKey = process.env.PAYSTACK_SECRET_KEY

  afterEach(() => {
    process.env.PAYSTACK_SECRET_KEY = originalKey
    jest.clearAllMocks()
  })

  it('returns 503 when Paystack is not configured', async () => {
    delete process.env.PAYSTACK_SECRET_KEY
    const response = await GET(request(`reference=r1&slug=${readyBook.slug}`))
    expect(response.status).toBe(503)
  })

  it('returns 400 when reference or slug is missing', async () => {
    process.env.PAYSTACK_SECRET_KEY = 'sk_test'
    expect((await GET(request(`slug=${readyBook.slug}`))).status).toBe(400)
    expect((await GET(request('reference=r1'))).status).toBe(400)
  })

  it('returns 404 for an unknown slug', async () => {
    process.env.PAYSTACK_SECRET_KEY = 'sk_test'
    const response = await GET(request('reference=r1&slug=does-not-exist'))
    expect(response.status).toBe(404)
  })

  it('returns 402 when Paystack says the payment did not succeed', async () => {
    process.env.PAYSTACK_SECRET_KEY = 'sk_test'
    mockVerify.mockResolvedValue({ status: true, data: { status: 'abandoned' } })
    const response = await GET(request(`reference=r1&slug=${readyBook.slug}`))
    expect(response.status).toBe(402)
  })

  it('returns 403 when the verified payment metadata does not match the requested book (prevents cross-book reference reuse)', async () => {
    process.env.PAYSTACK_SECRET_KEY = 'sk_test'
    mockVerify.mockResolvedValue({
      status: true,
      data: {
        status: 'success',
        reference: 'r1',
        amount: readyBook.priceKes * 100,
        customer: { email: 'reader@example.com' },
        metadata: { offer_name: 'book:some-other-book' },
      },
    })
    const response = await GET(request(`reference=r1&slug=${readyBook.slug}`))
    expect(response.status).toBe(403)
    expect(mockRecord).not.toHaveBeenCalled()
  })

  it('records the purchase and returns a working download link on a verified match', async () => {
    process.env.PAYSTACK_SECRET_KEY = 'sk_test'
    mockVerify.mockResolvedValue({
      status: true,
      data: {
        status: 'success',
        reference: 'r1',
        amount: readyBook.priceKes * 100,
        customer: { email: 'reader@example.com' },
        metadata: { offer_name: bookOfferName(readyBook.slug) },
      },
    })
    mockRecord.mockResolvedValue({ purchaseId: 'p1', book: readyBook, isNew: true })
    mockGrant.mockResolvedValue({ rawToken: 'raw-token-123', expiresAt: new Date() })

    const response = await GET(request(`reference=r1&slug=${readyBook.slug}`))
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload.downloadUrl).toContain('/api/books/download/raw-token-123')
    expect(payload.bookTitle).toBe(readyBook.title)
    expect(mockRecord).toHaveBeenCalledWith(
      expect.objectContaining({ slug: readyBook.slug, reference: 'r1', email: 'reader@example.com' })
    )
  })

  it('is idempotent: calling verify twice for the same reference still returns a link, not a duplicate-purchase error', async () => {
    process.env.PAYSTACK_SECRET_KEY = 'sk_test'
    mockVerify.mockResolvedValue({
      status: true,
      data: {
        status: 'success',
        reference: 'r1',
        amount: readyBook.priceKes * 100,
        customer: { email: 'reader@example.com' },
        metadata: { offer_name: bookOfferName(readyBook.slug) },
      },
    })
    mockRecord.mockResolvedValue({ purchaseId: 'p1', book: readyBook, isNew: false })
    mockGrant.mockResolvedValue({ rawToken: 'second-token', expiresAt: new Date() })

    const response = await GET(request(`reference=r1&slug=${readyBook.slug}`))
    expect(response.status).toBe(200)
  })
})
