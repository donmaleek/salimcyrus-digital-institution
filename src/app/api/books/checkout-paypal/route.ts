import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getPayPalAccessToken, createPayPalOrder } from '@/lib/api/paypal'
import { books } from '@/lib/data/books'

const requestSchema = z.object({
  slug: z.string().trim().min(1).max(200),
})

export async function POST(request: NextRequest) {
  const clientId = process.env.PAYPAL_CLIENT_ID
  const secret = process.env.PAYPAL_CLIENT_SECRET
  if (!clientId || !secret) {
    return NextResponse.json(
      { error: 'PayPal checkout is temporarily unavailable. Please use another payment method.' },
      { status: 503 }
    )
  }

  // Same account requirement as Paystack checkout, see
  // src/app/api/books/checkout/route.ts for the full rationale.
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId || !session?.user?.email) {
    return NextResponse.json({ error: 'Sign in to buy this book.' }, { status: 401 })
  }

  const parsed = requestSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const book = books.find((b) => b.slug === parsed.data.slug)
  if (!book || book.status !== 'available') {
    return NextResponse.json({ error: 'This book is not available for purchase.' }, { status: 404 })
  }
  if (!book.fileName) {
    return NextResponse.json(
      {
        error:
          'Instant download for this title is being finalized. Please use the WhatsApp order option below.',
      },
      { status: 409 }
    )
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? request.nextUrl.origin
  const bookPageUrl = new URL(`/books/${book.slug}`, siteUrl).toString()

  try {
    const accessToken = await getPayPalAccessToken(clientId, secret)
    const order = await createPayPalOrder({
      amountUsd: book.priceUsd,
      description: `${book.title}, by Salim Cyrus`,
      referenceId: `book:${book.slug}:${userId}`,
      returnUrl: bookPageUrl,
      cancelUrl: bookPageUrl,
      accessToken,
    })
    console.info('PayPal book checkout initialized', { orderId: order.id, slug: book.slug })
    return NextResponse.json({ approvalUrl: order.approveUrl })
  } catch (error) {
    console.error('PayPal book checkout failed to initialize', { slug: book.slug, error })
    return NextResponse.json(
      { error: 'PayPal could not start checkout. Please try again or use another method.' },
      { status: 502 }
    )
  }
}
