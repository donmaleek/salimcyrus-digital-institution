import { donationRequestSchema, initializePaystackDonation } from './paystack'

describe('Paystack donation checkout', () => {
  it('validates email and KES donation boundaries', () => {
    expect(
      donationRequestSchema.safeParse({
        email: 'giver@example.com',
        amountKes: 100,
      }).success
    ).toBe(true)
    expect(
      donationRequestSchema.safeParse({ email: 'invalid', amountKes: 100 })
        .success
    ).toBe(false)
    expect(
      donationRequestSchema.safeParse({
        email: 'giver@example.com',
        amountKes: 99,
      }).success
    ).toBe(false)
  })

  it('initializes a KES transaction in the smallest currency unit', async () => {
    const fetcher = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        status: true,
        message: 'Authorization URL created',
        data: {
          authorization_url: 'https://checkout.paystack.com/example',
          access_code: 'example',
          reference: 'support_123',
        },
      }),
    }) as unknown as typeof fetch

    const checkout = await initializePaystackDonation({
      email: 'giver@example.com',
      amountKes: 1499,
      secretKey: 'test-secret',
      callbackUrl:
        'https://salimcyrus.com/support-the-mission?payment=returned',
      fetcher,
    })

    expect(checkout).toEqual({
      authorizationUrl: 'https://checkout.paystack.com/example',
      reference: 'support_123',
    })
    expect(fetcher).toHaveBeenCalledWith(
      'https://api.paystack.co/transaction/initialize',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-secret',
        }),
        body: expect.stringContaining('"amount":149900'),
      })
    )
  })

  it('fails closed when Paystack rejects initialization', async () => {
    const fetcher = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ status: false, message: 'Invalid key' }),
    }) as unknown as typeof fetch

    await expect(
      initializePaystackDonation({
        email: 'giver@example.com',
        amountKes: 500,
        secretKey: 'bad-secret',
        callbackUrl: 'https://salimcyrus.com/support-the-mission',
        fetcher,
      })
    ).rejects.toThrow('Invalid key')
  })
})
