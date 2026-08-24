import type { Metadata } from 'next'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { Button } from '@/components/ui/Button'
import { formatDate } from '@/lib/utils/formatting'
import { programs } from '@/lib/data/programs'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'My Learning',
}

export default async function MyLearningPage() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id

  const bookings = userId
    ? await db.booking.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } })
    : []

  const programNames = new Set(programs.map((program) => program.name))
  const programBookings = bookings.filter((booking) => programNames.has(booking.offerName))

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-navy">My Learning</h1>
      <p className="mt-2 text-sm text-navy-500">
        Live programs and masterclasses you&apos;ve purchased. Self-paced recorded courses are
        still in development, so they won&apos;t appear here yet.
      </p>

      {programBookings.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-navy-200 bg-white p-10 text-center">
          <p className="text-navy-400">You haven&apos;t enrolled in any programs yet.</p>
          <Button href="/academy/masterclasses" className="mt-6">
            Browse Programs
          </Button>
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {programBookings.map((booking) => {
            const program = programs.find((p) => p.name === booking.offerName)
            return (
              <div
                key={booking.id}
                className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-navy-100 bg-white p-6"
              >
                <div>
                  <p className="font-heading font-semibold text-navy">{booking.offerName}</p>
                  <p className="mt-1 text-sm text-navy-400">
                    Purchased {formatDate(booking.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-navy-50 px-3 py-1 text-xs font-medium uppercase tracking-wide text-navy-500">
                    {booking.status}
                  </span>
                  {program && (
                    <Link
                      href={`/academy/masterclasses/${program.slug}`}
                      className="text-sm font-semibold text-gold-500 hover:underline"
                    >
                      View Program
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
