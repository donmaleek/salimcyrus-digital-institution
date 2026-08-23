import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Button } from '@/components/ui/Button'

interface PageProps {
  params: { slug: string }
}

const books = {
  'the-greatest-tragedy': {
    title: 'The Greatest Tragedy Is Not Death...',
    subtitle: 'It Is a Life Without Purpose',
    editions: [
      { name: 'Paperback', href: '/contact' },
      { name: 'Digital Edition', href: '/contact' },
      { name: 'Signed Author Edition', href: '/contact' },
    ],
    bundle: {
      name: 'Purpose Transformation Bundle',
      description: 'Book + Workbook + Masterclass',
    },
  },
}

export function generateStaticParams() {
  return Object.keys(books).map((slug) => ({ slug }))
}

export function generateMetadata({ params }: PageProps): Metadata {
  const book = books[params.slug as keyof typeof books]
  return { title: book ? book.title : 'Book' }
}

export default function BookDetailPage({ params }: PageProps) {
  const book = books[params.slug as keyof typeof books]
  if (!book) notFound()

  return (
    <section className="bg-cream">
      <div className="mx-auto max-w-content px-6 py-20">
        <h1 className="font-heading text-4xl font-bold text-navy sm:text-5xl">{book.title}</h1>
        <p className="mt-2 font-heading text-2xl italic text-navy-500">{book.subtitle}</p>

        <div className="mt-10 flex flex-wrap gap-4">
          {book.editions.map((edition) => (
            <Button key={edition.name} href={edition.href} variant="outline">
              {edition.name}
            </Button>
          ))}
        </div>

        <div className="mt-12 rounded-2xl border border-gold-200 bg-gold-50 p-6">
          <h2 className="font-heading text-lg font-semibold text-navy">{book.bundle.name}</h2>
          <p className="mt-1 text-sm text-navy-600">{book.bundle.description}</p>
          <Button href="/contact" size="sm" className="mt-4">
            Get the Bundle
          </Button>
        </div>
      </div>
    </section>
  )
}
