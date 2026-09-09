import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { PageHero } from '@/components/layout/PageHero'
import { BookCover } from '@/components/books/BookCover'
import { StarRating } from '@/components/books/StarRating'
import { getAvailableBooks } from '@/lib/data/book-catalog'
import { formatCurrency } from '@/lib/utils/currency'
import { db } from '@/lib/db'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Books',
  description:
    'Explore books by Salim Cyrus on personal narratives, accountability, identity, calling, and purposeful living.',
}

const readingPractice = [
  {
    number: '01',
    title: 'Read with one question',
    description:
      'Name the decision, pattern, or tension you want the book to help you examine.',
  },
  {
    number: '02',
    title: 'Mark what confronts you',
    description:
      'Notice the sentence you want to dismiss, defend against, or postpone acting on.',
  },
  {
    number: '03',
    title: 'Choose one response',
    description:
      'Turn the strongest insight into a conversation, boundary, ritual, or next action.',
  },
  {
    number: '04',
    title: 'Review after seven days',
    description:
      'Measure what changed, what resisted change, and what needs a stronger structure.',
  },
]

function buildQuestions(availableCount: number) {
  return [
    {
      question: 'Which book should I read first?',
      answer:
        'Start with the title that names the issue you are ready to confront. Each book page includes a summary to help you choose.',
    },
    {
      question: 'Which books are available now?',
      answer: `All ${availableCount} books in the catalog are available now, each priced individually.`,
    },
    {
      question: 'Where do purchases happen?',
      answer:
        'Most titles offer Buy & Download: pay with PayPal, or M-Pesa Paybill with a quick review, and the PDF unlocks immediately. The rest use WhatsApp ordering, sending a prefilled message with the book title and price so the team can confirm payment and delivery.',
    },
    {
      question: 'Are there free resources too?',
      answer:
        'Yes. The Resources section includes free guides and a wider digital library for readers who want a shorter starting point.',
    },
  ]
}

