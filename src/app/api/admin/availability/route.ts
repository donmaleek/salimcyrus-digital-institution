import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireCrmApi } from '@/services/crm/access'

export async function GET() {
  if (!(await requireCrmApi('bookings:write'))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const slots = await db.availabilitySlot.findMany({
    orderBy: { startTime: 'asc' },
    include: { booking: { select: { name: true, email: true, offerName: true } } },
  })

  return NextResponse.json({ slots })
}

const createSlotSchema = z.object({
  startTime: z.string().datetime(),
  durationMinutes: z.number().int().min(15).max(480),
})

export async function POST(request: NextRequest) {
  if (!(await requireCrmApi('bookings:write'))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const parsed = createSlotSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const slot = await db.availabilitySlot.create({
    data: { startTime: new Date(parsed.data.startTime), durationMinutes: parsed.data.durationMinutes },
  })

  return NextResponse.json({ slot }, { status: 201 })
}

export async function DELETE(request: NextRequest) {
  if (!(await requireCrmApi('bookings:write'))) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const slotId = request.nextUrl.searchParams.get('id')
  if (!slotId) {
    return NextResponse.json({ error: 'Missing slot id' }, { status: 400 })
  }

  const slot = await db.availabilitySlot.findUnique({ where: { id: slotId } })
  if (!slot) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  if (slot.isBooked) {
    return NextResponse.json({ error: 'Cannot remove a booked slot' }, { status: 409 })
  }

  await db.availabilitySlot.delete({ where: { id: slotId } })
  return NextResponse.json({ status: 'ok' })
}
