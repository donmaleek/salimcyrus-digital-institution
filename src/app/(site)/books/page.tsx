import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Books',
  description: 'Books by Salim Cyrus, including The Greatest Tragedy Is Not Death... It Is a Life Without Purpose.',
}

const books = [
  {
    slug: 'the-greatest-tragedy',
    title: 'The Greatest Tragedy Is Not Death...',
    subtitle: 'It Is a Life Without Purpose',
    editions: ['Paperback', 'Digital Edition', 'Signed Author Edition'],
  },
]

export default function BooksPage() {
  return (
    <section className="bg-cream">
      <div className="mx-auto max-w-content px-6 py-20">
        <p className="font-body text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
          Books
        </p>
        <h1 className="mt-4 font-heading text-4xl font-bold text-navy sm:text-5xl">
          The Legacy Shelf
        </h1>

        <div className="mt-14 grid gap-8 sm:grid-cols-2">
          {books.map((book) => (
            <Link
              key={book.slug}
              href={`/books/${book.slug}`}
              className="rounded-2xl border border-navy-100 bg-white p-8 transition-shadow hover:shadow-lg"
            >
              <h2 className="font-heading text-2xl font-semibold text-navy">{book.title}</h2>
              <p className="mt-1 font-heading text-lg italic text-navy-500">{book.subtitle}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {book.editions.map((edition) => (
                  <span
                    key={edition}
                    className="rounded-full bg-navy-50 px-3 py-1 text-xs font-medium text-navy-600"
                  >
                    {edition}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
