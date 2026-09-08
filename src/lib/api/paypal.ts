/**
 * PayPal REST API (Orders v2), live environment only. This account's
 * credentials were verified against api-m.paypal.com (not the sandbox),
 * so every call here is real money; there is no sandbox fallback wired in.
 *
 * KES is not a PayPal-supported currency (see PayPal's currency-codes
 * reference: https://developer.paypal.com/api/rest/reference/currency-codes/).
 * Every PayPal charge on this site is in USD; see BookEntry.priceUsd.
 */
const PAYPAL_API_BASE = 'https://api-m.paypal.com'

export async function getPayPalAccessToken(
  clientId: string,
  secret: string,
  fetcher: typeof fetch = fetch
): Promise<string> {
  const response = await fetcher(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${secret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })
  const data = (await response.json().catch(() => null)) as { access_token?: string } | null
  if (!response.ok || !data?.access_token) {
    throw new Error('Could not authenticate with PayPal')
  }
  return data.access_token
}

export interface CreatePayPalOrderInput {
  amountUsd: number
  description: string
  /** Round-trips through PayPal as purchase_units[0].reference_id so the
   * capture step can identify what was bought without trusting anything
   * else in the redirect query string. */
  referenceId: string
  returnUrl: string
  cancelUrl: string
  accessToken: string
  fetcher?: typeof fetch
}

export interface PayPalOrder {
  id: string
  approveUrl: string
}

export async function createPayPalOrder({
  amountUsd,
  description,
  referenceId,
  returnUrl,
  cancelUrl,
  accessToken,
  fetcher = fetch,
}: CreatePayPalOrderInput): Promise<PayPalOrder> {
  const response = await fetcher(`${PAYPAL_API_BASE}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          reference_id: referenceId,
          description,
          amount: { currency_code: 'USD', value: amountUsd.toFixed(2) },
        },
      ],
      application_context: {
        return_url: returnUrl,
        cancel_url: cancelUrl,
        user_action: 'PAY_NOW',
        brand_name: 'Salim Cyrus',
        shipping_preference: 'NO_SHIPPING',
      },
    }),
  })
  const data = await response.json().catch(() => null)
  if (!response.ok || !data) {
    throw new Error(data?.message || 'PayPal order creation failed')
  }
  const approveLink = (data.links as Array<{ rel: string; href: string }> | undefined)?.find(
    (link) => link.rel === 'approve'
  )
  if (!approveLink) throw new Error('PayPal did not return an approval link')
  return { id: data.id as string, approveUrl: approveLink.href }
}

export interface CapturedPayPalOrder {
  status: string
  captureId: string
  amountValue: string
  currencyCode: string
  payerEmail: string
  payerName: string
  referenceId: string
}

/**
 * Captures an approved order. This is the authoritative confirmation that
 * money actually moved. PayPal will not let the same order be captured
 * twice (a retry on an already-captured order returns the prior capture,
 * it does not charge again), so this is safe to call from a page the buyer
 * can reload.
 */
export async function capturePayPalOrder(
  orderId: string,
  accessToken: string,
  fetcher: typeof fetch = fetch
): Promise<CapturedPayPalOrder> {
  const response = await fetcher(
    `${PAYPAL_API_BASE}/v2/checkout/orders/${encodeURIComponent(orderId)}/capture`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  )
  const data = await response.json().catch(() => null)
  if (!response.ok || !data) {
    throw new Error(data?.message || 'PayPal capture failed')
  }
  const purchaseUnit = (data.purchase_units as Array<Record<string, unknown>> | undefined)?.[0]
  const payments = purchaseUnit?.payments as { captures?: Array<Record<string, unknown>> } | undefined
  const capture = payments?.captures?.[0]
  if (!capture) throw new Error('PayPal capture response missing capture details')

  const amount = capture.amount as { value: string; currency_code: string }
  const payer = data.payer as
    | { email_address?: string; name?: { given_name?: string; surname?: string } }
    | undefined

  return {
    status: capture.status as string,
    captureId: capture.id as string,
    amountValue: amount.value,
    currencyCode: amount.currency_code,
    payerEmail: payer?.email_address ?? '',
    payerName: [payer?.name?.given_name, payer?.name?.surname].filter(Boolean).join(' '),
    referenceId: (purchaseUnit?.reference_id as string | undefined) ?? '',
  }
}
