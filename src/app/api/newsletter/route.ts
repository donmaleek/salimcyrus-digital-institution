import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'

const subscribeSchema = z.object({ email: z.string().email() })

export async function POST(request: NextRequest) {
  const body = await request.json()
  const parsed = subscribeSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
  }

  await db.newsletterSubscriber.upsert({
    where: { email: parsed.data.email },
    update: {},
    create: { email: parsed.data.email },
  })

  return NextResponse.json({ status: 'ok' })
}
