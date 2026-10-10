/** @jest-environment node */
import { NextRequest } from 'next/server'

jest.mock('next-auth', () => ({ getServerSession: jest.fn() }))
jest.mock('../../../../../lib/auth', () => ({ authOptions: {} }))
jest.mock('../../../../../lib/api/paystack', () => ({ verifyPaystackTransaction: jest.fn() }))
jest.mock('../../../../../services/payments/parent-membership', () => ({
  PARENT_MEMBERSHIP_PRICE_KES: 1500,
  recordParentMembership: jest.fn(),
}))

import { getServerSession } from 'next-auth'
import { verifyPaystackTransaction } from '@/lib/api/paystack'
import { recordParentMembership } from '@/services/payments/parent-membership'
import { GET } from './route'

describe('GET /api/parental-guidance/membership/verify', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.PAYSTACK_SECRET_KEY = 'sk_test'
    ;(getServerSession as jest.Mock).mockResolvedValue({ user: { id: 'user-1', email: 'parent@example.com' } })
  })

  it('rejects a successful payment belonging to another account', async () => {
    ;(verifyPaystackTransaction as jest.Mock).mockResolvedValue({
      status: true,
      data: {
        status: 'success',
        reference: 'ref-1',
        amount: 150000,
        customer: { email: 'parent@example.com' },
        metadata: { offer_name: 'parent-membership:user-2', user_id: 'user-2' },
      },
    })
    const response = await GET(new NextRequest('https://salimcyrus.com/api/parental-guidance/membership/verify?reference=ref-1'))
    expect(response.status).toBe(403)
    expect(recordParentMembership).not.toHaveBeenCalled()
  })

  it('records a verified matching membership', async () => {
    ;(verifyPaystackTransaction as jest.Mock).mockResolvedValue({
      status: true,
      data: {
        status: 'success',
        reference: 'ref-1',
        amount: 150000,
        customer: { email: 'parent@example.com' },
        metadata: { offer_name: 'parent-membership:user-1', user_id: 'user-1' },
      },
    })
    ;(recordParentMembership as jest.Mock).mockResolvedValue({ expiresAt: new Date('2026-11-09') })
    const response = await GET(new NextRequest('https://salimcyrus.com/api/parental-guidance/membership/verify?reference=ref-1'))
    expect(response.status).toBe(200)
    expect(recordParentMembership).toHaveBeenCalledWith({
      userId: 'user-1',
      reference: 'ref-1',
      provider: 'paystack',
      amountMinor: 150000,
      currency: 'KES',
    })
  })
})
