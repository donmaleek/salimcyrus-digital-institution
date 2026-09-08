jest.mock('../../lib/db', () => ({
  db: {
    user: { findFirst: jest.fn(), findUnique: jest.fn() },
    $transaction: jest.fn(),
  },
}))

import { recordCoachingPayment } from './coaching-bookings'
import { db } from '@/lib/db'

const mockFindFirstUser = db.user.findFirst as jest.Mock
const mockFindUniqueUser = db.user.findUnique as jest.Mock
const mockTransaction = db.$transaction as jest.Mock

function fakeTx(overrides: Record<string, unknown> = {}) {
  return {
    booking: {
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id: 'booking-1' }),
    },
    crmTransaction: {
      findUnique: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id: 'txn-1' }),
    },
    crmContact: {
      findFirst: jest.fn().mockResolvedValue(null),
      create: jest.fn().mockResolvedValue({ id: 'contact-1' }),
      update: jest.fn(),
    },
    crmActivity: { create: jest.fn().mockResolvedValue({}) },
    crmAuditEvent: { create: jest.fn().mockResolvedValue({}) },
    ...overrides,
  }
}

describe('recordCoachingPayment', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFindFirstUser.mockResolvedValue(null)
    mockFindUniqueUser.mockResolvedValue(null)
    mockTransaction.mockImplementation((callback: (tx: unknown) => unknown) => callback(fakeTx()))
  })

  it('creates a paid, unconfirmed booking with the provider-tagged source', async () => {
    const tx = fakeTx()
    mockTransaction.mockImplementation((callback: (tx: unknown) => unknown) => callback(tx))

    const result = await recordCoachingPayment({
      offerName: 'Starter Session',
      reference: 'cap-1',
      provider: 'paypal',
      amountMinor: 2700,
      currency: 'USD',
      email: 'buyer@example.com',
      name: 'Buyer',
    })

    expect(result).toEqual({ isNew: true })
    expect(tx.booking.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        offerName: 'Starter Session',
        status: 'paid',
        source: 'paypal_checkout',
        amountKobo: 2700,
        paystackReference: 'cap-1',
        email: 'buyer@example.com',
        name: 'Buyer',
      }),
    })
    expect(tx.crmTransaction.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          provider: 'paypal',
          businessLine: 'coaching',
          currency: 'USD',
          grossMinor: 2700,
        }),
      })
    )
  })

  it('is idempotent: a reference that already exists as a booking is a no-op', async () => {
    const tx = fakeTx({
      booking: {
        findUnique: jest.fn().mockResolvedValue({ id: 'existing-booking' }),
        create: jest.fn(),
      },
    })
    mockTransaction.mockImplementation((callback: (tx: unknown) => unknown) => callback(tx))

    const result = await recordCoachingPayment({
      offerName: 'Starter Session',
      reference: 'cap-1',
      provider: 'paybill',
      amountMinor: 350000,
      currency: 'KES',
      email: 'buyer@example.com',
      name: 'Buyer',
    })

    expect(result).toEqual({ isNew: false })
    expect(tx.booking.create).not.toHaveBeenCalled()
  })

  it('is idempotent: a reference that already exists as a transaction is a no-op', async () => {
    const tx = fakeTx({
      crmTransaction: {
        findUnique: jest.fn().mockResolvedValue({ id: 'existing-txn' }),
        create: jest.fn(),
      },
    })
    mockTransaction.mockImplementation((callback: (tx: unknown) => unknown) => callback(tx))

    const result = await recordCoachingPayment({
      offerName: 'Starter Session',
      reference: 'cap-1',
      provider: 'paybill',
      amountMinor: 350000,
      currency: 'KES',
      email: 'buyer@example.com',
      name: 'Buyer',
    })

    expect(result).toEqual({ isNew: false })
    expect(tx.crmTransaction.create).not.toHaveBeenCalled()
  })

  it('links the booking to a signed-in userId when one is provided', async () => {
    mockFindUniqueUser.mockResolvedValue({ id: 'user-1', email: 'buyer@example.com' })
    const tx = fakeTx()
    mockTransaction.mockImplementation((callback: (tx: unknown) => unknown) => callback(tx))

    await recordCoachingPayment({
      offerName: 'Starter Session',
      reference: 'cap-2',
      provider: 'paypal',
      amountMinor: 2700,
      currency: 'USD',
      email: 'buyer@example.com',
      name: 'Buyer',
      userId: 'user-1',
    })

    expect(tx.booking.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ userId: 'user-1' }) })
    )
  })

  it('tags the paybill audit action distinctly from paypal', async () => {
    const tx = fakeTx()
    mockTransaction.mockImplementation((callback: (tx: unknown) => unknown) => callback(tx))

    await recordCoachingPayment({
      offerName: 'Clarity Session',
      reference: 'MPESA1',
      provider: 'paybill',
      amountMinor: 500000,
      currency: 'KES',
      email: 'buyer@example.com',
      name: 'Buyer',
    })

    expect(tx.crmAuditEvent.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ action: 'paybill_claim_approved' }) })
    )
  })
})
