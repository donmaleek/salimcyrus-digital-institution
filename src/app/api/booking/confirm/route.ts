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
  slotId: z.string().optional(),
})

export async function POST(request: NextRequest) {
  const body = await request.json()
  const parsed = bookingSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  const { slotId, ...data } = parsed.data

  try {
    const booking = await db.$transaction(async (tx) => {
      if (slotId) {
        const slot = await tx.availabilitySlot.findUnique({ where: { id: slotId } })
        if (!slot || slot.isBooked) {
          throw new Error('SLOT_UNAVAILABLE')
        }
        await tx.availabilitySlot.update({ where: { id: slotId }, data: { isBooked: true } })
      }

      return tx.booking.create({ data: { ...data, userId, slotId } })
    })

    return NextResponse.json({ booking }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'SLOT_UNAVAILABLE') {
      return NextResponse.json({ error: 'That time slot is no longer available.' }, { status: 409 })
    }
    throw error
  }
}
