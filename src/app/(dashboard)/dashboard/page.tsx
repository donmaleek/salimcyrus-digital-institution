import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { programs } from '@/lib/data/programs'
import { books } from '@/lib/data/books'
import { formatCurrency } from '@/lib/utils/currency'
import { formatDate } from '@/lib/utils/formatting'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Dashboard',
}

export default async function DashboardOverviewPage() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  const isAdmin = (session?.user as { isAdmin?: boolean } | undefined)?.isAdmin === true
  if (isAdmin) redirect('/dashboard/admin/crm')

  const [bookings, purchases] = userId
    ? await Promise.all([
        db.booking.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
        db.bookPurchase.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
      ])
    : [[], []]

  const upcomingSessions = bookings.filter((b) => b.status === 'pending')
  const programNames = new Set(programs.map((p) => p.name))
  const activePrograms = new Set(
    bookings.filter((b) => programNames.has(b.offerName)).map((b) => b.offerName)
  ).size

  const stats = [
    { label: 'Books Owned', value: String(purchases.length) },
    { label: 'Active Programs', value: String(activePrograms) },
    { label: 'Upcoming Sessions', value: String(upcomingSessions.length) },
  ]

  const recentBooks = purchases.slice(0, 4)
  const ownedSlugs = new Set(purchases.map((p) => p.bookSlug))
  const recommended = books
    .filter((book) => book.status === 'available' && !ownedSlugs.has(book.slug))
    .slice(0, 4)
  const nextSession = upcomingSessions[0]

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-navy">
        Welcome Back{session?.user?.name ? `, ${session.user.name}` : ''}
      </h1>
      <p className="mt-2 text-navy-500">Your books, sessions, and learning, at a glance.</p>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-navy-100 bg-white p-6">
            <p className="text-3xl font-bold text-navy-300">{stat.value}</p>
            <p className="mt-2 text-sm text-navy-500">{stat.label}</p>
          </div>
        ))}
      </div>

      {nextSession && (
        <div className="mt-8 rounded-2xl border border-gold-200 bg-gold-50 p-6">
          <p className="text-xs font-bold uppercase tracking-wide text-gold-600">Next Up</p>
          <p className="mt-2 font-heading text-lg font-semibold text-navy">{nextSession.offerName}</p>
          <p className="mt-1 text-sm text-navy-500">
            Booked {formatDate(nextSession.createdAt)}
          </p>
          <Link
            href={`/dashboard/my-bookings/${nextSession.id}`}
            className="mt-3 inline-block text-sm font-semibold text-navy underline"
          >
            View booking
          </Link>
        </div>
      )}

      <div className="mt-12">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-bold text-navy">Recently Purchased</h2>
          {purchases.length > 0 && (
            <Link href="/dashboard/my-books" className="text-sm font-semibold text-gold-600 hover:underline">
              View all
            </Link>
          )}
        </div>
        {recentBooks.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-navy-200 bg-white p-8 text-center">
            <p className="text-navy-400">No books purchased yet.</p>
            <Link href="/books" className="mt-3 inline-block text-sm font-semibold text-gold-600 hover:underline">
              Browse the catalog
            </Link>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-x-5 gap-y-6 sm:grid-cols-4">
            {recentBooks.map((purchase) => {
              const book = books.find((b) => b.slug === purchase.bookSlug)
              return (
                <Link
                  key={purchase.id}
                  href="/dashboard/my-books"
                  className="group block"
                >
                  <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-navy-50">
                    {book?.cover && (
                      <Image
                        src={book.cover}
                        alt={`${book?.title ?? purchase.bookSlug} cover`}
                        fill
                        sizes="(min-width: 640px) 25vw, 45vw"
                        className="object-cover transition group-hover:scale-[1.03]"
                      />
                    )}
                  </div>
                  <p className="mt-2 line-clamp-2 text-sm font-semibold text-navy group-hover:underline">
                    {book?.title ?? purchase.bookSlug}
                  </p>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {recommended.length > 0 && (
        <div className="mt-12 border-t border-navy-100 pt-8">
          <h2 className="font-heading text-lg font-bold text-navy">Recommended For You</h2>
          <div className="mt-4 grid grid-cols-2 gap-x-5 gap-y-6 sm:grid-cols-4">
            {recommended.map((book) => (
              <Link key={book.slug} href={`/books/${book.slug}`} className="group block">
                <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-navy-50">
                  {book.cover && (
                    <Image
                      src={book.cover}
                      alt={`${book.title} cover`}
                      fill
                      sizes="(min-width: 640px) 25vw, 45vw"
                      className="object-cover transition group-hover:scale-[1.03]"
                    />
                  )}
                </div>
                <p className="mt-2 line-clamp-2 text-sm font-semibold text-navy group-hover:underline">
                  {book.title}
                </p>
                <p className="mt-0.5 text-sm text-navy-500">{formatCurrency(book.priceKes)}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
