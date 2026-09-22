/** @jest-environment node */
import { NextRequest } from 'next/server'

jest.mock('next-auth', () => ({ getServerSession: jest.fn() }))
jest.mock('../../../../lib/auth', () => ({ authOptions: {} }))
jest.mock('../../../../lib/api/paystack', () => ({ verifyPaystackTransaction: jest.fn() }))
jest.mock('../../../../services/payments/coaching-bookings', () => ({ recordCoachingPayment: jest.fn() }))

import { getServerSession } from 'next-auth'
import { verifyPaystackTransaction } from '@/lib/api/paystack'
import { recordCoachingPayment } from '@/services/payments/coaching-bookings'
import { coachingOffers } from '@/lib/data/coaching-offers'
import { GET } from './route'

describe('GET /api/coaching/verify', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.PAYSTACK_SECRET_KEY = 'sk_test'
    ;(getServerSession as jest.Mock).mockResolvedValue(null)
  })

  it('records only a verified transaction matching the server-owned offer and amount', async () => {
    const offer = coachingOffers[0]
    ;(verifyPaystackTransaction as jest.Mock).mockResolvedValue({
      status: true,
      data: { status: 'success', reference: 'ref-coaching', amount: offer.priceKes * 100, customer: { email: 'client@example.com' }, metadata: { offer_name: offer.name } },
    })

    const response = await GET(new NextRequest(`https://salimcyrus.com/api/coaching/verify?reference=ref-coaching&offerName=${encodeURIComponent(offer.name)}`))
    const body = await response.json()
    expect(response.status).toBe(200)
    expect(body.paymentReference).toBe('ref-coaching')
    expect(recordCoachingPayment).toHaveBeenCalledWith(expect.objectContaining({ provider: 'paystack', amountMinor: offer.priceKes * 100, email: 'client@example.com' }))
  })

  it('rejects an underpayment', async () => {
    const offer = coachingOffers[0]
    ;(verifyPaystackTransaction as jest.Mock).mockResolvedValue({
      status: true,
      data: { status: 'success', reference: 'ref-low', amount: 100, customer: { email: 'client@example.com' }, metadata: { offer_name: offer.name } },
    })
    const response = await GET(new NextRequest(`https://salimcyrus.com/api/coaching/verify?reference=ref-low&offerName=${encodeURIComponent(offer.name)}`))
    expect(response.status).toBe(403)
    expect(recordCoachingPayment).not.toHaveBeenCalled()
  })
})
