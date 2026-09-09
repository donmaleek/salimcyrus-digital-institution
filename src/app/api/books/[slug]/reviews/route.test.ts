/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

jest.mock('../../../../../lib/db', () => ({
  db: {
    bookPurchase: { findFirst: jest.fn() },
    bookReview: { create: jest.fn() },
    book: { findUnique: jest.fn() },
  },
}))

import { POST } from './route'
import { db } from '@/lib/db'
import { books } from '@/lib/data/books'

const mockFindFirst = db.bookPurchase.findFirst as jest.Mock
const mockCreate = db.bookReview.create as jest.Mock

const realBook = books[0]

function request(body: unknown) {
  return new NextRequest(`https://salimcyrus.com/api/books/${realBook.slug}/reviews`, {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

describe('POST /api/books/[slug]/reviews', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns 404 for an unknown book', async () => {
    const response = await POST(
      new NextRequest('https://salimcyrus.com/api/books/does-not-exist/reviews', {
        method: 'POST',
        body: JSON.stringify({}),
      }),
      { params: { slug: 'does-not-exist' } }
    )
    expect(response.status).toBe(404)
  })

  it('returns 400 for an invalid submission', async () => {
    const response = await POST(request({ email: 'not-an-email' }), { params: { slug: realBook.slug } })
    expect(response.status).toBe(400)
  })

  it('returns 403 when the email never purchased this book', async () => {
    mockFindFirst.mockResolvedValue(null)
    const response = await POST(
      request({ email: 'nobody@example.com', reviewerName: 'Jane', rating: 5, body: 'Great book, really.' }),
      { params: { slug: realBook.slug } }
    )
    expect(response.status).toBe(403)
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('returns 409 when a review already exists for this purchase', async () => {
    mockFindFirst.mockResolvedValue({ id: 'purchase-1', review: { id: 'review-1' } })
    const response = await POST(
      request({ email: 'buyer@example.com', reviewerName: 'Jane', rating: 5, body: 'Great book, really.' }),
      { params: { slug: realBook.slug } }
    )
    expect(response.status).toBe(409)
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('creates a pending review for a verified purchase', async () => {
    mockFindFirst.mockResolvedValue({ id: 'purchase-1', review: null })
    mockCreate.mockResolvedValue({ id: 'review-1' })

    const response = await POST(
      request({
        email: 'Buyer@Example.com',
        reviewerName: 'Jane',
        rating: 5,
        title: 'Loved it',
        body: 'Great book, really changed how I think.',
      }),
      { params: { slug: realBook.slug } }
    )
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload.status).toBe('pending')
    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        bookSlug: realBook.slug,
        purchaseId: 'purchase-1',
        reviewerName: 'Jane',
        rating: 5,
        title: 'Loved it',
      }),
    })
  })

  it('rejects a rating outside 1-5', async () => {
    const response = await POST(
      request({ email: 'buyer@example.com', reviewerName: 'Jane', rating: 6, body: 'Great book, really.' }),
      { params: { slug: realBook.slug } }
    )
    expect(response.status).toBe(400)
  })
})
