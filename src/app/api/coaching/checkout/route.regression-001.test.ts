/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server'

jest.mock('../../../../services/payments/paystack', () => {
  const actual = jest.requireActual('../../../../services/payments/paystack')
  return {
    ...actual,
    initializePaystackCoachingCheckout: jest.fn(),
  }
})

import { POST } from './route'
import { coachingOffers } from '@/lib/data/coaching-offers'
import { initializePaystackCoachingCheckout } from '@/services/payments/paystack'

const mockInitialize = initializePaystackCoachingCheckout as jest.Mock

function request(body: unknown) {
  return new NextRequest('https://salimcyrus.com/api/coaching/checkout', {
    method: 'POST',
    body: JSON.stringify(body),
  })
}

// Regression: ISSUE-001 — priced coaching offers had no first-party Paystack checkout.
// Found by /qa on 2026-09-21
// Report: .gstack/qa-reports/qa-report-salimcyrus-com-2026-09-21.md
describe('POST /api/coaching/checkout', () => {
  const originalKey = process.env.PAYSTACK_SECRET_KEY

  beforeEach(() => {
    process.env.PAYSTACK_SECRET_KEY = 'sk_test_example'
    jest.clearAllMocks()
  })

  afterAll(() => {
    process.env.PAYSTACK_SECRET_KEY = originalKey
  })

  it('fails closed when Paystack is not configured', async () => {
    delete process.env.PAYSTACK_SECRET_KEY
    const response = await POST(
      request({ email: 'buyer@example.com', offerName: coachingOffers[0].name })
    )
    expect(response.status).toBe(503)
    expect(mockInitialize).not.toHaveBeenCalled()
  })

  it('rejects invalid email and unknown offers before calling Paystack', async () => {
    const invalidEmail = await POST(
      request({ email: 'not-an-email', offerName: coachingOffers[0].name })
    )
    const unknownOffer = await POST(
      request({ email: 'buyer@example.com', offerName: 'Unknown Session' })
    )
    expect(invalidEmail.status).toBe(400)
    expect(unknownOffer.status).toBe(404)
    expect(mockInitialize).not.toHaveBeenCalled()
  })

  it('initializes the selected server-owned offer and returns its hosted checkout', async () => {
    const offer = coachingOffers[3]
    mockInitialize.mockResolvedValue({
      authorizationUrl: 'https://checkout.paystack.com/coaching',
      reference: 'coach_ref',
    })

    const response = await POST(
      request({ email: 'buyer@example.com', offerName: offer.name })
    )
    const payload = await response.json()

    expect(response.status).toBe(200)
    expect(payload.authorizationUrl).toBe('https://checkout.paystack.com/coaching')
    expect(mockInitialize).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'buyer@example.com',
        offerName: offer.name,
        callbackUrl: expect.stringContaining('/book-now/confirm?offerName='),
      })
    )
  })
})
