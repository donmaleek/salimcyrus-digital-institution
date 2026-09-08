jest.mock('../../lib/db', () => ({
  db: {
    paymentClaim: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
  },
}))
jest.mock('./book-purchases', () => ({ recordBookPurchase: jest.fn() }))
jest.mock('./teaching-purchases', () => ({ recordTeachingPurchase: jest.fn() }))
jest.mock('./donations', () => ({ recordDonation: jest.fn() }))
jest.mock('./coaching-bookings', () => ({ recordCoachingPayment: jest.fn() }))

import { Prisma } from '@prisma/client'
import {
  submitPaymentClaim,
  approvePaymentClaim,
  rejectPaymentClaim,
} from './payment-claims'
import { db } from '@/lib/db'
import { recordBookPurchase } from './book-purchases'
import { recordTeachingPurchase } from './teaching-purchases'
import { recordDonation } from './donations'
import { recordCoachingPayment } from './coaching-bookings'

const mockCreate = db.paymentClaim.create as jest.Mock
const mockFindUnique = db.paymentClaim.findUnique as jest.Mock
const mockUpdate = db.paymentClaim.update as jest.Mock
const mockRecordBook = recordBookPurchase as jest.Mock
const mockRecordTeaching = recordTeachingPurchase as jest.Mock
const mockRecordDonation = recordDonation as jest.Mock
const mockRecordCoachingPayment = recordCoachingPayment as jest.Mock

describe('submitPaymentClaim', () => {
  beforeEach(() => jest.clearAllMocks())

  it('creates a pending claim', async () => {
    mockCreate.mockResolvedValue({ id: 'claim-1' })

    const result = await submitPaymentClaim({
      offerType: 'book',
      bookSlug: 'the-cost-of-infidelity',
      userId: 'user-1',
      email: 'buyer@example.com',
      name: 'Buyer',
      amountKes: 800,
      mpesaCode: 'QGH7XXXXX1',
    })

    expect(result).toEqual({ status: 'created', claimId: 'claim-1' })
    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ mpesaCode: 'QGH7XXXXX1', amountKes: 800, offerType: 'book' }),
    })
  })

  it('rejects a duplicate M-Pesa code instead of creating a second claim', async () => {
    mockCreate.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: '6.19.2',
      })
    )

    const result = await submitPaymentClaim({
      offerType: 'donation',
      email: 'donor@example.com',
      name: 'Donor',
      amountKes: 1000,
      mpesaCode: 'DUPLICATE1',
    })

    expect(result).toEqual({ status: 'duplicate_code' })
  })
})

