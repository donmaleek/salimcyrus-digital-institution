import { z } from 'zod'

export const donationRequestSchema = z.object({
  email: z.string().trim().email(),
  amountKes: z.coerce.number().int().min(100).max(10_000_000),
})

interface PaystackInitializeResponse {
  status: boolean
  message: string
  data?: {
    authorization_url: string
    access_code: string
    reference: string
  }
}

export interface DonationCheckout {
  authorizationUrl: string
  reference: string
}

export async function initializePaystackDonation({
  email,
  amountKes,
  secretKey,
  callbackUrl,
  fetcher = fetch,
}: {
  email: string
  amountKes: number
  secretKey: string
  callbackUrl: string
  fetcher?: typeof fetch
}): Promise<DonationCheckout> {
  const response = await fetcher(
    'https://api.paystack.co/transaction/initialize',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${secretKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: amountKes * 100,
        currency: 'KES',
        callback_url: callbackUrl,
        metadata: {
          purpose: 'Halisi Hub Connect mission support',
          offer_name: 'Support the Mission',
        },
      }),
    }
  )

  const payload = (await response.json()) as PaystackInitializeResponse
  if (!response.ok || !payload.status || !payload.data?.authorization_url) {
    throw new Error(
      payload.message || 'Paystack checkout could not be initialized'
    )
  }

  return {
    authorizationUrl: payload.data.authorization_url,
    reference: payload.data.reference,
  }
}
