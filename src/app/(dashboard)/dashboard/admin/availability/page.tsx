import type { Metadata } from 'next'
import { db } from '@/lib/db'
import { AvailabilityManager } from '@/components/dashboard/AvailabilityManager'
import { requireCrmPage } from '@/services/crm/access'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Manage Availability',
}

export default async function AdminAvailabilityPage() {
  await requireCrmPage('bookings:write')

  const slots = await db.availabilitySlot.findMany({
    orderBy: { startTime: 'asc' },
    include: { booking: { select: { name: true, email: true, offerName: true } } },
  })

  return (
    <div>
      <div className="rounded-3xl bg-navy px-6 py-8 text-white sm:px-10">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold">Schedule control</p>
        <h1 className="mt-3 font-heading text-3xl font-bold">Availability</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70">Open coaching sessions, see confirmed clients, and keep Salim&apos;s calendar ready for the work that matters.</p>
      </div>
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
