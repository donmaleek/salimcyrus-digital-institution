import {
  donationRequestSchema,
  initializePaystackDonation,
  bookCheckoutRequestSchema,
  initializePaystackBookCheckout,
} from './paystack'

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

describe('Paystack book checkout', () => {
  it('validates email and slug', () => {
    expect(
      bookCheckoutRequestSchema.safeParse({ email: 'reader@example.com', slug: 'the-cost-of-infidelity' })
        .success
    ).toBe(true)
    expect(bookCheckoutRequestSchema.safeParse({ email: 'invalid', slug: 'x' }).success).toBe(false)
    expect(bookCheckoutRequestSchema.safeParse({ email: 'reader@example.com', slug: '' }).success).toBe(
      false
    )
  })

  it('embeds a book-specific offer_name so the webhook can tell titles apart', async () => {
    const fetcher = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        status: true,
        message: 'Authorization URL created',
        data: {
          authorization_url: 'https://checkout.paystack.com/example',
          access_code: 'example',
          reference: 'book_123',
        },
      }),
    }) as unknown as typeof fetch

    await initializePaystackBookCheckout({
      email: 'reader@example.com',
      slug: 'the-cost-of-infidelity',
      title: 'The Cost of Infidelity',
      priceKes: 1499,
      secretKey: 'test-secret',
      callbackUrl: 'https://salimcyrus.com/books/the-cost-of-infidelity',
      fetcher,
    })

    expect(fetcher).toHaveBeenCalledWith(
      'https://api.paystack.co/transaction/initialize',
      expect.objectContaining({
        body: expect.stringContaining('"offer_name":"book:the-cost-of-infidelity"'),
      })
    )
  })

  it('charges the exact book price in the smallest currency unit', async () => {
    const fetcher = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        status: true,
        data: { authorization_url: 'https://checkout.paystack.com/x', reference: 'r1' },
      }),
    }) as unknown as typeof fetch

    await initializePaystackBookCheckout({
      email: 'reader@example.com',
      slug: 'slug',
      title: 'Title',
      priceKes: 1499,
      secretKey: 'test-secret',
      callbackUrl: 'https://salimcyrus.com/books/slug',
      fetcher,
    })

    expect(fetcher).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ body: expect.stringContaining('"amount":149900') })
    )
  })
})
