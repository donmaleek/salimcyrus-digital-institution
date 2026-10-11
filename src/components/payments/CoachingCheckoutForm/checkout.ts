export type CheckoutProvider = 'paystack' | 'paypal'

/** Provider-specific transport contract. Throw on every unsuccessful response so
 * the UI always clears processing state and lets the client retry. */
export async function requestCoachingCheckout(
  provider: CheckoutProvider,
  offerName: string,
  email = '',
  transport: typeof fetch = fetch
): Promise<string> {
  const providerName = provider === 'paystack' ? 'Paystack' : 'PayPal'
  const fallback = `${providerName} checkout could not be started. Please try again.`
  let response: Response
  try {
    response = await transport(
      provider === 'paystack' ? '/api/coaching/checkout' : '/api/coaching/checkout-paypal',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(provider === 'paystack' ? { email: email.trim(), offerName } : { offerName }),
      }
    )
  } catch {
    throw new Error(`Could not connect to ${providerName}. Please try again or use another method.`)
  }
  let payload: { authorizationUrl?: unknown; approvalUrl?: unknown; error?: unknown } | null
  try {
    payload = await response.json()
  } catch {
    throw new Error(fallback)
  }
  const destination = provider === 'paystack' ? payload?.authorizationUrl : payload?.approvalUrl
  if (!response.ok || typeof destination !== 'string' || !destination.trim()) {
    throw new Error(typeof payload?.error === 'string' ? payload.error : fallback)
  }
  try {
    const url = new URL(destination)
    if (url.protocol !== 'https:') throw new Error('Invalid checkout URL')
  } catch {
    throw new Error(fallback)
  }
  return destination
}
