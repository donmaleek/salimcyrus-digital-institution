jest.mock('../../lib/db', () => ({
  db: {
    teaching: { findUnique: jest.fn() },
    teachingPurchase: { findUnique: jest.fn(), create: jest.fn() },
    crmContact: { findFirst: jest.fn() },
    crmActivity: { create: jest.fn() },
  },
}))

import {
  teachingOfferName,
  slugFromTeachingOfferName,
  recordTeachingPurchase,
} from './teaching-purchases'
import { db } from '@/lib/db'

const mockTeachingFindUnique = db.teaching.findUnique as jest.Mock
const mockPurchaseFindUnique = db.teachingPurchase.findUnique as jest.Mock
const mockPurchaseCreate = db.teachingPurchase.create as jest.Mock
const mockContactFindFirst = db.crmContact.findFirst as jest.Mock
const mockActivityCreate = db.crmActivity.create as jest.Mock

describe('teachingOfferName / slugFromTeachingOfferName', () => {
  it('round-trips a slug through the offer name', () => {
    expect(teachingOfferName('leading-a-family')).toBe('teaching:leading-a-family')
    expect(slugFromTeachingOfferName('teaching:leading-a-family')).toBe('leading-a-family')
  })

  it('returns null for an offer name that is not a teaching', () => {
    expect(slugFromTeachingOfferName('book:some-book')).toBeNull()
    expect(slugFromTeachingOfferName('Support the Mission')).toBeNull()
  })
})

describe('recordTeachingPurchase', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockTeachingFindUnique.mockResolvedValue({ id: 'teaching-1', title: 'Leading a Family' })
    mockPurchaseFindUnique.mockResolvedValue(null)
    mockPurchaseCreate.mockResolvedValue({ id: 'purchase-1' })
    mockContactFindFirst.mockResolvedValue(null)
  })

  it('returns null for an unknown teaching', async () => {
    mockTeachingFindUnique.mockResolvedValue(null)

    const result = await recordTeachingPurchase({
      teachingId: 'missing',
      reference: 'ref-1',
      provider: 'paystack',
      amountKobo: 50000,
      currency: 'KES',
      userId: 'user-1',
      email: 'buyer@example.com',
      name: 'Buyer',
    })

    expect(result).toBeNull()
    expect(mockPurchaseCreate).not.toHaveBeenCalled()
  })

  it('is idempotent on provider + externalReference', async () => {
    mockPurchaseFindUnique.mockResolvedValue({ id: 'existing-purchase' })

    const result = await recordTeachingPurchase({
      teachingId: 'teaching-1',
      reference: 'ref-1',
      provider: 'paystack',
      amountKobo: 50000,
      currency: 'KES',
      userId: 'user-1',
      email: 'buyer@example.com',
      name: 'Buyer',
    })

    expect(result).toEqual({ purchaseId: 'existing-purchase', isNew: false })
    expect(mockPurchaseCreate).not.toHaveBeenCalled()
    expect(mockPurchaseFindUnique).toHaveBeenCalledWith({
      where: { provider_externalReference: { provider: 'paystack', externalReference: 'ref-1' } },
    })
  })

  it('creates a new purchase row tied to the buyer account, with the given currency', async () => {
    const result = await recordTeachingPurchase({
      teachingId: 'teaching-1',
      reference: 'ref-2',
      provider: 'paypal',
      amountKobo: 1500,
      currency: 'USD',
      userId: 'user-1',
      email: 'buyer@example.com',
      name: 'Buyer',
    })

    expect(result).toEqual({ purchaseId: 'purchase-1', isNew: true })
    expect(mockPurchaseCreate).toHaveBeenCalledWith({
      data: {
        teachingId: 'teaching-1',
        userId: 'user-1',
        email: 'buyer@example.com',
        name: 'Buyer',
        provider: 'paypal',
        externalReference: 'ref-2',
        amountKobo: 1500,
        currency: 'USD',
      },
    })
  })

  it('logs a CRM activity when a matching contact exists', async () => {
    mockContactFindFirst.mockResolvedValue({ id: 'contact-1' })

    await recordTeachingPurchase({
      teachingId: 'teaching-1',
      reference: 'ref-3',
      provider: 'paystack',
      amountKobo: 50000,
      currency: 'KES',
      userId: 'user-1',
      email: 'buyer@example.com',
      name: 'Buyer',
    })

    expect(mockActivityCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ contactId: 'contact-1', type: 'payment' }),
      })
    )
  })

  it('does not log a CRM activity when no matching contact exists', async () => {
    await recordTeachingPurchase({
      teachingId: 'teaching-1',
      reference: 'ref-4',
      provider: 'paystack',
      amountKobo: 50000,
      currency: 'KES',
      userId: 'user-1',
      email: 'buyer@example.com',
      name: 'Buyer',
    })

    expect(mockActivityCreate).not.toHaveBeenCalled()
  })
})
