import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { books } from '@/lib/data/books'
import { formatCurrency } from '@/lib/utils/currency'

export const metadata: Metadata = {
  title: 'Books',
  description: 'Books by Salim Cyrus — practical mirrors, not motivation.',
}

export default function BooksPage() {
  return (
    <section className="bg-cream">
      <div className="mx-auto max-w-content px-6 py-20">
        <p className="font-body text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
          Books
        </p>
        <h1 className="mt-4 font-heading text-4xl font-bold text-navy sm:text-5xl">
          Books That Confront What You Avoid
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-navy-600">Practical mirrors, not motivation.</p>

        <div className="mt-14 grid gap-8 sm:grid-cols-2">
          {books.map((book) => (
            <div key={book.slug} className="flex gap-6 rounded-2xl border border-navy-100 bg-white p-6">
              <div className="relative h-40 w-40 shrink-0 overflow-hidden rounded-xl bg-navy-50 sm:h-48 sm:w-48">
                {book.cover ? (
                  <Image src={book.cover} alt={book.title} fill className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center p-4 text-center font-heading text-sm text-navy-300">
                    {book.title}
                  </div>
                )}
              </div>
              <div className="flex flex-1 flex-col">
                <h2 className="font-heading text-xl font-semibold text-navy">{book.title}</h2>
                {book.subtitle && (
                  <p className="mt-1 font-heading text-sm italic text-navy-500">{book.subtitle}</p>
                )}
                <p className="mt-3 flex-1 text-sm text-navy-600">{book.description}</p>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  {book.status === 'available' && book.priceKes ? (
                    <span className="text-lg font-bold text-navy">{formatCurrency(book.priceKes)}</span>
                  ) : (
                    <Badge variant="navy">Coming Soon</Badge>
                  )}
                  {book.status === 'available' && book.paystackUrl ? (
                    <Button href={book.paystackUrl} size="sm">
                      Buy Now
                    </Button>
                  ) : (
                    <Button href="/contact" variant="outline" size="sm">
                      Get Notified
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 rounded-2xl border border-gold-200 bg-gold-50 p-8 text-center">
          <h2 className="font-heading text-xl font-semibold text-navy">
            Want a Reset in One Page?
          </h2>
          <p className="mt-2 text-sm text-navy-600">
            A downloadable checklist to map the next decisive move.
          </p>
          <Button href="/resources/free-guides" className="mt-6">
            Download the Reset Checklist
          </Button>
        </div>

        <p className="mt-8 text-sm text-navy-400">
          Looking for the full digital library?{' '}
          <Link href="/resources/digital-library" className="font-semibold text-gold-500 hover:underline">
            Browse it here
          </Link>
          .
        </p>
      </div>
    </section>
  )
}
