import { db } from '@/lib/db'
import { recordBookPurchase, createDownloadGrant, downloadUrlFor } from '@/services/payments/book-purchases'
import { recordTeachingPurchase } from '@/services/payments/teaching-purchases'
import { recordDonation } from '@/services/payments/donations'
import { recordCoachingPayment } from '@/services/payments/coaching-bookings'
import { enrollUser } from '@/services/courses/course-service'
import { recordJournalSubscription } from '@/services/payments/journal-subscriptions'
import { sendEmail, bookDownloadEmailHtml } from '@/lib/api/email'

export type PaymentClaimOfferType = 'book' | 'teaching' | 'course' | 'journal' | 'donation' | 'coaching'

// Paybill checkout (and the submission flow that created a pending
// PaymentClaim from a buyer-entered M-Pesa code) was removed in favor of
// Paystack and PayPal everywhere. approvePaymentClaim/rejectPaymentClaim
// below stay fully intact so claims submitted before the removal can still
// be reviewed; only the creation path (submitPaymentClaim) is gone.

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
  } else if (claim.offerType === 'journal') {
    if (!claim.userId) return { status: 'offer_missing' }
    await recordJournalSubscription({
      userId: claim.userId,
      reference: claim.mpesaCode,
      provider: 'paybill',
      amountMinor: amountKobo,
      currency: 'KES',
    })
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
