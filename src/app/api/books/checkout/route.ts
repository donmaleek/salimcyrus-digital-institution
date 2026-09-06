import { NextRequest, NextResponse } from 'next/server'
import {
  bookCheckoutRequestSchema,
  initializePaystackBookCheckout,
} from '@/services/payments/paystack'
import { books } from '@/lib/data/books'

export async function POST(request: NextRequest) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY
  if (!secretKey) {
    return NextResponse.json(
      {
        error:
          'Online checkout is temporarily unavailable. Please use the WhatsApp order option below.',
      },
      { status: 503 }
    )
  }

  const parsed = bookCheckoutRequestSchema.safeParse(
    await request.json().catch(() => null)
  )
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Enter a valid email to continue.' },
      { status: 400 }
    )
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
  const callbackUrl = new URL(`/books/${book.slug}`, siteUrl).toString()

  try {
    const checkout = await initializePaystackBookCheckout({
      email: parsed.data.email,
      slug: book.slug,
      title: book.title,
      priceKes: book.priceKes,
      secretKey,
      callbackUrl,
    })
    console.info('Paystack book checkout initialized', {
      reference: checkout.reference,
      slug: book.slug,
    })
    return NextResponse.json(checkout)
  } catch {
    return NextResponse.json(
      {
        error:
          'Paystack could not start checkout. Please try again or use the WhatsApp order option.',
      },
      { status: 502 }
    )
  }
}
