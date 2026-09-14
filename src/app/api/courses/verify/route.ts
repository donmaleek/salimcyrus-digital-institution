import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { verifyPaystackTransaction } from '@/lib/api/paystack'
import { db } from '@/lib/db'
import { courseOfferName } from '@/services/payments/paystack'
import { enrollUser } from '@/services/courses/course-service'

export async function GET(request: NextRequest) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY
  if (!secretKey) return NextResponse.json({ error: 'Payment verification is unavailable.' }, { status: 503 })
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) return NextResponse.json({ error: 'Sign in to complete this purchase.' }, { status: 401 })
  const reference = request.nextUrl.searchParams.get('reference'); const courseId = request.nextUrl.searchParams.get('courseId')
  if (!reference || !courseId) return NextResponse.json({ error: 'Missing payment reference.' }, { status: 400 })
  const course = await db.course.findUnique({ where: { id: courseId } })
  if (!course) return NextResponse.json({ error: 'Unknown course.' }, { status: 404 })
  const verification = await verifyPaystackTransaction(reference, secretKey); const data = verification.data
  if (!verification.status || !data || data.status !== 'success') return NextResponse.json({ error: 'Payment was not completed.' }, { status: 402 })
  if (data.metadata?.offer_name !== courseOfferName(course.slug) || data.metadata?.user_id !== userId) return NextResponse.json({ error: 'This payment does not match this course or account.' }, { status: 403 })
  if (data.amount !== course.priceKes * 100) return NextResponse.json({ error: 'The payment amount does not match this course.' }, { status: 403 })
  const enrollment = await enrollUser(course.id, userId, reference, 'paystack', data.amount, 'KES')
  console.info('Course enrollment granted', { courseId: course.id, userId, provider: 'paystack', enrollmentId: enrollment.id })
  return NextResponse.json({ status: 'confirmed', courseTitle: course.title, learnUrl: `/dashboard/my-learning/courses/${course.slug}` })
}
