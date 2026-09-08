import { z } from 'zod'
import { bookOfferName } from '@/services/payments/book-purchases'
import { teachingOfferName } from '@/services/payments/teaching-purchases'

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

export const bookCheckoutRequestSchema = z.object({
  email: z.string().trim().email(),
  slug: z.string().trim().min(1).max(200),
})

/**
 * Book purchases embed `metadata.offer_name = "book:<slug>"` so the webhook
 * can identify exactly which title was bought. Amount-matching alone can't
 * do this: every book shares the same flat price, so it can never tell two
 * titles apart (see matchOfferByAmount's doc comment in lib/api/paystack.ts).
 */
export async function initializePaystackBookCheckout({
  email,
  slug,
  title,
  priceKes,
  secretKey,
  callbackUrl,
  fetcher = fetch,
}: {
  email: string
  slug: string
  title: string
  priceKes: number
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
        amount: priceKes * 100,
        currency: 'KES',
        callback_url: callbackUrl,
        metadata: {
          purpose: 'Book purchase',
          offer_name: bookOfferName(slug),
          book_title: title,
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

export const teachingCheckoutRequestSchema = z.object({
  email: z.string().trim().email(),
  teachingId: z.string().trim().min(1).max(200),
})

export async function initializePaystackTeachingCheckout({
  email,
  teachingId,
  userId,
  slug,
  title,
  priceKes,
  secretKey,
  callbackUrl,
  fetcher = fetch,
}: {
  email: string
  teachingId: string
  userId: string
  slug: string
  title: string
  priceKes: number
  secretKey: string
  callbackUrl: string
  fetcher?: typeof fetch
}): Promise<DonationCheckout> {
  const response = await fetcher('https://api.paystack.co/transaction/initialize', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      amount: priceKes * 100,
      currency: 'KES',
      callback_url: callbackUrl,
      metadata: {
        purpose: 'Teaching purchase',
        offer_name: teachingOfferName(slug),
        teaching_id: teachingId,
        teaching_title: title,
        user_id: userId,
      },
    }),
  })

  const payload = (await response.json()) as PaystackInitializeResponse
  if (!response.ok || !payload.status || !payload.data?.authorization_url) {
    throw new Error(payload.message || 'Paystack checkout could not be initialized')
  }

  return {
    authorizationUrl: payload.data.authorization_url,
    reference: payload.data.reference,
  }
}
