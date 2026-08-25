import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { requireCrmApi } from '@/services/crm/access'
import { isBookableStart, slotEnd, slotsOverlap } from '@/services/bookings/availability'

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

  const body = await request.json().catch(() => null)
  const parsed = createSlotSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
  }

  const startTime = new Date(parsed.data.startTime)
  if (!isBookableStart(startTime)) {
    return NextResponse.json({ error: 'Choose a time at least five minutes in the future.' }, { status: 400 })
  }

  try {
    const slot = await db.$transaction(async (tx) => {
      const candidate = { startTime, durationMinutes: parsed.data.durationMinutes }
      const possibleConflicts = await tx.availabilitySlot.findMany({
        where: { startTime: { lt: slotEnd(candidate) } },
        select: { startTime: true, durationMinutes: true },
      })
      if (possibleConflicts.some((existing) => slotsOverlap(candidate, existing))) {
        throw new Error('SLOT_OVERLAP')
      }
      const created = await tx.availabilitySlot.create({ data: candidate })
      await tx.crmAuditEvent.create({
        data: {
          action: 'create',
          entityType: 'AvailabilitySlot',
          entityId: created.id,
          summary: `Opened ${startTime.toISOString()} for booking`,
          after: { startTime: startTime.toISOString(), durationMinutes: parsed.data.durationMinutes },
        },
      })
      return created
    }, { isolationLevel: 'Serializable' })

    return NextResponse.json({ slot }, { status: 201 })
  } catch (error) {
    if (error instanceof Error && error.message === 'SLOT_OVERLAP') {
      return NextResponse.json({ error: 'That time overlaps an existing availability slot.' }, { status: 409 })
    }
    throw error
  }
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

  const deleted = await db.$transaction(async (tx) => {
    const result = await tx.availabilitySlot.deleteMany({ where: { id: slotId, isBooked: false } })
    if (result.count !== 1) return false
    await tx.crmAuditEvent.create({
      data: {
        action: 'delete',
        entityType: 'AvailabilitySlot',
        entityId: slotId,
        summary: `Removed availability at ${slot.startTime.toISOString()}`,
        before: { startTime: slot.startTime.toISOString(), durationMinutes: slot.durationMinutes },
      },
    })
    return true
  })
  if (!deleted) {
    return NextResponse.json({ error: 'Cannot remove a booked slot' }, { status: 409 })
  }
  return NextResponse.json({ status: 'ok' })
}
