import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Button } from '@/components/ui/Button'
import { books } from '@/lib/data/books'
import { formatCurrency } from '@/lib/utils/currency'

interface PageProps {
  params: { slug: string }
}

export function generateStaticParams() {
  return books.map((book) => ({ slug: book.slug }))
}

export function generateMetadata({ params }: PageProps): Metadata {
  const book = books.find((b) => b.slug === params.slug)
  return { title: book ? book.title : 'Book' }
}

export default function BookDetailPage({ params }: PageProps) {
  const book = books.find((b) => b.slug === params.slug)
  if (!book) notFound()

  return (
    <section className="bg-cream">
      <div className="mx-auto max-w-content px-6 py-20">
        <h1 className="font-heading text-4xl font-bold text-navy sm:text-5xl">{book.title}</h1>
        {book.subtitle && (
          <p className="mt-2 font-heading text-2xl italic text-navy-500">{book.subtitle}</p>
        )}
        <p className="mt-6 max-w-2xl text-lg text-navy-600">{book.description}</p>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          {book.status === 'available' && book.priceKes ? (
            <>
              <span className="text-2xl font-bold text-navy">{formatCurrency(book.priceKes)}</span>
              <Button href={book.paystackUrl!} size="lg">
                Buy Now
              </Button>
            </>
          ) : (
            <>
              <span className="text-sm font-semibold uppercase tracking-wide text-navy-400">
                Coming Soon
              </span>
              <Button href="/contact" variant="outline" size="lg">
                Get Notified
              </Button>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
