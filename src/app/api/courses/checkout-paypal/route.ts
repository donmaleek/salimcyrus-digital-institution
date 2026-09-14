import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { createPayPalOrder, getPayPalAccessToken } from '@/lib/api/paypal'

const schema = z.object({ courseId: z.string().trim().min(1).max(200) })
export async function POST(request: NextRequest) {
  const clientId = process.env.PAYPAL_CLIENT_ID; const secret = process.env.PAYPAL_CLIENT_SECRET
  if (!clientId || !secret) return NextResponse.json({ error: 'PayPal checkout is temporarily unavailable. Please use another payment method.' }, { status: 503 })
  const session = await getServerSession(authOptions); const userId = (session?.user as { id?: string } | undefined)?.id
  if (!userId || !session?.user?.email) return NextResponse.json({ error: 'Sign in to buy this course.' }, { status: 401 })
  const parsed = schema.safeParse(await request.json().catch(() => null)); if (!parsed.success) return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  const course = await db.course.findUnique({ where: { id: parsed.data.courseId } })
  if (!course || course.status !== 'published' || course.priceUsd <= 0) return NextResponse.json({ error: 'This course is not available for purchase.' }, { status: 404 })
  const path = `/academy/${course.kind === 'masterclass' ? 'masterclasses' : 'courses'}/${course.slug}`
  const returnUrl = new URL(path, process.env.NEXT_PUBLIC_SITE_URL ?? request.nextUrl.origin).toString()
  try {
    const accessToken = await getPayPalAccessToken(clientId, secret)
    const order = await createPayPalOrder({ amountUsd: course.priceUsd, description: `${course.title}, by Salim Cyrus`, referenceId: `course:${course.id}:${userId}`, returnUrl, cancelUrl: returnUrl, accessToken })
    console.info('PayPal course checkout initialized', { orderId: order.id, courseId: course.id, userId })
    return NextResponse.json({ approvalUrl: order.approveUrl })
  } catch (error) {
    console.error('PayPal course checkout failed to initialize', { courseId: course.id, error })
    return NextResponse.json({ error: 'PayPal could not start checkout. Please try again or use another method.' }, { status: 502 })
  }
}
