import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { books } from '@/lib/data/books'
import { Button } from '@/components/ui/Button'
import { DownloadBookButton } from '@/components/dashboard/DownloadBookButton'
import { formatCurrency } from '@/lib/utils/currency'
import { formatDate } from '@/lib/utils/formatting'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'My Books',
}

export default async function MyBooksPage() {
  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id

  const purchases = userId
    ? await db.bookPurchase.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } })
    : []

  const ownedSlugs = new Set(purchases.map((p) => p.bookSlug))
  const recommended = books
    .filter((book) => book.status === 'available' && !ownedSlugs.has(book.slug))
    .slice(0, 4)

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-navy">My Books</h1>
      <p className="mt-2 text-sm text-navy-500">
        Every book you&apos;ve bought, with a download link that never expires on you
        — mint a fresh one here any time.
      </p>

      {purchases.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-navy-200 bg-white p-10 text-center">
          <p className="text-navy-400">You haven&apos;t bought any books yet.</p>
          <Button href="/books" className="mt-6">
            Browse Books
          </Button>
        </div>
      ) : (
        <div className="mt-8 space-y-3">
          {purchases.map((purchase) => {
            const book = books.find((b) => b.slug === purchase.bookSlug)
            return (
              <div
                key={purchase.id}
                className="flex flex-wrap items-center gap-5 rounded-2xl border border-navy-100 bg-white p-5"
              >
                <div className="relative h-24 w-16 shrink-0 overflow-hidden rounded-md bg-navy-50">
                  {book?.cover && (
                    <Image src={book.cover} alt={`${book.title} cover`} fill sizes="64px" className="object-cover" />
                  )}
                </div>
                <div className="min-w-[180px] flex-1">
                  <p className="font-heading font-semibold text-navy">
                    {book?.title ?? purchase.bookSlug}
                  </p>
                  <p className="mt-1 text-sm text-navy-400">
                    Bought {formatDate(purchase.createdAt)} &middot;{' '}
                    {formatCurrency(purchase.amountKobo / 100, purchase.currency)}
                  </p>
                </div>
                <DownloadBookButton purchaseId={purchase.id} />
              </div>
            )
          })}
        </div>
      )}

      {recommended.length > 0 && (
        <div className="mt-12 border-t border-navy-100 pt-8">
          <h2 className="font-heading text-lg font-bold text-navy">More to read</h2>
          <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-8 sm:grid-cols-4">
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
