import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'
import { recordBookPurchase, createDownloadGrant, downloadUrlFor } from '@/services/payments/book-purchases'
import { recordTeachingPurchase } from '@/services/payments/teaching-purchases'
import { recordDonation } from '@/services/payments/donations'
import { recordCoachingPayment } from '@/services/payments/coaching-bookings'
import { enrollUser } from '@/services/courses/course-service'
import { sendEmail, bookDownloadEmailHtml } from '@/lib/api/email'

export type PaymentClaimOfferType = 'book' | 'teaching' | 'course' | 'donation' | 'coaching'

export interface SubmitPaymentClaimInput {
  offerType: PaymentClaimOfferType
  bookSlug?: string
  teachingId?: string
  courseId?: string
  coachingOfferName?: string
  userId?: string
  email: string
  name: string
  amountKes: number
  mpesaCode: string
  evidenceFileName?: string
}

export type SubmitPaymentClaimResult =
  | { status: 'created'; claimId: string }
  | { status: 'duplicate_code' }

/**
 * Records a buyer's self-reported Paybill payment as a pending claim.
 * Never grants access by itself: a claim only becomes a real purchase once
 * an admin reviews the M-Pesa code (and optional screenshot) and approves
 * it. mpesaCode is globally unique, a real M-Pesa confirmation code is
 * never reused, so a duplicate submission (honest resubmission or an
 * attempt to reuse someone else's code) is rejected here rather than
 * silently creating a second claim.
 */
export async function submitPaymentClaim(
  input: SubmitPaymentClaimInput
): Promise<SubmitPaymentClaimResult> {
  try {
    const claim = await db.paymentClaim.create({
      data: {
        offerType: input.offerType,
        bookSlug: input.bookSlug,
        teachingId: input.teachingId,
        courseId: input.courseId,
        coachingOfferName: input.coachingOfferName,
        userId: input.userId,
        email: input.email,
        name: input.name,
        amountKes: input.amountKes,
        mpesaCode: input.mpesaCode,
        evidenceFileName: input.evidenceFileName,
      },
    })
    return { status: 'created', claimId: claim.id }
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { status: 'duplicate_code' }
    }
    throw error
  }
}

export type ReviewPaymentClaimResult =
  | { status: 'approved' }
  | { status: 'rejected' }
  | { status: 'not_found' }
  | { status: 'already_reviewed' }
  | { status: 'offer_missing' }

export async function approvePaymentClaim(
  claimId: string,
  reviewerEmail: string
): Promise<ReviewPaymentClaimResult> {
  const claim = await db.paymentClaim.findUnique({ where: { id: claimId } })
  if (!claim) return { status: 'not_found' }
  if (claim.status !== 'pending') return { status: 'already_reviewed' }

  const amountKobo = claim.amountKes * 100

  if (claim.offerType === 'book') {
    if (!claim.bookSlug) return { status: 'offer_missing' }
    const result = await recordBookPurchase({
      slug: claim.bookSlug,
      reference: claim.mpesaCode,
      provider: 'paybill',
      amountKobo,
      currency: 'KES',
      email: claim.email,
      name: claim.name,
    })
    if (!result) return { status: 'offer_missing' }

    if (result.isNew) {
      const { rawToken, expiresAt } = await createDownloadGrant(result.purchaseId)
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
      const downloadUrl = downloadUrlFor(rawToken, siteUrl)

      const emailResult = await sendEmail({
        to: claim.email,
        subject: `Your download: ${result.book.title}`,
        html: bookDownloadEmailHtml({ bookTitle: result.book.title, downloadUrl, expiresAt }),
      })
      if (emailResult.sent) {
        await db.bookPurchase.update({
          where: { id: result.purchaseId },
          data: { emailSentAt: new Date() },
        })
      } else {
        console.warn('Paybill book approval: email not sent (buyer can still use My Books to download)', {
          reference: claim.mpesaCode,
          reason: emailResult.reason,
        })
      }
    }
  } else if (claim.offerType === 'teaching') {
    if (!claim.teachingId || !claim.userId) return { status: 'offer_missing' }
    const result = await recordTeachingPurchase({
      teachingId: claim.teachingId,
      reference: claim.mpesaCode,
      provider: 'paybill',
      amountKobo,
      currency: 'KES',
      userId: claim.userId,
      email: claim.email,
      name: claim.name,
    })
    if (!result) return { status: 'offer_missing' }
  } else if (claim.offerType === 'course') {
    if (!claim.courseId || !claim.userId) return { status: 'offer_missing' }
    const course = await db.course.findUnique({ where: { id: claim.courseId } })
    if (!course) return { status: 'offer_missing' }
    await enrollUser(course.id, claim.userId, claim.mpesaCode, 'paybill', amountKobo, 'KES')
  } else if (claim.offerType === 'coaching') {
    if (!claim.coachingOfferName) return { status: 'offer_missing' }
    await recordCoachingPayment({
      offerName: claim.coachingOfferName,
      reference: claim.mpesaCode,
      provider: 'paybill',
      amountMinor: amountKobo,
      currency: 'KES',
      email: claim.email,
      name: claim.name,
      userId: claim.userId ?? undefined,
    })
  } else {
    await recordDonation({
      reference: claim.mpesaCode,
      provider: 'paybill',
      amountMinor: amountKobo,
      currency: 'KES',
      email: claim.email,
      name: claim.name,
    })
  }

  await db.paymentClaim.update({
    where: { id: claimId },
    data: { status: 'approved', reviewedAt: new Date(), reviewedByEmail: reviewerEmail },
  })
  return { status: 'approved' }
}

export async function rejectPaymentClaim(
  claimId: string,
  reviewerEmail: string,
  adminNotes?: string
): Promise<ReviewPaymentClaimResult> {
  const claim = await db.paymentClaim.findUnique({ where: { id: claimId } })
  if (!claim) return { status: 'not_found' }
  if (claim.status !== 'pending') return { status: 'already_reviewed' }

  await db.paymentClaim.update({
    where: { id: claimId },
    data: { status: 'rejected', reviewedAt: new Date(), reviewedByEmail: reviewerEmail, adminNotes },
  })
  return { status: 'rejected' }
}
