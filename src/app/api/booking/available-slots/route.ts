import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  const slots = await db.availabilitySlot.findMany({
    where: { isBooked: false, startTime: { gt: new Date() } },
    orderBy: { startTime: 'asc' },
    select: { id: true, startTime: true, durationMinutes: true },
  })

  return NextResponse.json({ slots })
}
