import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { books } from '@/lib/data/books'
import { normalizeEmail } from '@/services/crm/normalization'

const reviewRequestSchema = z.object({
  email: z.string().trim().email(),
  reviewerName: z.string().trim().min(1).max(100),
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().trim().max(150).optional(),
  body: z.string().trim().min(10).max(2000),
})

interface RouteParams {
  params: { slug: string }
}

/**
 * A review can only be created against a real BookPurchase (matched by
 * normalized email + slug) — there's no path that lets someone review a
 * book they never bought. New reviews start "pending" and don't count
 * toward the public rating until an admin approves them.
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  const book = books.find((b) => b.slug === params.slug)
  if (!book) {
    return NextResponse.json({ error: 'Unknown book.' }, { status: 404 })
  }

  const parsed = reviewRequestSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Enter a valid name, email, rating (1-5), and a review of at least 10 characters.' },
      { status: 400 }
    )
  }

  const normalizedEmail = normalizeEmail(parsed.data.email)!
  const purchase = await db.bookPurchase.findFirst({
    where: { bookSlug: params.slug, email: { equals: normalizedEmail, mode: 'insensitive' } },
    include: { review: true },
  })

  if (!purchase) {
    return NextResponse.json(
      { error: 'Only verified buyers can review this book. Use the email you purchased with.' },
      { status: 403 }
    )
  }

  if (purchase.review) {
    return NextResponse.json(
      { error: 'You have already reviewed this book.' },
      { status: 409 }
    )
  }

  await db.bookReview.create({
    data: {
      bookSlug: params.slug,
      purchaseId: purchase.id,
      reviewerName: parsed.data.reviewerName,
      rating: parsed.data.rating,
      title: parsed.data.title || null,
      body: parsed.data.body,
    },
  })

  return NextResponse.json({
    status: 'pending',
    message: 'Thank you! Your review is being checked and will appear once approved.',
  })
}
