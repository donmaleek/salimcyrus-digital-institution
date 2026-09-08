jest.mock('../../lib/db', () => ({
  db: {
    user: { findFirst: jest.fn() },
    $transaction: jest.fn(),
  },
}))

import { recordDonation } from './donations'
import { db } from '@/lib/db'

const mockFindFirstUser = db.user.findFirst as jest.Mock
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
    },
    crmDonation: { create: jest.fn().mockResolvedValue({ id: 'donation-1' }) },
    crmActivity: { create: jest.fn().mockResolvedValue({}) },
    crmAuditEvent: { create: jest.fn().mockResolvedValue({}) },
    ...overrides,
  }
}

describe('recordDonation', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockFindFirstUser.mockResolvedValue(null)
    mockTransaction.mockImplementation((callback: (tx: unknown) => unknown) => callback(fakeTx()))
  })

  it('stamps the correct currency on every row that stores an amount (not just the default)', async () => {
    const tx = fakeTx()
    mockTransaction.mockImplementation((callback: (tx: unknown) => unknown) => callback(tx))

    await recordDonation({
      reference: 'cap-1',
      provider: 'paypal',
      amountMinor: 2500,
      currency: 'USD',
      email: 'donor@example.com',
      name: 'Generous Donor',
    })

    expect(tx.crmTransaction.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ currency: 'USD', grossMinor: 2500 }) })
    )
    expect(tx.crmDonation.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ currency: 'USD', amountMinor: 2500 }) })
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

    const result = await recordDonation({
      reference: 'cap-1',
      provider: 'paypal',
      amountMinor: 2500,
      currency: 'USD',
      email: 'donor@example.com',
      name: 'Generous Donor',
    })

    expect(result).toEqual({ isNew: false })
    expect(tx.booking.create).not.toHaveBeenCalled()
    expect(tx.crmDonation.create).not.toHaveBeenCalled()
  })

  it('is idempotent: a reference that already exists as a transaction is a no-op', async () => {
    const tx = fakeTx({
      crmTransaction: {
        findUnique: jest.fn().mockResolvedValue({ id: 'existing-txn' }),
        create: jest.fn(),
      },
    })
    mockTransaction.mockImplementation((callback: (tx: unknown) => unknown) => callback(tx))

    const result = await recordDonation({
      reference: 'cap-1',
      provider: 'paypal',
      amountMinor: 2500,
      currency: 'USD',
      email: 'donor@example.com',
      name: 'Generous Donor',
    })

    expect(result).toEqual({ isNew: false })
    expect(tx.crmTransaction.create).not.toHaveBeenCalled()
  })

  it('reuses an existing CRM contact instead of creating a duplicate', async () => {
    const tx = fakeTx({
      crmContact: {
        findFirst: jest.fn().mockResolvedValue({ id: 'existing-contact' }),
        create: jest.fn(),
      },
    })
    mockTransaction.mockImplementation((callback: (tx: unknown) => unknown) => callback(tx))

    await recordDonation({
      reference: 'cap-1',
      provider: 'paypal',
      amountMinor: 2500,
      currency: 'USD',
      email: 'donor@example.com',
      name: 'Generous Donor',
    })

    expect(tx.crmContact.create).not.toHaveBeenCalled()
    expect(tx.crmDonation.create).toHaveBeenCalledWith(
      expect.objectContaining({ data: expect.objectContaining({ contactId: 'existing-contact' }) })
    )
  })
})
