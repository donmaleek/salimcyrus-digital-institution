/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

jest.mock('../../../../lib/api/paystack', () => ({
  verifyPaystackSignature: jest.fn(() => true),
  matchOfferByAmount: jest.fn(() => null),
}))
jest.mock('../../../../services/payments/book-purchases', () => ({
  slugFromBookOfferName: jest.requireActual('../../../../services/payments/book-purchases').slugFromBookOfferName,
  recordBookPurchase: jest.fn(),
  createDownloadGrant: jest.fn(),
  downloadUrlFor: jest.fn(() => 'https://salimcyrus.com/download/token'),
}))
jest.mock('../../../../services/payments/teaching-purchases', () => ({
  slugFromTeachingOfferName: jest.requireActual('../../../../services/payments/teaching-purchases')
    .slugFromTeachingOfferName,
  recordTeachingPurchase: jest.fn(),
}))
jest.mock('../../../../lib/api/email', () => ({
  sendEmail: jest.fn().mockResolvedValue({ sent: true }),
  bookDownloadEmailHtml: jest.fn(() => '<html></html>'),
}))
jest.mock('../../../../lib/db', () => ({
  db: {
    teaching: { findUnique: jest.fn() },
    bookPurchase: { update: jest.fn() },
    user: { findFirst: jest.fn() },
    $transaction: jest.fn(),
  },
}))

import { POST } from './route'
import { recordBookPurchase, createDownloadGrant } from '@/services/payments/book-purchases'
import { recordTeachingPurchase } from '@/services/payments/teaching-purchases'
import { db } from '@/lib/db'

const mockRecordBookPurchase = recordBookPurchase as jest.Mock
const mockCreateDownloadGrant = createDownloadGrant as jest.Mock
const mockRecordTeachingPurchase = recordTeachingPurchase as jest.Mock
const mockTeachingFindUnique = db.teaching.findUnique as jest.Mock

function webhookRequest(body: unknown) {
  return new NextRequest('https://salimcyrus.com/api/payments/webhook', {
    method: 'POST',
    headers: { 'x-paystack-signature': 'valid-signature' },
    body: JSON.stringify(body),
  })
}

function chargeSuccessEvent(overrides: Record<string, unknown> = {}) {
  return {
    event: 'charge.success',
    data: {
      reference: 'ref-1',
      amount: 80000,
      customer: { email: 'buyer@example.com', first_name: 'Buyer', last_name: 'Person' },
      metadata: null,
      ...overrides,
    },
  }
}

describe('POST /api/payments/webhook', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('ignores non charge.success events', async () => {
    const response = await POST(webhookRequest({ event: 'charge.failed', data: chargeSuccessEvent().data }))
    const payload = await response.json()
    expect(response.status).toBe(200)
    expect(payload).toEqual({ status: 'ignored' })
    expect(mockRecordBookPurchase).not.toHaveBeenCalled()
    expect(mockRecordTeachingPurchase).not.toHaveBeenCalled()
  })

  it('routes a book: offer to the book purchase handler', async () => {
    mockRecordBookPurchase.mockResolvedValue({ purchaseId: 'p1', isNew: true, book: { title: 'A Book' } })
    mockCreateDownloadGrant.mockResolvedValue({ rawToken: 'tok', expiresAt: new Date() })

    const response = await POST(
      webhookRequest(chargeSuccessEvent({ metadata: { offer_name: 'book:some-book' } }))
    )

    expect(response.status).toBe(200)
    expect(mockRecordBookPurchase).toHaveBeenCalledWith(
      expect.objectContaining({ slug: 'some-book', reference: 'ref-1', provider: 'paystack', currency: 'KES' })
    )
    expect(mockRecordTeachingPurchase).not.toHaveBeenCalled()
  })

  it('routes a teaching: offer to the teaching purchase handler using the user_id metadata', async () => {
    mockTeachingFindUnique.mockResolvedValue({ id: 'teaching-1', slug: 'leading-a-family' })
    mockRecordTeachingPurchase.mockResolvedValue({ purchaseId: 'p1', isNew: true })

    const response = await POST(
      webhookRequest(
        chargeSuccessEvent({
          metadata: { offer_name: 'teaching:leading-a-family', teaching_id: 'teaching-1', user_id: 'user-1' },
        })
      )
    )
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload).toEqual({ status: 'ok' })
    expect(mockRecordTeachingPurchase).toHaveBeenCalledWith(
      expect.objectContaining({
        teachingId: 'teaching-1',
        reference: 'ref-1',
        provider: 'paystack',
        currency: 'KES',
        userId: 'user-1',
        email: 'buyer@example.com',
      })
    )
    expect(mockRecordBookPurchase).not.toHaveBeenCalled()
  })

  it('does not record a teaching purchase when user_id metadata is missing (no account to attribute it to)', async () => {
    mockTeachingFindUnique.mockResolvedValue({ id: 'teaching-1', slug: 'leading-a-family' })

    const response = await POST(
      webhookRequest(
        chargeSuccessEvent({
          metadata: { offer_name: 'teaching:leading-a-family', teaching_id: 'teaching-1' },
        })
      )
    )

    expect(response.status).toBe(200)
    expect(mockRecordTeachingPurchase).not.toHaveBeenCalled()
  })

  it('does not record a teaching purchase for an unknown slug', async () => {
    mockTeachingFindUnique.mockResolvedValue(null)

    const response = await POST(
      webhookRequest(
        chargeSuccessEvent({
          metadata: { offer_name: 'teaching:does-not-exist', user_id: 'user-1' },
        })
      )
    )

    expect(response.status).toBe(200)
    expect(mockRecordTeachingPurchase).not.toHaveBeenCalled()
  })

  it('returns 401 when the Paystack signature is invalid', async () => {
    const { verifyPaystackSignature } = jest.requireMock('../../../../lib/api/paystack')
    ;(verifyPaystackSignature as jest.Mock).mockReturnValueOnce(false)

    const response = await POST(webhookRequest(chargeSuccessEvent()))
    expect(response.status).toBe(401)
  })
})
