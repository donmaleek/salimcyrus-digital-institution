import { coachingOffers } from '@/lib/data/coaching-offers'
import { initializePaystackCoachingCheckout } from './paystack'

// Regression: ISSUE-001 — coaching had no Paystack initializer for all priced offers.
// Found by /qa on 2026-09-21
// Report: .gstack/qa-reports/qa-report-salimcyrus-com-2026-09-21.md
describe('Paystack coaching checkout', () => {
  it('uses the catalog price and embeds the exact offer name for webhook fulfillment', async () => {
    const offer = coachingOffers[coachingOffers.length - 1]
    const fetcher = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        status: true,
        data: {
          authorization_url: 'https://checkout.paystack.com/coaching',
          reference: 'coach_ref',
        },
      }),
    }) as unknown as typeof fetch

    await initializePaystackCoachingCheckout({
      email: 'buyer@example.com',
      offerName: offer.name,
      secretKey: 'sk_test_example',
      callbackUrl: 'https://salimcyrus.com/book-now/confirm',
      fetcher,
    })

    const body = JSON.parse((fetcher as jest.Mock).mock.calls[0][1].body)
    expect(body).toMatchObject({
      email: 'buyer@example.com',
      amount: offer.priceKes * 100,
      currency: 'KES',
      metadata: { purpose: 'Coaching booking', offer_name: offer.name },
    })
  })

  it('rejects an offer name that is not in the server catalog', async () => {
    await expect(
      initializePaystackCoachingCheckout({
        email: 'buyer@example.com',
        offerName: 'Invented Session',
        secretKey: 'sk_test_example',
        callbackUrl: 'https://salimcyrus.com/book-now/confirm',
      })
    ).rejects.toThrow('Unknown coaching offer')
  })
})
