import Link from 'next/link'
import { getAvailableBooks } from '@/lib/data/book-catalog'
import { programs } from '@/lib/data/programs'
import { BookCover } from '@/components/books/BookCover'

const credentials = [
  ['2024', 'Strategic Accountability Coach'],
  ['2023', 'Certified Life Coach'],
  ['2022', 'Advanced Emotional Intelligence'],
  ['2021', 'Human Potential Practitioner'],
  ['2020', 'Decision Architecture Specialist'],
]

// The homepage shows a fixed-size teaser grid (2 rows of 4), not the whole
// catalog, so it stays a clean square as Salim adds more books over time.
// The full, unbounded list lives on /books.
const HOME_BOOK_TEASER_COUNT = 8

export async function InstitutionalOverview() {
  const featuredPrograms = programs.slice(0, 3)
  const publishedBooks = (await getAvailableBooks()).slice(0, HOME_BOOK_TEASER_COUNT)

  return (
    <>
      <section className="bg-white" data-testid="home-authority">
        <div className="mx-auto grid max-w-content gap-12 px-6 py-16 sm:py-24 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gold-500">The work behind the name</p>
            <h2 className="mt-3 font-heading text-4xl font-bold leading-tight text-navy sm:text-5xl">Truth that becomes structure. Wisdom that survives real life.</h2>
            <p className="mt-6 text-lg leading-8 text-navy-600">Salim Cyrus works where identity, relationships, responsibility, faith, leadership, and purpose meet. His practice combines deep listening with practical frameworks that help people name what is true, choose what matters, and act with consistency.</p>
            <Link href="/about" className="mt-8 inline-flex min-h-11 items-center font-bold text-navy underline decoration-gold decoration-2 underline-offset-8">Meet Salim and explore his philosophy</Link>
          </div>
          <div className="border-t border-navy/15">
            {credentials.map(([year, name]) => (
              <div key={name} className="grid grid-cols-[64px_1fr] gap-5 border-b border-navy/15 py-4">
                <span className="font-bold text-gold-500">{year}</span>
                <span className="font-heading text-lg font-semibold text-navy">{name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-navy-50" data-testid="home-academy">
        <div className="mx-auto max-w-content px-6 py-16 sm:py-24">
          <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr] lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gold-500">Salim Cyrus Academy</p>
              <h2 className="mt-3 font-heading text-4xl font-bold text-navy sm:text-5xl">Formation needs more than inspiration.</h2>
            </div>
            <p className="text-lg leading-8 text-navy-600">Programs turn teaching into a sequence: learn the idea, examine the pattern, practise the framework, and carry the change into daily life.</p>
          </div>
          <div className="mt-12 grid gap-px overflow-hidden bg-navy/15 lg:grid-cols-3">
            {featuredPrograms.map((program) => (
              <Link href={`/academy/masterclasses/${program.slug}`} key={program.slug} className="group bg-white p-7 sm:p-8">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-gold-500">{program.tag} · {program.duration}</p>
                <h3 className="mt-5 font-heading text-2xl font-semibold text-navy group-hover:text-gold-500">{program.name}</h3>
                <p className="mt-4 leading-7 text-navy-600">{program.description}</p>
                <p className="mt-6 font-bold text-navy">Study this program</p>
              </Link>
            ))}
          </div>
          <Link href="/academy" className="mt-8 inline-flex min-h-11 items-center font-bold text-navy underline decoration-gold decoration-2 underline-offset-8">Compare all Academy programs</Link>
        </div>
      </section>

      <section className="bg-cream" data-testid="home-books">
        <div className="mx-auto max-w-content px-6 py-16 sm:py-24">
          <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr] lg:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gold-500">Books by Salim Cyrus</p>
              <h2 className="mt-3 font-heading text-4xl font-bold text-navy sm:text-5xl">Books that read you back.</h2>
            </div>
            <p className="text-lg leading-8 text-navy-600">Direct writing for readers ready to confront repeated narratives, recover focus, accept responsibility, and build a life around purpose.</p>
          </div>
          <div className="mt-12 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
            {publishedBooks.map((book) => (
              <Link href={`/books/${book.slug}`} key={book.slug} className="group block">
                <BookCover src={book.cover} alt={`${book.title} book cover`} />
                <h3 className="mt-3 line-clamp-2 font-heading text-base font-bold leading-snug text-navy group-hover:underline">{book.title}</h3>
                <p className="mt-1 text-sm text-navy-500">KES {book.priceKes?.toLocaleString()}</p>
              </Link>
            ))}
          </div>
          <Link href="/books" className="mt-10 inline-flex min-h-11 items-center font-bold text-navy underline decoration-gold decoration-2 underline-offset-8">Enter the reading room</Link>
        </div>
      </section>

      <section className="bg-white" data-testid="home-community-journal">
        <div className="mx-auto grid max-w-content gap-px bg-navy/15 lg:grid-cols-2">
          <article className="bg-white px-6 py-16 sm:p-16">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gold-500">Halisi Hub Connect</p>
            <h2 className="mt-3 font-heading text-4xl font-bold text-navy">Wisdom that forms people. People who strengthen communities.</h2>
            <p className="mt-5 text-lg leading-8 text-navy-600">A growing institution for mentorship, learning, community formation, and practical service.</p>
            <Link href="/halisi-hub-connect" className="mt-8 inline-flex min-h-11 items-center font-bold text-navy underline decoration-gold decoration-2 underline-offset-8">Discover the mission</Link>
          </article>
          <article className="bg-navy-50 px-6 py-16 sm:p-16">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-gold-500">The Journal</p>
            <h2 className="mt-3 font-heading text-4xl font-bold text-navy">Essays for questions that refuse easy answers.</h2>
            <p className="mt-5 text-lg leading-8 text-navy-600">Long-form writing on identity, relationships, responsibility, faith, and society, written to sharpen judgment.</p>
            <Link href="/journal" className="mt-8 inline-flex min-h-11 items-center font-bold text-navy underline decoration-gold decoration-2 underline-offset-8">Read the latest essay</Link>
          </article>
        </div>
      </section>
    </>
  )
}
