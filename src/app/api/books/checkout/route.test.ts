/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

jest.mock('../../../../services/payments/paystack', () => ({
  bookCheckoutRequestSchema: jest.requireActual('../../../../services/payments/paystack')
    .bookCheckoutRequestSchema,
  initializePaystackBookCheckout: jest.fn(),
}))
jest.mock('../../../../lib/data/books', () => {
  const actual = jest.requireActual('../../../../lib/data/books')
  return {
    ...actual,
    books: [
      ...actual.books,
      {
        slug: 'not-yet-confirmed',
        title: 'Not Yet Confirmed',
        description: 'A book whose file has not been confirmed yet.',
        priceKes: 650,
        pageCount: 80,
        status: 'available',
        purchaseUrl: 'https://wa.me/000',
        cover: '/images/books/not-yet-confirmed.webp',
        // fileName deliberately absent.
      },
    ],
  }
})

import { POST } from './route'
import { initializePaystackBookCheckout } from '@/services/payments/paystack'
import { books } from '@/lib/data/books'

const mockInitialize = initializePaystackBookCheckout as jest.Mock

function request(body: unknown) {
  return new NextRequest('https://salimcyrus.com/api/books/checkout', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

describe('POST /api/books/checkout', () => {
  const originalKey = process.env.PAYSTACK_SECRET_KEY

  afterEach(() => {
    process.env.PAYSTACK_SECRET_KEY = originalKey
    jest.clearAllMocks()
  })

  it('returns 503 when Paystack is not configured', async () => {
    delete process.env.PAYSTACK_SECRET_KEY
    const response = await POST(request({ email: 'reader@example.com', slug: 'the-cost-of-infidelity' }))
    expect(response.status).toBe(503)
  })

  it('returns 400 for an invalid email', async () => {
    process.env.PAYSTACK_SECRET_KEY = 'sk_test'
    const response = await POST(request({ email: 'not-an-email', slug: 'the-cost-of-infidelity' }))
    expect(response.status).toBe(400)
  })

  it('returns 404 for an unknown book slug', async () => {
    process.env.PAYSTACK_SECRET_KEY = 'sk_test'
    const response = await POST(request({ email: 'reader@example.com', slug: 'does-not-exist' }))
    expect(response.status).toBe(404)
  })

  it('returns 409 for a book without an assigned file (instant download not ready)', async () => {
    process.env.PAYSTACK_SECRET_KEY = 'sk_test'
    const response = await POST(request({ email: 'reader@example.com', slug: 'not-yet-confirmed' }))
    expect(response.status).toBe(409)
  })

  it('starts checkout for a book with a confirmed file', async () => {
    process.env.PAYSTACK_SECRET_KEY = 'sk_test'
    const readyBook = books.find((b) => b.status === 'available' && b.fileName)!
    mockInitialize.mockResolvedValue({
      authorizationUrl: 'https://checkout.paystack.com/x',
      reference: 'ref_1',
    })

    const response = await POST(request({ email: 'reader@example.com', slug: readyBook.slug }))
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload.authorizationUrl).toBe('https://checkout.paystack.com/x')
    expect(mockInitialize).toHaveBeenCalledWith(
      expect.objectContaining({ slug: readyBook.slug, priceKes: readyBook.priceKes })
    )
  })

  it('returns 502 when Paystack initialization fails', async () => {
    process.env.PAYSTACK_SECRET_KEY = 'sk_test'
    const readyBook = books.find((b) => b.status === 'available' && b.fileName)!
    mockInitialize.mockRejectedValue(new Error('Paystack down'))

    const response = await POST(request({ email: 'reader@example.com', slug: readyBook.slug }))
    expect(response.status).toBe(502)
  })
})
