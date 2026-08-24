import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { notFound } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { Button } from '@/components/ui/Button'
import { formatDate } from '@/lib/utils/formatting'
import { WHATSAPP_URL } from '@/lib/utils/constants'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Booking Confirmation',
}

function formatSlotTime(date: Date, durationMinutes: number): string {
  return `${date.toLocaleString('en-KE', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })} (${durationMinutes} min)`
}

export default async function BookingConfirmationPage({
  params,
}: {
  params: { 'booking-id': string }
}) {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id

  const booking = userId
    ? await db.booking.findFirst({
        where: { id: params['booking-id'], userId },
        include: { slot: true },
      })
    : null

  if (!booking) {
    notFound()
  }

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-navy">Booking Confirmation</h1>
      <div className="mt-8 max-w-xl rounded-2xl border border-navy-100 bg-white p-8">
        <div className="flex items-center justify-between">
          <p className="font-heading text-xl font-semibold text-navy">{booking.offerName}</p>
          <span className="rounded-full bg-navy-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-navy-500">
            {booking.status}
          </span>
        </div>

        <dl className="mt-6 space-y-4 border-t border-navy-100 pt-6">
          <div>
            <dt className="text-xs font-bold uppercase tracking-wide text-navy-400">Booked</dt>
            <dd className="mt-1 text-navy-700">{formatDate(booking.createdAt)}</dd>
          </div>
          {booking.slot && (
            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-navy-400">
                Scheduled Time
              </dt>
              <dd className="mt-1 text-navy-700">
                {formatSlotTime(booking.slot.startTime, booking.slot.durationMinutes)}
              </dd>
            </div>
          )}
          {booking.notes && (
            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-navy-400">Notes</dt>
              <dd className="mt-1 text-navy-700">{booking.notes}</dd>
            </div>
          )}
        </dl>

        {booking.status === 'pending' && (
          <p className="mt-6 border-t border-navy-100 pt-6 text-sm text-navy-500">
            This booking is awaiting confirmation. If you have already paid and this still shows
            pending, message us on WhatsApp with your payment reference.
          </p>
        )}

        <div className="mt-6 flex flex-wrap gap-4 border-t border-navy-100 pt-6">
          <Button href={WHATSAPP_URL} size="sm">
            Message on WhatsApp
          </Button>
          <Button href="/dashboard/my-bookings" variant="outline" size="sm">
            Back to My Bookings
          </Button>
        </div>
      </div>
    </div>
  )
}
