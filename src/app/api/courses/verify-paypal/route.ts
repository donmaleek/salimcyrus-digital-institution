import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { capturePayPalOrder, getPayPalAccessToken } from '@/lib/api/paypal'
import { db } from '@/lib/db'
import { enrollUser } from '@/services/courses/course-service'

export async function GET(request: NextRequest) {
  const clientId = process.env.PAYPAL_CLIENT_ID; const secret = process.env.PAYPAL_CLIENT_SECRET
  if (!clientId || !secret) return NextResponse.json({ error: 'PayPal verification is unavailable.' }, { status: 503 })
  const session = await getServerSession(authOptions); const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId) return NextResponse.json({ error: 'Sign in to complete this purchase.' }, { status: 401 })
  const orderId = request.nextUrl.searchParams.get('token'); const courseId = request.nextUrl.searchParams.get('courseId')
  if (!orderId || !courseId) return NextResponse.json({ error: 'Missing PayPal order reference.' }, { status: 400 })
  const course = await db.course.findUnique({ where: { id: courseId } }); if (!course) return NextResponse.json({ error: 'Unknown course.' }, { status: 404 })
  try {
    const captured = await capturePayPalOrder(orderId, await getPayPalAccessToken(clientId, secret))
    if (captured.status !== 'COMPLETED') return NextResponse.json({ error: 'PayPal payment was not completed.' }, { status: 402 })
    if (captured.referenceId !== `course:${courseId}:${userId}`) return NextResponse.json({ error: 'This payment does not match this course or account.' }, { status: 403 })
    if (captured.currencyCode !== 'USD' || Math.round(parseFloat(captured.amountValue) * 100) !== course.priceUsd * 100) return NextResponse.json({ error: 'The payment amount does not match this course.' }, { status: 403 })
    const enrollment = await enrollUser(course.id, userId, captured.captureId, 'paypal', Math.round(parseFloat(captured.amountValue) * 100), 'USD')
    console.info('Course enrollment granted', { courseId: course.id, userId, provider: 'paypal', enrollmentId: enrollment.id })
    return NextResponse.json({ status: 'confirmed', courseTitle: course.title, learnUrl: `/dashboard/my-learning/courses/${course.slug}` })
  } catch {
    return NextResponse.json({ error: 'PayPal payment was not completed.' }, { status: 402 })
  }
}
