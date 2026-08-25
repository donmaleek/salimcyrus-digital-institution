import type { Metadata } from 'next'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { Button } from '@/components/ui/Button'
import { formatDate } from '@/lib/utils/formatting'

export const metadata: Metadata = {
  title: 'My Bookings',
}

export default async function MyBookingsPage() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id

  const bookings = userId
    ? await db.booking.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } })
    : []

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-navy">My Bookings</h1>

      {bookings.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-navy-200 bg-white p-10 text-center">
          <p className="text-navy-400">You have no upcoming coaching sessions.</p>
          <Button href="/work-with-salim/coaching" className="mt-6">
            Book a Session
          </Button>
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {bookings.map((booking) => (
            <Link
              key={booking.id}
              href={`/dashboard/my-bookings/${booking.id}`}
              className="block rounded-2xl border border-navy-100 bg-white p-6 transition-shadow hover:shadow-lg"
            >
              <div className="flex items-center justify-between">
                <p className="font-heading font-semibold text-navy">{booking.offerName}</p>
                <span className="rounded-full bg-navy-50 px-3 py-1 text-xs font-medium uppercase tracking-wide text-navy-500">
                  {booking.status}
                </span>
              </div>
              <p className="mt-1 text-sm text-navy-400">{formatDate(booking.createdAt)}</p>
              {booking.status === 'paid' && (
                <p className="mt-3 text-sm font-semibold text-gold-600">
                  Payment received. Open this booking to choose a time.
                </p>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
