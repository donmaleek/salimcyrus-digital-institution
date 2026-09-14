import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { courseCheckoutRequestSchema, initializePaystackCourseCheckout } from '@/services/payments/paystack'

export async function POST(request: NextRequest) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY
  if (!secretKey) return NextResponse.json({ error: 'Online checkout is temporarily unavailable. Please use another payment method.' }, { status: 503 })
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId || !session?.user?.email) return NextResponse.json({ error: 'Sign in to buy this course.' }, { status: 401 })
  const parsed = courseCheckoutRequestSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  const course = await db.course.findUnique({ where: { id: parsed.data.courseId } })
  if (!course || course.status !== 'published' || course.priceKes <= 0) return NextResponse.json({ error: 'This course is not available for purchase.' }, { status: 404 })
  const path = `/academy/${course.kind === 'masterclass' ? 'masterclasses' : 'courses'}/${course.slug}`
  const callbackUrl = new URL(path, process.env.NEXT_PUBLIC_SITE_URL ?? request.nextUrl.origin).toString()
  try {
    const checkout = await initializePaystackCourseCheckout({ email: session.user.email, courseId: course.id, userId, slug: course.slug, title: course.title, priceKes: course.priceKes, secretKey, callbackUrl })
    console.info('Paystack course checkout initialized', { reference: checkout.reference, courseId: course.id, userId })
    return NextResponse.json(checkout)
  } catch (error) {
    console.error('Paystack course checkout failed to initialize', { courseId: course.id, error })
    return NextResponse.json({ error: 'Paystack could not start checkout. Please try again or use another method.' }, { status: 502 })
  }
}
