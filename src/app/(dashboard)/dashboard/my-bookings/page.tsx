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
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-700">Time with Salim</p>
      <div className="mt-2 flex flex-col justify-between gap-4 sm:flex-row sm:items-end"><div><h1 className="font-heading text-3xl font-bold text-navy sm:text-4xl">My Bookings</h1><p className="mt-3 max-w-2xl text-base leading-7 text-navy-500">Review your coaching engagements, payment status, and scheduling details.</p></div><Button href="/book-now" size="sm">Book Session Now</Button></div>

      {bookings.length === 0 ? (
        <div className="mt-8 border border-dashed border-navy-200 bg-white p-8 sm:p-10">
          <p className="font-heading text-xl font-bold text-navy">Make space for your next breakthrough.</p>
          <p className="mt-2 max-w-xl text-navy-500">Choose the session that matches the decision, transition, or growth edge in front of you.</p>
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
              className="block border border-navy/10 bg-white p-6 shadow-[0_12px_32px_rgba(15,30,48,0.04)] transition-shadow hover:shadow-lg"
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
