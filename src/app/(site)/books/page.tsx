import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { PageHero } from '@/components/layout/PageHero'
import { books } from '@/lib/data/books'

export const metadata: Metadata = {
  title: 'Books',
  description:
    'Explore books by Salim Cyrus on personal narratives, accountability, identity, calling, and purposeful living.',
}

const bookGuides: Record<
  string,
  {
    eyebrow: string
    proposition: string
    themes: string[]
    startHere: string
  }
> = {
  'concealed-redemption': {
    eyebrow: 'Patterns and Renewal',
    proposition: 'Catch the story before it becomes the same life again.',
    themes: [
      'Repeated narratives',
      'Stress patterns',
      'Daily rituals',
      'Personal renewal',
    ],
    startHere:
      'Choose this when you can see the pattern repeating but need a practical way to interrupt it.',
  },
  'the-great-deception': {
    eyebrow: 'Truth and Accountability',
    proposition: 'Confront the story that keeps stealing your focus.',
    themes: [
      'Self-deception',
      'Attention',
      'Accountability',
      'Clear decisions',
    ],
    startHere:
      'Choose this when avoidance, distraction, or a familiar excuse is keeping you from an honest decision.',
  },
  'the-greatest-tragedy': {
    eyebrow: 'Identity and Purpose',
    proposition: 'Build a life around purpose rather than performance.',
    themes: ['Identity', 'Calling', 'Purpose', 'Meaningful action'],
    startHere:
      'Follow this title if your central question is not what to do next, but who you are becoming.',
  },
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

const formatPrice = (amount: number) =>
  `KES ${new Intl.NumberFormat('en-US', { maximumFractionDigits: 0 }).format(amount)}`

const questions = [
  {
    question: 'Which book should I read first?',
    answer:
      'Begin with Concealed Redemption when the problem is a repeating emotional or behavioral pattern. Choose The Great Deception when the central issue is avoidance, distraction, or an untrue personal narrative.',
  },
  {
    question: 'Which books are available now?',
    answer:
      'Concealed Redemption and The Great Deception are currently available at KES 1,499 each. The Greatest Tragedy Is Not Death... is listed as an upcoming title.',
  },
  {
    question: 'Where do purchases happen?',
    answer:
      'Available books link to their secure Paystack checkout pages. Upcoming titles link to the contact page for release notifications.',
  },
  {
    question: 'Are there free resources too?',
    answer:
      'Yes. The Resources section includes free guides and a wider digital library for readers who want a shorter starting point.',
  },
]

export default function BooksPage() {
  const availableBooks = books.filter((book) => book.status === 'available')
  const upcomingBooks = books.filter((book) => book.status === 'upcoming')

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
          <div className="mx-auto max-w-content px-6 py-20 sm:py-24">
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
                  {upcomingBooks.length}
                </dt>
                <dd className="mt-2 text-sm font-semibold uppercase tracking-[0.12em] text-navy-500">
                  Upcoming title
                </dd>
              </div>
              <div className="border-t border-navy-200 py-7 sm:border-l sm:border-t-0 sm:pl-8">
                <dt className="font-heading text-4xl font-bold text-navy">
                  KES 1,499
                </dt>
                <dd className="mt-2 text-sm font-semibold uppercase tracking-[0.12em] text-navy-500">
                  Current price per available book
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
          <div className="mx-auto max-w-content px-6 py-20 sm:py-24">
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

            <div className="mt-14 space-y-20" data-testid="available-book-list">
              {availableBooks.map((book, index) => {
                const guide = bookGuides[book.slug]
                return (
                  <article
                    key={book.slug}
                    className="grid gap-10 border-t border-navy-200 pt-10 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20"
                  >
                    <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                      <Link
                        href={`/books/${book.slug}`}
                        className="group relative mx-auto block aspect-[4/5] w-full max-w-sm overflow-hidden bg-navy-50 shadow-[0_30px_70px_rgba(15,27,45,0.18)] focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                      >
                        {book.cover && (
                          <Image
                            src={book.cover}
                            alt={`${book.title} book cover`}
                            fill
                            sizes="(max-width: 1024px) 384px, 420px"
                            className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.025]"
                          />
                        )}
                      </Link>
                    </div>

                    <div
                      className={`flex flex-col justify-center ${index % 2 === 1 ? 'lg:order-1' : ''}`}
                    >
                      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
                        {guide.eyebrow}
                      </p>
                      <h3 className="mt-3 font-heading text-4xl font-bold text-navy sm:text-5xl">
                        {book.title}
                      </h3>
                      <p className="mt-5 font-heading text-2xl italic leading-snug text-navy-500">
                        {guide.proposition}
                      </p>
                      <p className="mt-6 max-w-2xl text-lg leading-8 text-navy-600">
                        {book.description}
                      </p>

                      <div className="mt-8 border-y border-navy-200 py-6">
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-navy-400">
                          Themes inside
                        </p>
                        <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-3">
                          {guide.themes.map((theme) => (
                            <li
                              key={theme}
                              className="flex items-center gap-2 text-sm font-semibold text-navy-700"
                            >
                              <span className="text-gold-500" aria-hidden>
                                +
                              </span>
                              {theme}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-6">
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-navy-400">
                          Start here if
                        </p>
                        <p className="mt-2 max-w-xl leading-7 text-navy-600">
                          {guide.startHere}
                        </p>
                      </div>

                      <div className="mt-8 flex flex-wrap items-center gap-4">
                        <span className="font-heading text-2xl font-bold text-navy">
                          {formatPrice(book.priceKes!)}
                        </span>
                        <Button href={book.paystackUrl!}>Buy Now</Button>
                        <Button href={`/books/${book.slug}`} variant="outline">
                          Read About the Book
                        </Button>
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
          <div className="mx-auto max-w-content px-6 py-20 sm:py-24">
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

        {upcomingBooks.map((book) => {
          const guide = bookGuides[book.slug]
          return (
            <section
              key={book.slug}
              className="bg-cream"
              aria-labelledby="upcoming-book-heading"
            >
              <div className="mx-auto max-w-content px-6 py-20 sm:py-24">
                <div className="grid gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:items-end lg:gap-20">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
                      Upcoming Title
                    </p>
                    <p className="mt-8 font-heading text-7xl font-bold leading-none text-navy-100 sm:text-8xl">
                      03
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
                      {guide.eyebrow}
                    </p>
                    <h2
                      id="upcoming-book-heading"
                      className="mt-3 font-heading text-4xl font-bold leading-tight text-navy sm:text-5xl"
                    >
                      {book.title}
                    </h2>
                    {book.subtitle && (
                      <p className="mt-3 font-heading text-2xl italic text-navy-500">
                        {book.subtitle}
                      </p>
                    )}
                    <p className="mt-6 max-w-2xl text-lg leading-8 text-navy-600">
                      {book.description}
                    </p>
                    <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-3">
                      {guide.themes.map((theme) => (
                        <li
                          key={theme}
                          className="flex items-center gap-2 text-sm font-semibold text-navy-700"
                        >
                          <span className="text-gold-500" aria-hidden>
                            +
                          </span>
                          {theme}
                        </li>
                      ))}
                    </ul>
                    <Button href="/contact" variant="outline" className="mt-8">
                      Get Release Updates
                    </Button>
                  </div>
                </div>
              </div>
            </section>
          )
        })}

        <section className="bg-white" aria-labelledby="books-questions-heading">
          <div className="mx-auto max-w-content px-6 py-20 sm:py-24">
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
