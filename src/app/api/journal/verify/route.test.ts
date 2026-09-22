/** @jest-environment node */
import { NextRequest } from 'next/server'

jest.mock('next-auth', () => ({ getServerSession: jest.fn() }))
jest.mock('../../../../lib/auth', () => ({ authOptions: {} }))
jest.mock('../../../../lib/api/paystack', () => ({ verifyPaystackTransaction: jest.fn() }))
jest.mock('../../../../services/payments/journal-subscriptions', () => ({
  JOURNAL_SUBSCRIPTION_PRICE_KES: 500,
  recordJournalSubscription: jest.fn(),
}))

import { getServerSession } from 'next-auth'
import { verifyPaystackTransaction } from '@/lib/api/paystack'
import { recordJournalSubscription } from '@/services/payments/journal-subscriptions'
import { GET } from './route'

describe('GET /api/journal/verify', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.PAYSTACK_SECRET_KEY = 'sk_test'
    ;(getServerSession as jest.Mock).mockResolvedValue({ user: { id: 'user-1', email: 'reader@example.com' } })
  })

  it('rejects a successful payment belonging to another account', async () => {
    ;(verifyPaystackTransaction as jest.Mock).mockResolvedValue({
      status: true,
      data: { status: 'success', reference: 'ref-1', amount: 50000, customer: { email: 'reader@example.com' }, metadata: { offer_name: 'journal:user-2', user_id: 'user-2' } },
    })
    const response = await GET(new NextRequest('https://salimcyrus.com/api/journal/verify?reference=ref-1'))
    expect(response.status).toBe(403)
    expect(recordJournalSubscription).not.toHaveBeenCalled()
  })

  it('records a verified matching membership', async () => {
    ;(verifyPaystackTransaction as jest.Mock).mockResolvedValue({
      status: true,
      data: { status: 'success', reference: 'ref-1', amount: 50000, customer: { email: 'reader@example.com' }, metadata: { offer_name: 'journal:user-1', user_id: 'user-1' } },
    })
    ;(recordJournalSubscription as jest.Mock).mockResolvedValue({ expiresAt: new Date('2026-10-22') })
    const response = await GET(new NextRequest('https://salimcyrus.com/api/journal/verify?reference=ref-1'))
    expect(response.status).toBe(200)
    expect(recordJournalSubscription).toHaveBeenCalledWith({
      userId: 'user-1', reference: 'ref-1', provider: 'paystack', amountMinor: 50000, currency: 'KES',
    })
  })
})
