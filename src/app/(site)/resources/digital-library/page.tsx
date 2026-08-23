import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Digital Library',
  description: 'Books, workbooks, guides, and audio/video teachings from Salim Cyrus.',
}

const shelves = [
  { title: 'Books', description: 'Concealed Redemption, The Great Deception, and upcoming titles.', href: '/books' },
  { title: 'Free Guides', description: 'Downloadable checklists and workbooks.', href: '/resources/free-guides' },
  { title: 'Programs', description: 'Structured transformation programs and masterclasses.', href: '/academy/masterclasses' },
  { title: 'Knowledge Centre', description: 'Articles organized by category.', href: '/knowledge-centre' },
]

export default function DigitalLibraryPage() {
  return (
    <section className="bg-cream">
      <div className="mx-auto max-w-content px-6 py-20">
        <p className="font-body text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
          Digital Library
        </p>
        <h1 className="mt-4 font-heading text-4xl font-bold text-navy sm:text-5xl">
          One Place to Search Everything
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-navy-600">
          Books, workbooks, guides, and teachings — organized in one library.
        </p>

        <div className="mt-14 grid gap-6 sm:grid-cols-2">
          {shelves.map((shelf) => (
            <Link
              key={shelf.href}
              href={shelf.href}
              className="rounded-2xl border border-navy-100 bg-white p-8 transition-shadow hover:shadow-lg"
            >
              <h2 className="font-heading text-xl font-semibold text-navy">{shelf.title}</h2>
              <p className="mt-3 text-sm text-navy-500">{shelf.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
