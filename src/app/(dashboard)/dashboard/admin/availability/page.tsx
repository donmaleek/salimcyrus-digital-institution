import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { AvailabilityManager } from '@/components/dashboard/AvailabilityManager'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Manage Availability',
}

export default async function AdminAvailabilityPage() {
  const session = await getServerSession(authOptions)
  const isAdmin = (session?.user as { isAdmin?: boolean } | undefined)?.isAdmin === true

  if (!isAdmin) {
    redirect('/dashboard')
  }

  const slots = await db.availabilitySlot.findMany({
    orderBy: { startTime: 'asc' },
    include: { booking: { select: { name: true, email: true, offerName: true } } },
  })

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-navy">Manage Availability</h1>
      <p className="mt-2 max-w-2xl text-sm text-navy-500">
        Open coaching time slots for customers to book. Slots someone has already booked can&apos;t
        be removed here — cancel the booking with them first, then delete it from the database if
        needed.
      </p>
      <div className="mt-8">
        <AvailabilityManager
          initialSlots={slots.map((slot) => ({
            id: slot.id,
            startTime: slot.startTime.toISOString(),
            durationMinutes: slot.durationMinutes,
            isBooked: slot.isBooked,
            booking: slot.booking,
          }))}
        />
      </div>
    </div>
  )
}
