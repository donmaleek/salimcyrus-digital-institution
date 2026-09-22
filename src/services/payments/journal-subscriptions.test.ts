jest.mock('../../lib/db', () => ({
  db: {
    journalSubscription: { findUnique: jest.fn(), findFirst: jest.fn(), create: jest.fn() },
  },
}))

import { db } from '@/lib/db'
import {
  recordJournalSubscription,
  getActiveJournalSubscription,
  hasActiveJournalSubscription,
  JOURNAL_SUBSCRIPTION_PERIOD_DAYS,
} from './journal-subscriptions'

const mockFindUnique = db.journalSubscription.findUnique as jest.Mock
const mockFindFirst = db.journalSubscription.findFirst as jest.Mock
const mockCreate = db.journalSubscription.create as jest.Mock

const DAY_MS = 24 * 60 * 60 * 1000

describe('recordJournalSubscription', () => {
  beforeEach(() => jest.clearAllMocks())

  it('is idempotent on [provider, externalReference], never double-charging the same payment', async () => {
    const expiresAt = new Date('2026-10-01')
    mockFindUnique.mockResolvedValue({ id: 'sub-1', expiresAt })

    const result = await recordJournalSubscription({
      userId: 'user-1',
      reference: 'cap-1',
      provider: 'paypal',
      amountMinor: 400,
      currency: 'USD',
    })

    expect(result).toEqual({ subscriptionId: 'sub-1', expiresAt, isNew: false })
    expect(mockCreate).not.toHaveBeenCalled()
  })

  it('accepts Paystack as a Journal payment provider', async () => {
    mockFindUnique.mockResolvedValue(null)
    mockFindFirst.mockResolvedValue(null)
    mockCreate.mockImplementation(({ data }) => Promise.resolve({ id: 'sub-paystack', ...data }))

    const result = await recordJournalSubscription({
      userId: 'user-1',
      reference: 'paystack-ref-1',
      provider: 'paystack',
      amountMinor: 50000,
      currency: 'KES',
    })

    expect(result.isNew).toBe(true)
    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({ provider: 'paystack', amountMinor: 50000, currency: 'KES' }),
    })
  })

  it('grants 30 days from now for a first-time subscriber with no active row', async () => {
    mockFindUnique.mockResolvedValue(null)
    mockFindFirst.mockResolvedValue(null)
    mockCreate.mockImplementation(({ data }) => Promise.resolve({ id: 'sub-new', ...data }))

    const before = Date.now()
    const result = await recordJournalSubscription({
      userId: 'user-1',
      reference: 'QGH7XXXXX9',
      provider: 'paybill',
      amountMinor: 50000,
      currency: 'KES',
    })
    const after = Date.now()

    expect(result.isNew).toBe(true)
    const expectedMin = before + JOURNAL_SUBSCRIPTION_PERIOD_DAYS * DAY_MS
    const expectedMax = after + JOURNAL_SUBSCRIPTION_PERIOD_DAYS * DAY_MS
    expect(result.expiresAt.getTime()).toBeGreaterThanOrEqual(expectedMin)
    expect(result.expiresAt.getTime()).toBeLessThanOrEqual(expectedMax)
  })

  it('stacks a renewal onto the existing expiry instead of today, so early renewal never loses paid time', async () => {
    mockFindUnique.mockResolvedValue(null)
    const stillActiveExpiry = new Date(Date.now() + 10 * DAY_MS)
    mockFindFirst.mockResolvedValue({ id: 'sub-old', expiresAt: stillActiveExpiry })
    mockCreate.mockImplementation(({ data }) => Promise.resolve({ id: 'sub-new', ...data }))

    const result = await recordJournalSubscription({
      userId: 'user-1',
      reference: 'cap-renewal',
      provider: 'paypal',
      amountMinor: 400,
      currency: 'USD',
    })

    const expected = stillActiveExpiry.getTime() + JOURNAL_SUBSCRIPTION_PERIOD_DAYS * DAY_MS
    expect(result.expiresAt.getTime()).toBe(expected)
  })

  it('starts a fresh 30-day window from now when the previous subscription has already lapsed', async () => {
    mockFindUnique.mockResolvedValue(null)
    const lapsedExpiry = new Date(Date.now() - 5 * DAY_MS)
    mockFindFirst.mockResolvedValue(null) // getActiveJournalSubscription filters expiresAt > now, so a lapsed row never comes back
    mockCreate.mockImplementation(({ data }) => Promise.resolve({ id: 'sub-new', ...data }))

    const before = Date.now()
    const result = await recordJournalSubscription({
      userId: 'user-1',
      reference: 'cap-comeback',
      provider: 'paypal',
      amountMinor: 400,
      currency: 'USD',
    })

    expect(result.expiresAt.getTime()).toBeGreaterThan(before)
    expect(result.expiresAt.getTime()).toBeLessThan(lapsedExpiry.getTime() + 2 * JOURNAL_SUBSCRIPTION_PERIOD_DAYS * DAY_MS)
  })
})

describe('getActiveJournalSubscription / hasActiveJournalSubscription', () => {
  beforeEach(() => jest.clearAllMocks())

  it('queries for a row still in the future, most recent expiry first', async () => {
    mockFindFirst.mockResolvedValue(null)
    await getActiveJournalSubscription('user-1')
    expect(mockFindFirst).toHaveBeenCalledWith({
      where: { userId: 'user-1', expiresAt: { gt: expect.any(Date) } },
      orderBy: { expiresAt: 'desc' },
    })
  })

  it('reports false when there is no active row', async () => {
    mockFindFirst.mockResolvedValue(null)
    expect(await hasActiveJournalSubscription('user-1')).toBe(false)
  })

  it('reports true when an active row exists', async () => {
    mockFindFirst.mockResolvedValue({ id: 'sub-1', expiresAt: new Date(Date.now() + DAY_MS) })
    expect(await hasActiveJournalSubscription('user-1')).toBe(true)
  })
})
