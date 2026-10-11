import { requestCoachingCheckout } from './checkout'

function transport(response: unknown, ok = true) {
  return jest.fn().mockResolvedValue({ ok, json: async () => response })
}

describe('coaching checkout transport', () => {
  it('sends the Paystack contract with a trimmed receipt email', async () => {
    const fetcher = transport({ authorizationUrl: 'https://checkout.paystack.com/session' })
    await expect(requestCoachingCheckout('paystack', 'Starter Session', ' client@example.com ', fetcher)).resolves.toBe('https://checkout.paystack.com/session')
    expect(fetcher).toHaveBeenCalledWith('/api/coaching/checkout', expect.objectContaining({
      method: 'POST', body: JSON.stringify({ email: 'client@example.com', offerName: 'Starter Session' }),
    }))
  })
  it('sends only the offer name to PayPal without requiring email', async () => {
    const fetcher = transport({ approvalUrl: 'https://www.paypal.com/checkoutnow?token=one' })
    await requestCoachingCheckout('paypal', 'Starter Session', '', fetcher)
    expect(fetcher).toHaveBeenCalledWith('/api/coaching/checkout-paypal', expect.objectContaining({ body: JSON.stringify({ offerName: 'Starter Session' }) }))
  })
  it('returns useful provider errors', async () => {
    await expect(requestCoachingCheckout('paystack', 'Starter Session', '', transport({ error: 'Payments unavailable' }, false))).rejects.toThrow('Payments unavailable')
  })
  it('turns network errors into recoverable messages', async () => {
    await expect(requestCoachingCheckout('paypal', 'Starter Session', '', jest.fn().mockRejectedValue(new Error('offline')))).rejects.toThrow('Could not connect to PayPal')
  })
  it('turns malformed JSON into a recoverable error', async () => {
    const fetcher = jest.fn().mockResolvedValue({ ok: true, json: async () => { throw new SyntaxError('bad JSON') } })
    await expect(requestCoachingCheckout('paystack', 'Starter Session', '', fetcher)).rejects.toThrow('Paystack checkout could not be started')
  })
  it.each([null, {}, { approvalUrl: 42 }, { approvalUrl: '' }, { approvalUrl: 'javascript:alert(1)' }, { approvalUrl: 'http://example.com' }])('rejects unusable checkout responses: %p', async (payload) => {
    await expect(requestCoachingCheckout('paypal', 'Starter Session', '', transport(payload))).rejects.toThrow('PayPal checkout could not be started')
  })
})