describe('approvePaymentClaim', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns not_found for a missing claim', async () => {
    mockFindUnique.mockResolvedValue(null)
    const result = await approvePaymentClaim('missing', 'admin@example.com')
    expect(result).toEqual({ status: 'not_found' })
  })

  it('returns already_reviewed for a non-pending claim', async () => {
    mockFindUnique.mockResolvedValue({ id: 'claim-1', status: 'approved' })
    const result = await approvePaymentClaim('claim-1', 'admin@example.com')
    expect(result).toEqual({ status: 'already_reviewed' })
    expect(mockRecordBook).not.toHaveBeenCalled()
  })

  it('records a book purchase on approval, in KES, using the claim identity', async () => {
    mockFindUnique.mockResolvedValue({
      id: 'claim-1',
      status: 'pending',
      offerType: 'book',
      bookSlug: 'the-cost-of-infidelity',
      teachingId: null,
      userId: 'user-1',
      email: 'buyer@example.com',
      name: 'Buyer',
      amountKes: 800,
      mpesaCode: 'QGH7XXXXX1',
    })
    mockRecordBook.mockResolvedValue({ purchaseId: 'p1', isNew: true })

    const result = await approvePaymentClaim('claim-1', 'admin@example.com')

    expect(result).toEqual({ status: 'approved' })
    expect(mockRecordBook).toHaveBeenCalledWith({
      slug: 'the-cost-of-infidelity',
      reference: 'QGH7XXXXX1',
      provider: 'paybill',
      amountKobo: 80000,
      currency: 'KES',
      email: 'buyer@example.com',
      name: 'Buyer',
    })
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: 'claim-1' },
      data: { status: 'approved', reviewedAt: expect.any(Date), reviewedByEmail: 'admin@example.com' },
    })
  })

  it('returns offer_missing when the book no longer exists', async () => {
    mockFindUnique.mockResolvedValue({
      id: 'claim-1',
      status: 'pending',
      offerType: 'book',
      bookSlug: 'deleted-book',
      amountKes: 800,
      mpesaCode: 'QGH7XXXXX1',
      email: 'buyer@example.com',
      name: 'Buyer',
    })
    mockRecordBook.mockResolvedValue(null)

    const result = await approvePaymentClaim('claim-1', 'admin@example.com')
    expect(result).toEqual({ status: 'offer_missing' })
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('records a teaching purchase on approval, requiring userId', async () => {
    mockFindUnique.mockResolvedValue({
      id: 'claim-1',
      status: 'pending',
      offerType: 'teaching',
      teachingId: 'teaching-1',
      userId: 'user-1',
      email: 'buyer@example.com',
      name: 'Buyer',
      amountKes: 900,
      mpesaCode: 'QGH7XXXXX2',
    })
    mockRecordTeaching.mockResolvedValue({ purchaseId: 'p2', isNew: true })

    const result = await approvePaymentClaim('claim-1', 'admin@example.com')

    expect(result).toEqual({ status: 'approved' })
    expect(mockRecordTeaching).toHaveBeenCalledWith({
      teachingId: 'teaching-1',
      reference: 'QGH7XXXXX2',
      provider: 'paybill',
      amountKobo: 90000,
      currency: 'KES',
      userId: 'user-1',
      email: 'buyer@example.com',
      name: 'Buyer',
    })
  })

  it('records a donation on approval without requiring an account', async () => {
    mockFindUnique.mockResolvedValue({
      id: 'claim-1',
      status: 'pending',
      offerType: 'donation',
      userId: null,
      email: 'donor@example.com',
      name: 'Donor',
      amountKes: 1000,
      mpesaCode: 'QGH7XXXXX3',
    })
    mockRecordDonation.mockResolvedValue({ isNew: true })

    const result = await approvePaymentClaim('claim-1', 'admin@example.com')

    expect(result).toEqual({ status: 'approved' })
    expect(mockRecordDonation).toHaveBeenCalledWith({
      reference: 'QGH7XXXXX3',
      provider: 'paybill',
      amountMinor: 100000,
      currency: 'KES',
      email: 'donor@example.com',
      name: 'Donor',
    })
  })

  it('records a coaching payment on approval, without requiring an account', async () => {
    mockFindUnique.mockResolvedValue({
      id: 'claim-1',
      status: 'pending',
      offerType: 'coaching',
      coachingOfferName: 'Starter Session',
      userId: null,
      email: 'coachee@example.com',
      name: 'Coachee',
      amountKes: 3500,
      mpesaCode: 'QGH7XXXXX4',
    })
    mockRecordCoachingPayment.mockResolvedValue({ isNew: true })

    const result = await approvePaymentClaim('claim-1', 'admin@example.com')

    expect(result).toEqual({ status: 'approved' })
    expect(mockRecordCoachingPayment).toHaveBeenCalledWith({
      offerName: 'Starter Session',
      reference: 'QGH7XXXXX4',
      provider: 'paybill',
      amountMinor: 350000,
      currency: 'KES',
      email: 'coachee@example.com',
      name: 'Coachee',
      userId: undefined,
    })
  })

  it('returns offer_missing when a coaching claim has no coachingOfferName', async () => {
    mockFindUnique.mockResolvedValue({
      id: 'claim-1',
      status: 'pending',
      offerType: 'coaching',
      coachingOfferName: null,
      amountKes: 3500,
      mpesaCode: 'QGH7XXXXX5',
      email: 'coachee@example.com',
      name: 'Coachee',
    })

    const result = await approvePaymentClaim('claim-1', 'admin@example.com')

    expect(result).toEqual({ status: 'offer_missing' })
    expect(mockRecordCoachingPayment).not.toHaveBeenCalled()
  })
})

describe('rejectPaymentClaim', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns not_found for a missing claim', async () => {
    mockFindUnique.mockResolvedValue(null)
    const result = await rejectPaymentClaim('missing', 'admin@example.com')
    expect(result).toEqual({ status: 'not_found' })
  })

  it('marks a pending claim rejected with the reviewer and notes', async () => {
    mockFindUnique.mockResolvedValue({ id: 'claim-1', status: 'pending' })

    const result = await rejectPaymentClaim('claim-1', 'admin@example.com', 'Code does not match')

    expect(result).toEqual({ status: 'rejected' })
    expect(mockUpdate).toHaveBeenCalledWith({
      where: { id: 'claim-1' },
      data: {
        status: 'rejected',
        reviewedAt: expect.any(Date),
        reviewedByEmail: 'admin@example.com',
        adminNotes: 'Code does not match',
      },
    })
  })
})
