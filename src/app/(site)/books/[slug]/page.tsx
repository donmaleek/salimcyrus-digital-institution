import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Button } from '@/components/ui/Button'
import { JsonLd } from '@/components/sections/shared/SEO'
import { books, type BookEntry } from '@/lib/data/books'
import { getBookBySlug, getAvailableBooks } from '@/lib/data/book-catalog'
import { formatCurrency } from '@/lib/utils/currency'
import { db } from '@/lib/db'
import { summarizeRatings } from '@/lib/api/book-reviews'
import { BookCover } from '@/components/books/BookCover'
import { StarRating } from '@/components/books/StarRating'
import { AuthorCard } from '@/components/books/AuthorCard'
import { BookReviewsSection } from '@/components/books/BookReviewsSection'
import { BookCheckoutForm } from '@/components/payments/BookCheckoutForm'
import { BookPurchaseReturn } from '@/components/payments/BookPurchaseReturn'

async function moreBooksBy(current: BookEntry, count: number): Promise<BookEntry[]> {
  const available = await getAvailableBooks()
  return available.filter((b) => b.slug !== current.slug).slice(0, count)
}

interface PageProps {
  params: { slug: string }
}

// Reviews change over time; static params keep the page fast to build while
// ISR keeps the rating/review list from going stale. Admin-uploaded books
// aren't in this list (built at deploy time), but Next.js still renders
// them on demand and caches the result, since dynamicParams isn't disabled.
export function generateStaticParams() {
  return books.map((book) => ({ slug: book.slug }))
}

export const revalidate = 60

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const book = await getBookBySlug(params.slug)
  if (!book || book.status !== 'available') return { title: 'Book' }
  return {
    title: book.title,
    description: book.description,
    openGraph: {
      title: book.title,
      description: book.description,
      type: 'book',
      ...(book.cover ? { images: [book.cover] } : {}),
    },
  }
}

