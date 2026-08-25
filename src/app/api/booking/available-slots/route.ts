import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Availability is live operational data and must never be evaluated at build time.
export const dynamic = 'force-dynamic'

export async function GET() {
  const slots = await db.availabilitySlot.findMany({
    where: { isBooked: false, startTime: { gt: new Date() } },
    orderBy: { startTime: 'asc' },
    select: { id: true, startTime: true, durationMinutes: true },
  })

  return NextResponse.json({ slots })
}
