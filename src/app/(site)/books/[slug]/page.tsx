import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { JsonLd } from '@/components/sections/shared/SEO'
import { books } from '@/lib/data/books'
import { formatCurrency } from '@/lib/utils/currency'
import { PageHero } from '@/components/layout/PageHero'

interface PageProps {
  params: { slug: string }
}

export function generateStaticParams() {
  return books.map((book) => ({ slug: book.slug }))
}

export function generateMetadata({ params }: PageProps): Metadata {
  const book = books.find((b) => b.slug === params.slug)
  if (!book) return { title: 'Book' }
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

export default function BookDetailPage({ params }: PageProps) {
  const book = books.find((b) => b.slug === params.slug)
  if (!book) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Book',
    name: book.title,
    author: { '@type': 'Person', name: 'Salim Cyrus' },
    description: book.description,
    ...(book.cover ? { image: book.cover } : {}),
    ...(book.status === 'available' && book.priceKes
      ? {
          offers: {
            '@type': 'Offer',
            price: book.priceKes,
            priceCurrency: 'KES',
            availability: 'https://schema.org/InStock',
            url: book.paystackUrl,
          },
        }
      : {
          offers: {
            '@type': 'Offer',
            availability: 'https://schema.org/PreOrder',
          },
        }),
  }

  return (
    <>
      <JsonLd data={jsonLd} />
      <PageHero
        eyebrow="Books"
        title={book.title}
        description={book.description}
      />
      <section className="bg-cream">
        <div className="mx-auto grid max-w-content gap-10 px-6 py-20 lg:grid-cols-[280px_1fr] lg:items-start">
          <div className="relative mx-auto aspect-square w-full max-w-[280px] overflow-hidden rounded-2xl bg-navy-50 shadow-lg">
            {book.cover ? (
              <Image
                src={book.cover}
                alt={book.title}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center p-6 text-center font-heading text-navy-300">
                {book.title}
              </div>
            )}
          </div>

          <div>
            {book.subtitle && (
              <p className="mt-2 font-heading text-2xl italic text-navy-500">
                {book.subtitle}
              </p>
            )}
            <div className="mt-10 flex flex-wrap items-center gap-4">
              {book.status === 'available' && book.priceKes ? (
                <>
                  <span className="text-2xl font-bold text-navy">
                    {formatCurrency(book.priceKes)}
                  </span>
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
        </div>
      </section>
    </>
  )
}