export default async function BookDetailPage({ params }: PageProps) {
  const book = await getBookBySlug(params.slug)
  if (!book || book.status !== 'available') notFound()

  const session = await getServerSession(authOptions)
  const buyerEmail = session?.user?.email ?? null

  const approvedReviews = await db.bookReview.findMany({
    where: { bookSlug: book.slug, status: 'approved' },
    orderBy: { createdAt: 'desc' },
  })
  const summary = summarizeRatings(approvedReviews.map((r) => r.rating))

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: book.title,
    author: { '@type': 'Person', name: 'Salim Cyrus' },
    description: book.description,
    numberOfPages: book.pageCount,
    bookFormat: 'https://schema.org/EBook',
    ...(book.cover ? { image: book.cover } : {}),
    ...(summary.count > 0
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: summary.average.toFixed(1),
            reviewCount: summary.count,
          },
        }
      : {}),
    ...(book.status === 'available' && book.priceKes
      ? {
          offers: {
            '@type': 'Offer',
            price: book.priceKes,
            priceCurrency: 'KES',
            availability: 'https://schema.org/InStock',
            url: book.purchaseUrl,
          },
        }
      : {
          offers: {
            '@type': 'Offer',
            availability: 'https://schema.org/PreOrder',
          },
        }),
  }

  const canBuyNow = book.status === 'available' && Boolean(book.priceKes)
  const moreBooks = await moreBooksBy(book, 4)

  return (
    <>
      <JsonLd data={jsonLd} />
      <main className="bg-cream">
        <div className="mx-auto max-w-content px-6 py-8 sm:py-12">
          <nav aria-label="Breadcrumb" className="text-sm text-navy-500">
            <ol className="flex flex-wrap items-center gap-2">
              <li>
                <Link href="/books" className="hover:text-navy hover:underline">
                  Books
                </Link>
              </li>
              <li aria-hidden="true">/</li>
              <li className="max-w-[60vw] truncate text-navy" aria-current="page">
                {book.title}
              </li>
            </ol>
          </nav>

          <div className="mt-8 grid gap-10 lg:grid-cols-[300px_1fr_340px] lg:items-start">
            <div className="mx-auto w-full max-w-[300px] lg:sticky lg:top-8">
              <BookCover src={book.cover} alt={`${book.title} cover`} priority />
            </div>

            <div>
              <h1 className="font-heading text-3xl font-bold leading-tight text-navy sm:text-4xl">
                {book.title}
              </h1>
              {book.subtitle && (
                <p className="mt-2 font-heading text-xl italic text-navy-500">
                  {book.subtitle}
                </p>
              )}
              <p className="mt-3 text-navy-600">
                by{' '}
                <Link href="/about" className="font-semibold text-navy underline-offset-2 hover:underline">
                  Salim Cyrus
                </Link>{' '}
                <span className="text-navy-400">(Author)</span>
              </p>

              {summary.count > 0 && (
                <div className="mt-2">
                  <a href="#reviews" className="inline-block hover:opacity-80">
                    <StarRating average={summary.average} count={summary.count} />
                  </a>
                </div>
              )}

              <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-gold-200 bg-gold-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gold-600">
                Instant PDF Download
              </div>

              <hr className="my-6 border-navy-100" />

              <h2 className="font-heading text-xl font-bold text-navy">
                About this book
              </h2>
              <p className="mt-3 max-w-2xl leading-relaxed text-navy-600">
                {book.description}
              </p>

              <h2 className="mt-8 font-heading text-xl font-bold text-navy">
                Product details
              </h2>
              <dl className="mt-3 grid max-w-md grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
                <dt className="text-navy-500">Print length</dt>
                <dd className="text-navy">{book.pageCount} pages</dd>
                <dt className="text-navy-500">Format</dt>
                <dd className="text-navy">PDF (instant download)</dd>
                <dt className="text-navy-500">Language</dt>
                <dd className="text-navy">English</dd>
                <dt className="text-navy-500">Publisher</dt>
                <dd className="text-navy">Halisi Hub Connect</dd>
              </dl>

              <div className="mt-8 max-w-md">
                <AuthorCard />
              </div>
            </div>

            <aside className="rounded-2xl border border-navy-100 bg-white p-6 shadow-sm lg:sticky lg:top-8">
              {canBuyNow ? (
                <>
                  <p className="font-heading text-3xl font-bold text-navy">
                    {formatCurrency(book.priceKes)}
                  </p>
                  <p className="mt-1 text-sm text-navy-500">
                    Instant PDF download after payment
                  </p>

                  <div className="mt-5">
                    {book.fileName ? (
                      buyerEmail ? (
                        <>
                          <BookCheckoutForm
                            slug={book.slug}
                            title={book.title}
                            whatsappOrderUrl={book.purchaseUrl}
                            email={buyerEmail}
                            priceKes={book.priceKes}
                            priceUsd={book.priceUsd}
                          />
                          <Suspense>
                            <BookPurchaseReturn slug={book.slug} />
                          </Suspense>
                        </>
                      ) : (
                        <div data-testid="book-signin-gate">
                          <p className="text-sm text-navy-600">
                            Create a free account to buy this book. Your purchase and
                            download link are tied to your account.
                          </p>
                          <Button
                            href={`/register?callbackUrl=${encodeURIComponent(`/books/${book.slug}`)}`}
                            size="lg"
                            className="mt-3 w-full"
                          >
                            Sign Up to Buy
                          </Button>
                          <p className="mt-3 text-center text-sm text-navy-500">
                            Already have an account?{' '}
                            <Link
                              href={`/login?callbackUrl=${encodeURIComponent(`/books/${book.slug}`)}`}
                              className="font-semibold text-navy underline"
                            >
                              Log in
                            </Link>
                          </p>
                        </div>
                      )
                    ) : (
                      <Button href={book.purchaseUrl} size="lg" className="w-full">
                        Order on WhatsApp
                      </Button>
                    )}
                  </div>

                  <ul className="mt-6 space-y-2 border-t border-navy-100 pt-5 text-sm text-navy-600">
                    <li className="flex gap-2">
                      <span aria-hidden="true">✓</span>
                      Delivered instantly as a downloadable PDF
                    </li>
                    <li className="flex gap-2">
                      <span aria-hidden="true">✓</span>
                      Pay with PayPal, or M-Pesa Paybill with a quick review
                    </li>
                    <li className="flex gap-2">
                      <span aria-hidden="true">✓</span>
                      Download link works up to 5 times over 30 days
                    </li>
                  </ul>
                </>
              ) : (
                <>
                  <p className="text-sm font-semibold uppercase tracking-wide text-navy-400">
                    Coming Soon
                  </p>
                  <Button href="/contact" variant="outline" size="lg" className="mt-4 w-full">
                    Get Notified
                  </Button>
                </>
              )}
            </aside>
          </div>

          <BookReviewsSection
            slug={book.slug}
            summary={summary}
            reviews={approvedReviews.map((r) => ({
              id: r.id,
              reviewerName: r.reviewerName,
              rating: r.rating,
              title: r.title,
              body: r.body,
              createdAt: r.createdAt.toISOString(),
            }))}
          />

          {moreBooks.length > 0 && (
            <div className="mt-20 border-t border-navy-100 pt-12">
              <h2 className="font-heading text-2xl font-bold text-navy">
                More books by Salim Cyrus
              </h2>
              <div className="mt-8 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
                {moreBooks.map((other) => (
                  <Link key={other.slug} href={`/books/${other.slug}`} className="group block">
                    <BookCover src={other.cover} alt={`${other.title} book cover`} />
                    <p className="mt-3 line-clamp-2 text-sm font-semibold text-navy group-hover:underline">
                      {other.title}
                    </p>
                    <p className="mt-1 text-sm font-bold text-navy-600">
                      {formatCurrency(other.priceKes)}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