export default async function BooksPage() {
  const availableBooks = await getAvailableBooks()
  const questions = buildQuestions(availableBooks.length)
  const prices = availableBooks.map((b) => b.priceKes)
  const priceRange = { min: Math.min(...prices), max: Math.max(...prices) }

  const ratingGroups = await db.bookReview.groupBy({
    by: ['bookSlug'],
    where: { status: 'approved' },
    _avg: { rating: true },
    _count: { rating: true },
  })
  const ratingsBySlug = new Map(
    ratingGroups.map((group) => [
      group.bookSlug,
      { average: group._avg.rating ?? 0, count: group._count.rating },
    ])
  )

  return (
    <>
      <PageHero
        eyebrow="Books"
        title="Books That Read You Back"
        description="Direct, practical writing about the stories you repeat, the truths you avoid, and the purpose your decisions are building."
        actions={
          <Button href="#available-books" size="lg">
            Enter the Reading Room
          </Button>
        }
      />

      <main data-testid="books-content">
        <section
          className="bg-cream"
          aria-labelledby="books-introduction-heading"
        >
          <div className="mx-auto max-w-content px-6 py-16 sm:py-24">
            <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
                  The Reading Room
                </p>
                <h2
                  id="books-introduction-heading"
                  className="mt-3 font-heading text-4xl font-bold leading-tight text-navy sm:text-5xl"
                >
                  Not motivation. A mirror with a next step.
                </h2>
              </div>
              <div className="space-y-6 text-lg leading-8 text-navy-600">
                <p>
                  Salim Cyrus writes for the moment when inspiration is no
                  longer enough. These books examine the personal narratives,
                  repeated choices, and unresolved questions that quietly shape
                  relationships, focus, identity, and purpose.
                </p>
                <p>
                  Each title is designed to help a reader recognize what is
                  happening, name it without performance, and leave with a more
                  responsible way to act. The goal is not to finish quickly. The
                  goal is to see clearly enough to live differently.
                </p>
              </div>
            </div>

            <dl className="mt-14 grid border-y border-navy-200 sm:grid-cols-3">
              <div className="py-7 sm:pr-8">
                <dt className="font-heading text-4xl font-bold text-navy">
                  {availableBooks.length}
                </dt>
                <dd className="mt-2 text-sm font-semibold uppercase tracking-[0.12em] text-navy-500">
                  Available now
                </dd>
              </div>
              <div className="border-t border-navy-200 py-7 sm:border-l sm:border-t-0 sm:px-8">
                <dt className="font-heading text-4xl font-bold text-navy">
                  {formatCurrency(priceRange.min)}&ndash;{formatCurrency(priceRange.max)}
                </dt>
                <dd className="mt-2 text-sm font-semibold uppercase tracking-[0.12em] text-navy-500">
                  Priced individually by book
                </dd>
              </div>
              <div className="border-t border-navy-200 py-7 sm:border-l sm:border-t-0 sm:pl-8">
                <dt className="font-heading text-4xl font-bold text-navy">
                  PDF
                </dt>
                <dd className="mt-2 text-sm font-semibold uppercase tracking-[0.12em] text-navy-500">
                  Instant download after payment
                </dd>
              </div>
            </dl>
          </div>
        </section>

        <section
          id="available-books"
          className="scroll-mt-24 bg-white"
          aria-labelledby="available-books-heading"
        >
          <div className="mx-auto max-w-content px-6 py-16 sm:py-24">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
                Available Books
              </p>
              <h2
                id="available-books-heading"
                className="mt-3 font-heading text-3xl font-bold text-navy sm:text-4xl"
              >
                Choose the question you are ready to face
              </h2>
            </div>

            <div
              className="mt-14 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-4"
              data-testid="available-book-list"
            >
              {availableBooks.map((book) => {
                const rating = ratingsBySlug.get(book.slug)
                return (
                <article key={book.slug} className="flex flex-col">
                  <Link
                    href={`/books/${book.slug}`}
                    className="mx-auto block w-full max-w-[200px] transition-transform duration-300 ease-out hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                  >
                    <BookCover src={book.cover} alt={`${book.title} book cover`} />
                  </Link>
                  <div className="flex flex-1 flex-col pt-5 text-center">
                    <Link href={`/books/${book.slug}`} className="hover:underline">
                      <h3 className="line-clamp-2 font-heading text-lg font-bold leading-snug text-navy">
                        {book.title}
                      </h3>
                    </Link>
                    <p className="mt-1 text-sm text-navy-500">by Salim Cyrus</p>
                    {rating && rating.count > 0 && (
                      <div className="mt-1 flex justify-center">
                        <StarRating average={rating.average} count={rating.count} />
                      </div>
                    )}
                    <p className="mt-1 text-xs uppercase tracking-wide text-navy-400">
                      {book.pageCount} pages &middot; PDF
                    </p>
                    <span className="mt-3 font-heading text-xl font-bold text-navy">
                      {formatCurrency(book.priceKes)}
                    </span>
                    <div className="mt-4">
                      {book.fileName ? (
                        <Button href={`/books/${book.slug}`} className="w-full">
                          Buy &amp; Download
                        </Button>
                      ) : (
                        <Button href={book.purchaseUrl} variant="outline" className="w-full">
                          Order on WhatsApp
                        </Button>
                      )}
                    </div>
                  </div>
                </article>
                )
              })}
            </div>
          </div>
        </section>

        <section
          className="bg-navy text-cream"
          aria-labelledby="reading-practice-heading"
        >
          <div className="mx-auto max-w-content px-6 py-16 sm:py-24">
            <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">
                  Reading Practice
                </p>
                <h2
                  id="reading-practice-heading"
                  className="mt-3 font-heading text-3xl font-bold sm:text-4xl"
                >
                  Read for a decision, not a finish line
                </h2>
                <p className="mt-5 max-w-md text-lg leading-relaxed text-cream/75">
                  A short book can produce deep work when each insight is
                  connected to an honest response.
                </p>
              </div>
              <ol className="border-t border-cream/20">
                {readingPractice.map((step) => (
                  <li
                    key={step.number}
                    className="grid gap-3 border-b border-cream/20 py-6 sm:grid-cols-[56px_0.72fr_1.28fr] sm:gap-6"
                  >
                    <span className="font-heading font-bold text-gold">
                      {step.number}
                    </span>
                    <h3 className="font-heading text-xl font-semibold">
                      {step.title}
                    </h3>
                    <p className="leading-7 text-cream/70">
                      {step.description}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className="bg-white" aria-labelledby="books-questions-heading">
          <div className="mx-auto max-w-content px-6 py-16 sm:py-24">
            <div className="grid gap-10 lg:grid-cols-[0.62fr_1.38fr] lg:gap-20">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
                  Before You Choose
                </p>
                <h2
                  id="books-questions-heading"
                  className="mt-3 font-heading text-3xl font-bold text-navy sm:text-4xl"
                >
                  Reading questions
                </h2>
              </div>
              <dl className="border-t border-navy-200">
                {questions.map((item) => (
                  <div
                    key={item.question}
                    className="border-b border-navy-200 py-6"
                  >
                    <dt className="font-heading text-lg font-semibold text-navy">
                      {item.question}
                    </dt>
                    <dd className="mt-3 leading-7 text-navy-600">
                      {item.answer}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        <section className="bg-gold-50">
          <div className="mx-auto max-w-content px-6 py-20 text-center sm:py-24">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
              Start Smaller
            </p>
            <h2 className="mx-auto mt-3 max-w-3xl font-heading text-3xl font-bold text-navy sm:text-4xl">
              Want a focused prompt before committing to a full book?
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-navy-600">
              Begin with a free guide, then return when you are ready to work
              through the deeper pattern.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Button href="/resources/free-guides">Explore Free Guides</Button>
              <Button href="/resources/digital-library" variant="outline">
                Browse the Digital Library
              </Button>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
