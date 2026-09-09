import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { programs } from '@/lib/data/programs'
import { getBookBySlug, getAvailableBooks } from '@/lib/data/book-catalog'
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

  const [bookings, purchases, teachingPurchases, profile] = userId
    ? await Promise.all([
        db.booking.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
        db.bookPurchase.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
        db.teachingPurchase.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }),
        db.user.findUnique({ where: { id: userId }, select: { profileImageData: true } }),
      ])
    : [[], [], [], null]

  const upcomingSessions = bookings.filter((b) => b.status === 'pending')
  const programNames = new Set(programs.map((p) => p.name))
  const activePrograms = new Set(
    bookings.filter((b) => programNames.has(b.offerName)).map((b) => b.offerName)
  ).size

  const stats = [
    { label: 'Books in your library', value: String(purchases.length), href: '/dashboard/my-books' },
    { label: 'Active programs', value: String(activePrograms + teachingPurchases.length), href: '/dashboard/my-learning' },
    { label: 'Upcoming sessions', value: String(upcomingSessions.length), href: '/dashboard/my-bookings' },
  ]

  const recentBooks = purchases.slice(0, 4)
  const recentBooksBySlug = new Map(
    (await Promise.all(recentBooks.map(async (p) => [p.bookSlug, await getBookBySlug(p.bookSlug)] as const)))
  )
  const ownedSlugs = new Set(purchases.map((p) => p.bookSlug))
  const recommended = (await getAvailableBooks()).filter((book) => !ownedSlugs.has(book.slug)).slice(0, 4)
  const nextSession = upcomingSessions[0]

  return (
    <div>
      <section className="relative overflow-hidden bg-navy px-6 py-8 text-white shadow-[0_24px_60px_rgba(15,30,48,0.14)] sm:px-9 sm:py-10">
        <div className="absolute inset-y-0 right-0 hidden w-2/5 bg-[radial-gradient(circle_at_80%_30%,rgba(212,175,55,0.2),transparent_55%)] sm:block" aria-hidden="true" />
        <div className="relative max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-gold-300">Your private client workspace</p>
          <h1 className="mt-3 text-balance font-heading text-3xl font-bold leading-tight sm:text-4xl">Good to see you{session?.user?.name ? `, ${session.user.name.split(' ')[0]}` : ''}.</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-300">Continue your learning, manage your sessions, and keep your work with Salim moving forward.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/book-now" className="inline-flex min-h-11 items-center rounded-full bg-gold px-6 text-sm font-bold text-navy transition-colors hover:bg-gold-300">Book a Session</Link>
            <Link href="/dashboard/my-learning" className="inline-flex min-h-11 items-center rounded-full border border-white/25 px-6 text-sm font-semibold text-white transition-colors hover:bg-white/10">Continue Learning</Link>
          </div>
        </div>
      </section>

      <div className="mt-7 grid border-y border-navy/10 bg-white sm:grid-cols-3">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="group flex items-center justify-between border-b border-navy/10 px-6 py-5 transition-colors hover:bg-gold-50 sm:border-b-0 sm:border-r last:border-0">
            <span><span className="block text-3xl font-bold tabular-nums text-navy">{stat.value}</span><span className="mt-1 block text-sm text-navy-500">{stat.label}</span></span>
            <span aria-hidden="true" className="text-xl text-gold-700 transition-transform group-hover:translate-x-1">→</span>
          </Link>
        ))}
      </div>

      {!profile?.profileImageData && <div className="mt-6 flex flex-col justify-between gap-4 border border-gold/30 bg-gold-50 px-5 py-4 sm:flex-row sm:items-center"><div><p className="font-semibold text-navy">Complete your client profile</p><p className="mt-1 text-sm text-navy-500">Add a profile photo so your account feels unmistakably yours.</p></div><Link href="/dashboard/my-account" className="text-sm font-bold text-gold-800 underline underline-offset-4">Add profile photo</Link></div>}

      {nextSession && (
        <div className="mt-6 border border-gold-300 bg-gold-50 p-6">
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

      <div className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-lg font-bold text-navy">Recently Purchased</h2>
          {purchases.length > 0 && (
            <Link href="/dashboard/my-books" className="text-sm font-semibold text-gold-600 hover:underline">
              View all
            </Link>
          )}
        </div>
        {recentBooks.length === 0 ? (
          <div className="mt-4 border border-dashed border-navy-200 bg-white p-8 sm:flex sm:items-center sm:justify-between sm:text-left">
            <div><p className="font-semibold text-navy">Build your private library</p><p className="mt-1 text-sm text-navy-500">Your purchased titles and fresh download links will appear here.</p></div>
            <Link href="/books" className="mt-3 inline-block text-sm font-semibold text-gold-600 hover:underline">
              Browse the catalog
            </Link>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-2 gap-x-5 gap-y-6 sm:grid-cols-4">
            {recentBooks.map((purchase) => {
              const book = recentBooksBySlug.get(purchase.bookSlug)
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
        <div className="mt-10 border-t border-navy-100 pt-8">
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
