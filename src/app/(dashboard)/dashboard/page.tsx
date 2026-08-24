import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { programs } from '@/lib/data/programs'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Dashboard',
}

export default async function DashboardOverviewPage() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id

  const bookings = userId
    ? await db.booking.findMany({ where: { userId } })
    : []

  const upcomingSessions = bookings.filter((b) => b.status === 'pending').length
  const programNames = new Set(programs.map((p) => p.name))
  const activePrograms = new Set(
    bookings.filter((b) => programNames.has(b.offerName)).map((b) => b.offerName)
  ).size

  const stats = [
    { label: 'Active Programs', value: String(activePrograms) },
    { label: 'Upcoming Sessions', value: String(upcomingSessions) },
  ]

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-navy">
        Welcome Back{session?.user?.name ? `, ${session.user.name}` : ''}
      </h1>
      <p className="mt-2 text-navy-500">Your learning and bookings, at a glance.</p>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-navy-100 bg-white p-6">
            <p className="text-3xl font-bold text-navy-300">{stat.value}</p>
            <p className="mt-2 text-sm text-navy-500">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
