import { NextRequest, NextResponse } from 'next/server'
import { mkdirSync, writeFileSync } from 'fs'
import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { getBookBySlug } from '@/lib/data/book-catalog'
import { coachingOffers } from '@/lib/data/coaching-offers'
import { submitPaymentClaim } from '@/services/payments/payment-claims'
import { evidenceStorageDir, evidenceFilePath } from '@/lib/api/payment-evidence-storage'

const ALLOWED_EVIDENCE_TYPES: Record<string, string> = {
  'image/webp': 'webp',
  'image/jpeg': 'jpg',
  'image/png': 'png',
}
const MAX_EVIDENCE_BYTES = 8 * 1024 * 1024 // 8MB, a phone screenshot easily fits

const metaSchema = z.object({
  offerType: z.enum(['book', 'teaching', 'donation', 'coaching']),
  bookSlug: z.string().trim().max(200).optional(),
  teachingId: z.string().trim().max(200).optional(),
  coachingOfferName: z.string().trim().max(200).optional(),
  mpesaCode: z
    .string()
    .trim()
    .min(6)
    .max(20)
    .regex(/^[A-Za-z0-9]+$/, 'M-Pesa codes are letters and numbers only'),
  amountKes: z.coerce.number().int().min(1).max(1_000_000).optional(),
  email: z.string().trim().email().optional(),
  name: z.string().trim().min(1).max(200).optional(),
})

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  const sessionUserId = (session?.user as { id?: string } | undefined)?.id
  const sessionEmail = session?.user?.email ?? null
  const sessionName = session?.user?.name ?? null

  const form = await request.formData().catch(() => null)
  if (!form) {
    return NextResponse.json({ error: 'Invalid form submission.' }, { status: 400 })
  }

  const parsed = metaSchema.safeParse({
    offerType: form.get('offerType'),
    bookSlug: form.get('bookSlug') ?? undefined,
    teachingId: form.get('teachingId') ?? undefined,
    coachingOfferName: form.get('coachingOfferName') ?? undefined,
    mpesaCode: form.get('mpesaCode'),
    amountKes: form.get('amountKes') ?? undefined,
    email: form.get('email') ?? undefined,
    name: form.get('name') ?? undefined,
  })
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? 'Fill in a valid M-Pesa code.' },
      { status: 400 }
    )
  }
  const data = parsed.data
  const mpesaCode = data.mpesaCode.toUpperCase()

  let email: string
  let name: string
  let userId: string | undefined
  let amountKes: number
  let bookSlug: string | undefined
  let teachingId: string | undefined
  let coachingOfferName: string | undefined

  if (data.offerType === 'book') {
    if (!sessionUserId || !sessionEmail) {
      return NextResponse.json({ error: 'Sign in to buy this book.' }, { status: 401 })
    }
    if (!data.bookSlug) {
      return NextResponse.json({ error: 'Missing book.' }, { status: 400 })
    }
    const book = await getBookBySlug(data.bookSlug)
    if (!book || book.status !== 'available' || !book.priceKes || !book.fileName) {
      return NextResponse.json({ error: 'This book is not available for purchase.' }, { status: 404 })
    }
    email = sessionEmail
    name = sessionName ?? sessionEmail
    userId = sessionUserId
    amountKes = book.priceKes
    bookSlug = book.slug
  } else if (data.offerType === 'teaching') {
    if (!sessionUserId || !sessionEmail) {
      return NextResponse.json({ error: 'Sign in to buy this teaching.' }, { status: 401 })
    }
    if (!data.teachingId) {
      return NextResponse.json({ error: 'Missing teaching.' }, { status: 400 })
    }
    const teaching = await db.teaching.findUnique({ where: { id: data.teachingId } })
    if (!teaching || teaching.status !== 'published') {
      return NextResponse.json({ error: 'This teaching is not available for purchase.' }, { status: 404 })
    }
    email = sessionEmail
    name = sessionName ?? sessionEmail
    userId = sessionUserId
    amountKes = teaching.priceKes
    teachingId = teaching.id
  } else if (data.offerType === 'coaching') {
    if (!data.coachingOfferName) {
      return NextResponse.json({ error: 'Missing session.' }, { status: 400 })
    }
    const offer = coachingOffers.find((o) => o.name === data.coachingOfferName)
    if (!offer) {
      return NextResponse.json({ error: 'This session is not available for booking.' }, { status: 404 })
    }
    email = data.email ?? sessionEmail ?? ''
    name = data.name ?? sessionName ?? ''
    if (!email || !name) {
      return NextResponse.json({ error: 'Enter your name and email.' }, { status: 400 })
    }
    userId = sessionUserId
    amountKes = offer.priceKes
    coachingOfferName = offer.name
  } else {
    if (!data.amountKes) {
      return NextResponse.json({ error: 'Enter the amount you paid.' }, { status: 400 })
    }
    email = data.email ?? sessionEmail ?? ''
    name = data.name ?? sessionName ?? ''
    if (!email || !name) {
      return NextResponse.json({ error: 'Enter your name and email.' }, { status: 400 })
    }
    userId = sessionUserId
    amountKes = data.amountKes
  }

  let evidenceFileName: string | undefined
  const evidenceFile = form.get('evidence')
  if (evidenceFile instanceof File && evidenceFile.size > 0) {
    const ext = ALLOWED_EVIDENCE_TYPES[evidenceFile.type]
    if (!ext) {
      return NextResponse.json({ error: 'Evidence must be a WebP, JPEG, or PNG image.' }, { status: 400 })
    }
    if (evidenceFile.size > MAX_EVIDENCE_BYTES) {
      return NextResponse.json({ error: 'Evidence image is too large.' }, { status: 413 })
    }
    evidenceFileName = `${mpesaCode}-${Date.now()}.${ext}`
    mkdirSync(evidenceStorageDir(), { recursive: true })
    const buffer = Buffer.from(await evidenceFile.arrayBuffer())
    writeFileSync(evidenceFilePath(evidenceFileName), buffer)
  }

  const result = await submitPaymentClaim({
    offerType: data.offerType,
    bookSlug,
    teachingId,
    coachingOfferName,
    userId,
    email,
    name,
    amountKes,
    mpesaCode,
    evidenceFileName,
  })

  if (result.status === 'duplicate_code') {
    return NextResponse.json(
      { error: 'This M-Pesa code has already been submitted. Contact support if this is a mistake.' },
      { status: 409 }
    )
  }

  return NextResponse.json({ status: 'pending', claimId: result.claimId })
}
