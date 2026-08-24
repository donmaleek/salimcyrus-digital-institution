import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { PageHero } from '@/components/layout/PageHero'
import { knowledgeCategories } from '@/lib/data/knowledge-categories'

export const metadata: Metadata = {
  title: 'Knowledge Centre',
  description:
    'Explore a structured map of ideas on relationships, manhood, purpose, Kingdom life, leadership, business, and society.',
}

const entryPoints = [
  {
    number: '01',
    title: 'Start with a question',
    description:
      'Use the question beneath each category to identify the area that deserves your attention now.',
  },
  {
    number: '02',
    title: 'Study the connected topics',
    description:
      'Move from the broad life area into one precise subject instead of consuming disconnected ideas.',
  },
  {
    number: '03',
    title: 'Choose a deeper format',
    description:
      'Continue through a book, Academy program, private coaching engagement, or a direct question to Salim.',
  },
]

const editorialStandards = [
  'One clear question per piece',
  'Truth connected to real-life decisions',
  'Practical application without empty motivation',
  'Distinct subjects without recycled copy',
  'Clear next steps for deeper study',
]

const totalTopics = knowledgeCategories.reduce(
  (total, category) => total + category.topics.length,
  0
)

export default function KnowledgeCentrePage() {
  return (
    <>
      <PageHero
        eyebrow="Knowledge Centre"
        title="A Map for the Questions That Shape a Life"
        description="Seven distinct fields of thought, organized to help you find the right question, study it clearly, and move toward responsible action."
        actions={
          <Button href="#knowledge-map" size="lg">
            Explore the Knowledge Map
          </Button>
        }
      />

      <main data-testid="knowledge-centre-content">
        <section
          className="bg-cream"
          aria-labelledby="knowledge-introduction-heading"
        >
          <div className="mx-auto max-w-content px-6 py-16 sm:py-24">
            <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
                  How It Is Organized
                </p>
                <h2
                  id="knowledge-introduction-heading"
                  className="mt-3 font-heading text-4xl font-bold leading-tight text-navy sm:text-5xl"
                >
                  Begin with the life area, not the content format.
                </h2>
              </div>
              <div className="space-y-6 text-lg leading-8 text-navy-600">
                <p>
                  The Knowledge Centre is structured around the areas that
                  repeatedly shape human decisions. It does not separate ideas
                  into random articles, clips, and posts. It begins with the
                  question a person is actually trying to answer.
                </p>
                <p>
                  Each category has a distinct purpose and a non-duplicated
                  topic set. That keeps the library useful as it grows and makes
                  every future article, video, or answered question easier to
                  locate.
                </p>
              </div>
            </div>

            <dl className="mt-14 grid border-y border-navy-200 sm:grid-cols-3">
              <div className="py-7 sm:pr-8">
                <dt className="font-heading text-4xl font-bold text-navy">
                  {knowledgeCategories.length}
                </dt>
                <dd className="mt-2 text-sm font-semibold uppercase tracking-[0.12em] text-navy-500">
                  Distinct knowledge fields
                </dd>
              </div>
              <div className="border-t border-navy-200 py-7 sm:border-l sm:border-t-0 sm:px-8">
                <dt className="font-heading text-4xl font-bold text-navy">
                  {totalTopics}
                </dt>
                <dd className="mt-2 text-sm font-semibold uppercase tracking-[0.12em] text-navy-500">
                  Non-repeated subjects
                </dd>
              </div>
              <div className="border-t border-navy-200 py-7 sm:border-l sm:border-t-0 sm:pl-8">
                <dt className="font-heading text-4xl font-bold text-navy">3</dt>
                <dd className="mt-2 text-sm font-semibold uppercase tracking-[0.12em] text-navy-500">
                  Planned content formats
                </dd>
              </div>
            </dl>
          </div>
        </section>

        <section
          id="knowledge-map"
          className="scroll-mt-24 bg-white"
          aria-labelledby="knowledge-map-heading"
        >
          <div className="mx-auto max-w-content px-6 py-16 sm:py-24">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
                Knowledge Map
              </p>
              <h2
                id="knowledge-map-heading"
                className="mt-3 font-heading text-3xl font-bold text-navy sm:text-4xl"
              >
                Seven fields. Seven different questions.
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-navy-600">
                Choose the question closest to the decision, tension, or
                responsibility in front of you.
              </p>
            </div>

            <ol
              className="mt-12 border-t border-navy-200"
              data-testid="knowledge-category-list"
            >
              {knowledgeCategories.map((category, index) => (
                <li
                  key={category.slug}
                  className="border-b border-navy-200 py-8"
                >
                  <Link
                    href={`/knowledge-centre/category/${category.slug}`}
                    className="group grid gap-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold sm:grid-cols-[56px_0.58fr_1.42fr] sm:gap-8"
                  >
                    <span
                      className="font-heading text-xl font-bold text-gold-500"
                      aria-hidden
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <h3 className="font-heading text-2xl font-semibold text-navy transition-colors group-hover:text-gold-500">
                        {category.name}
                      </h3>
                      <p className="mt-3 font-heading text-lg italic leading-7 text-navy-500">
                        {category.guidingQuestion}
                      </p>
                    </div>
                    <div>
                      <p className="leading-7 text-navy-600">
                        {category.description}
                      </p>
                      <ul
                        className="mt-5 flex flex-wrap gap-x-5 gap-y-2"
                        data-testid="category-topics"
                      >
                        {category.topics.map((topic) => (
                          <li
                            key={topic}
                            className="flex items-center gap-2 text-sm font-medium text-navy-600"
                          >
                            <span className="text-gold-500" aria-hidden>
                              +
                            </span>
                            {topic}
                          </li>
                        ))}
                      </ul>
                      <span className="mt-6 inline-flex min-h-11 items-center border-b-2 border-gold-500 font-semibold text-navy group-hover:text-gold-500">
                        Open this field
                      </span>
                    </div>
                  </Link>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section
          className="bg-navy text-cream"
          aria-labelledby="entry-points-heading"
        >
          <div className="mx-auto max-w-content px-6 py-16 sm:py-24">
            <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">
                  How to Use It
                </p>
                <h2
                  id="entry-points-heading"
                  className="mt-3 font-heading text-3xl font-bold sm:text-4xl"
                >
                  A deliberate path through the library
                </h2>
                <p className="mt-5 max-w-md text-lg leading-relaxed text-cream/75">
                  Browse with an outcome in mind. The Centre is designed to
                  reduce noise, not create another feed.
                </p>
              </div>
              <ol className="border-t border-cream/20">
                {entryPoints.map((item) => (
                  <li
                    key={item.number}
                    className="grid gap-3 border-b border-cream/20 py-6 sm:grid-cols-[56px_0.72fr_1.28fr] sm:gap-6"
                  >
                    <span className="font-heading font-bold text-gold">
                      {item.number}
                    </span>
                    <h3 className="font-heading text-xl font-semibold">
                      {item.title}
                    </h3>
                    <p className="leading-7 text-cream/70">
                      {item.description}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className="bg-cream" aria-labelledby="publishing-heading">
          <div className="mx-auto max-w-content px-6 py-16 sm:py-24">
            <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
                  Publishing Standard
                </p>
                <h2
                  id="publishing-heading"
                  className="mt-3 font-heading text-3xl font-bold text-navy sm:text-4xl"
                >
                  The structure is live. The editorial library is being built.
                </h2>
                <p className="mt-5 max-w-xl text-lg leading-relaxed text-navy-600">
                  The category system is ready, but Knowledge Centre articles
                  are not yet published. This page states that plainly instead
                  of filling the library with repeated placeholder cards.
                </p>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-navy-400">
                  Every future piece should meet these standards
                </p>
                <ul className="mt-5 border-t border-navy-200">
                  {editorialStandards.map((standard, index) => (
                    <li
                      key={standard}
                      className="grid grid-cols-[48px_1fr] border-b border-navy-200 py-4 text-navy-700"
                    >
                      <span className="font-heading font-bold text-gold-500">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="font-semibold">{standard}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white" aria-labelledby="continue-heading">
          <div className="mx-auto max-w-content px-6 py-16 sm:py-24">
            <div className="grid gap-10 lg:grid-cols-[0.62fr_1.38fr] lg:gap-20">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
                  Continue the Work
                </p>
                <h2
                  id="continue-heading"
                  className="mt-3 font-heading text-3xl font-bold text-navy sm:text-4xl"
                >
                  Choose the depth you need now
                </h2>
              </div>
              <div className="border-t border-navy-200">
                <Link
                  href="/books"
                  className="group grid gap-2 border-b border-navy-200 py-6 sm:grid-cols-[0.72fr_1.28fr] sm:gap-8"
                >
                  <h3 className="font-heading text-xl font-semibold text-navy group-hover:text-gold-500">
                    Read a complete argument
                  </h3>
                  <p className="leading-7 text-navy-600">
                    Use a book when the question requires sustained reflection
                    and a practical response.
                  </p>
                </Link>
                <Link
                  href="/academy"
                  className="group grid gap-2 border-b border-navy-200 py-6 sm:grid-cols-[0.72fr_1.28fr] sm:gap-8"
                >
                  <h3 className="font-heading text-xl font-semibold text-navy group-hover:text-gold-500">
                    Enter a structured program
                  </h3>
                  <p className="leading-7 text-navy-600">
                    Use the Academy when the change needs teaching, exercises,
                    sequence, and accountability.
                  </p>
                </Link>
                <Link
                  href="/ask-salim"
                  className="group grid gap-2 border-b border-navy-200 py-6 sm:grid-cols-[0.72fr_1.28fr] sm:gap-8"
                >
                  <h3 className="font-heading text-xl font-semibold text-navy group-hover:text-gold-500">
                    Ask the precise question
                  </h3>
                  <p className="leading-7 text-navy-600">
                    Use Ask Salim when your situation needs a direct response
                    rather than a general subject.
                  </p>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-gold-50">
          <div className="mx-auto max-w-content px-6 py-20 text-center sm:py-24">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
              Bring the Real Question
            </p>
            <h2 className="mx-auto mt-3 max-w-3xl font-heading text-3xl font-bold text-navy sm:text-4xl">
              Cannot find the subject you need?
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-navy-600">
              Submit the question in your own words. It may become the starting
              point for a future answer.
            </p>
            <Button href="/ask-salim" className="mt-8">
              Ask Salim
            </Button>
          </div>
        </section>
      </main>
    </>
  )
}
