import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

const bookingSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  offerName: z.string().min(1),
  notes: z.string().optional(),
})

export async function POST(request: NextRequest) {
  const body = await request.json()
  const parsed = bookingSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id

  const booking = await db.booking.create({
    data: { ...parsed.data, userId },
  })

  return NextResponse.json({ booking }, { status: 201 })
}
