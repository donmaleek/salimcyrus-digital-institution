import {
  getPayPalAccessToken,
  createPayPalOrder,
  capturePayPalOrder,
} from './paypal'

function fakeResponse(ok: boolean, body: unknown) {
  return { ok, json: async () => body }
}

describe('getPayPalAccessToken', () => {
  it('sends Basic auth with the client id and secret and returns the token', async () => {
    const fetcher = jest.fn().mockResolvedValue(fakeResponse(true, { access_token: 'tok_123' }))
    const token = await getPayPalAccessToken('client-id', 'client-secret', fetcher as unknown as typeof fetch)

    expect(token).toBe('tok_123')
    const [url, options] = fetcher.mock.calls[0]
    expect(url).toBe('https://api-m.paypal.com/v1/oauth2/token')
    expect(options.headers.Authorization).toBe(
      `Basic ${Buffer.from('client-id:client-secret').toString('base64')}`
    )
  })

  it('throws when PayPal rejects the credentials', async () => {
    const fetcher = jest.fn().mockResolvedValue(fakeResponse(false, { error: 'invalid_client' }))
    await expect(
      getPayPalAccessToken('bad', 'creds', fetcher as unknown as typeof fetch)
    ).rejects.toThrow('Could not authenticate with PayPal')
  })
})

describe('createPayPalOrder', () => {
  it('charges in USD and returns the approval link', async () => {
    const fetcher = jest.fn().mockResolvedValue(
      fakeResponse(true, {
        id: 'order-1',
        links: [
          { rel: 'self', href: 'https://api-m.paypal.com/v2/checkout/orders/order-1' },
          { rel: 'approve', href: 'https://www.paypal.com/checkoutnow?token=order-1' },
        ],
      })
    )

    const order = await createPayPalOrder({
      amountUsd: 5,
      description: 'The Cost of Infidelity',
      referenceId: 'book:the-cost-of-infidelity:user-1',
      returnUrl: 'https://salimcyrus.com/books/the-cost-of-infidelity',
      cancelUrl: 'https://salimcyrus.com/books/the-cost-of-infidelity',
      accessToken: 'tok_123',
      fetcher: fetcher as unknown as typeof fetch,
    })

    expect(order).toEqual({ id: 'order-1', approveUrl: 'https://www.paypal.com/checkoutnow?token=order-1' })
    const body = JSON.parse(fetcher.mock.calls[0][1].body)
    expect(body.purchase_units[0].amount).toEqual({ currency_code: 'USD', value: '5.00' })
    expect(body.purchase_units[0].reference_id).toBe('book:the-cost-of-infidelity:user-1')
  })

  it('throws when PayPal returns no approval link', async () => {
    const fetcher = jest.fn().mockResolvedValue(fakeResponse(true, { id: 'order-1', links: [] }))
    await expect(
      createPayPalOrder({
        amountUsd: 5,
        description: 'x',
        referenceId: 'x',
        returnUrl: 'https://x',
        cancelUrl: 'https://x',
        accessToken: 'tok',
        fetcher: fetcher as unknown as typeof fetch,
      })
    ).rejects.toThrow('did not return an approval link')
  })
})

describe('capturePayPalOrder', () => {
  it('extracts the capture details PayPal actually confirmed', async () => {
    const fetcher = jest.fn().mockResolvedValue(
      fakeResponse(true, {
        payer: { email_address: 'buyer@example.com', name: { given_name: 'Jane', surname: 'Doe' } },
        purchase_units: [
          {
            reference_id: 'book:the-cost-of-infidelity:user-1',
            payments: {
              captures: [{ id: 'capture-1', status: 'COMPLETED', amount: { value: '5.00', currency_code: 'USD' } }],
            },
          },
        ],
      })
    )

    const result = await capturePayPalOrder('order-1', 'tok_123', fetcher as unknown as typeof fetch)

    expect(result).toEqual({
      status: 'COMPLETED',
      captureId: 'capture-1',
      amountValue: '5.00',
      currencyCode: 'USD',
      payerEmail: 'buyer@example.com',
      payerName: 'Jane Doe',
      referenceId: 'book:the-cost-of-infidelity:user-1',
    })
  })

  it('throws when the response has no capture (order not actually approved yet)', async () => {
    const fetcher = jest.fn().mockResolvedValue(
      fakeResponse(true, { purchase_units: [{ reference_id: 'x', payments: {} }] })
    )
    await expect(
      capturePayPalOrder('order-1', 'tok_123', fetcher as unknown as typeof fetch)
    ).rejects.toThrow('missing capture details')
  })

  it('throws when PayPal rejects the capture', async () => {
    const fetcher = jest.fn().mockResolvedValue(fakeResponse(false, { message: 'Order already captured' }))
    await expect(
      capturePayPalOrder('order-1', 'tok_123', fetcher as unknown as typeof fetch)
    ).rejects.toThrow('Order already captured')
  })
})
