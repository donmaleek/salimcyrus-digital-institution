import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'
import { PageHero } from '@/components/layout/PageHero'
import { editorialDesk, journalThemes } from '@/lib/data/journal'
import { db } from '@/lib/db'
import { formatDate } from '@/lib/utils/formatting'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Journal | Essays by Salim Cyrus',
  description:
    'Read considered essays by Salim Cyrus on relationships, identity, manhood, purpose, Kingdom life, and society.',
}

const readingMethod = [
  [
    'Read slowly',
    'Begin with the argument, not the conclusion you expect to find.',
  ],
  [
    'Name the tension',
    'Identify the belief, behavior, or responsibility the essay places in view.',
  ],
  [
    'Test the idea',
    'Compare the argument with lived experience, wise counsel, and observable consequences.',
  ],
  [
    'Choose a response',
    'Turn insight into one conversation, decision, practice, or question worth carrying forward.',
  ],
]

export default async function JournalPage() {
  const entries = await db.journalEntry.findMany({
    where: { status: 'published' },
    orderBy: { publishedAt: 'desc' },
  })
  const [featured, ...rest] = entries

  return (
    <>
      <PageHero
        eyebrow="The Journal"
        title="Essays for the Questions That Refuse Easy Answers"
        description="Long-form writing on identity, relationships, responsibility, faith, and society. Each essay is written to sharpen judgment, deepen reflection, and lead toward responsible action."
        actions={
          <>
            <Button href="#latest-essay" size="lg">
              Read the Latest Essay
            </Button>
            <Button href="#editorial-map" variant="outline-inverse" size="lg">
              Explore the Editorial Map
            </Button>
          </>
        }
      />

      <main data-testid="journal-content">
        <section
          id="latest-essay"
          className="scroll-mt-24 bg-cream"
          aria-labelledby="latest-heading"
        >
          <div className="mx-auto max-w-content px-6 py-16 sm:py-24">
            {featured ? (
              <div className="grid gap-12 lg:grid-cols-[0.6fr_1.4fr] lg:gap-20">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
                    Latest Published Essay
                  </p>
                  <p className="mt-5 font-heading text-lg italic leading-8 text-navy-500">
                    Writing for readers who would rather examine a difficult truth
                    than collect another motivational phrase.
                  </p>
                </div>
                <article>
                  <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-bold uppercase tracking-[0.14em] text-navy-500">
                    <span>{featured.category}</span>
                    {featured.publishedAt && <span>{formatDate(featured.publishedAt)}</span>}
                    {featured.readingTime && <span>{featured.readingTime}</span>}
                  </div>
                  <h2
                    id="latest-heading"
                    className="mt-5 max-w-4xl font-heading text-4xl font-bold leading-tight text-navy sm:text-6xl"
                  >
                    {featured.title}
                  </h2>
                  <p className="mt-6 max-w-3xl text-xl leading-9 text-navy-600">
                    {featured.summary}
                  </p>
                  <Link
                    href={`/journal/${featured.slug}`}
                    className="mt-8 inline-flex min-h-11 items-center border-b-2 border-gold-500 font-semibold text-navy transition-colors hover:text-gold-500"
                  >
                    Read the full essay{' '}
                    <span className="ml-2" aria-hidden>
                      →
                    </span>
                  </Link>
                </article>
              </div>
            ) : (
              <p className="text-lg text-navy-500">
                The first essay is on the way — check back soon.
              </p>
            )}

            {rest.length > 0 && (
              <ol className="mt-16 border-t border-navy-200" data-testid="journal-archive">
                {rest.map((entry, index) => (
                  <li
                    key={entry.slug}
                    className="grid gap-3 border-b border-navy-200 py-7 sm:grid-cols-[56px_1fr]"
                  >
                    <span className="font-heading font-bold text-gold-500">
                      {String(index + 2).padStart(2, '0')}
                    </span>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-navy-400">
                        {entry.category}
                        {entry.publishedAt ? ` · ${formatDate(entry.publishedAt)}` : ''}
                      </p>
                      <Link href={`/journal/${entry.slug}`} className="group mt-2 block">
                        <h3 className="font-heading text-2xl font-semibold text-navy group-hover:text-gold-500">
                          {entry.title}
                        </h3>
                        <p className="mt-2 leading-7 text-navy-600">{entry.summary}</p>
                      </Link>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </section>

        <section
          id="editorial-map"
          className="scroll-mt-24 bg-white"
          aria-labelledby="map-heading"
        >
          <div className="mx-auto max-w-content px-6 py-16 sm:py-24">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
                Editorial Map
              </p>
              <h2
                id="map-heading"
                className="mt-3 font-heading text-3xl font-bold text-navy sm:text-4xl"
              >
                Six fields of inquiry, each with a different responsibility.
              </h2>
              <p className="mt-5 text-lg leading-8 text-navy-600">
                The Journal is organized by the question an essay investigates,
                not by the format used to publish it.
              </p>
            </div>
            <ol
              className="mt-12 border-t border-navy-200"
              data-testid="journal-themes"
            >
              {journalThemes.map((theme, index) => (
                <li
                  key={theme.name}
                  className="grid gap-4 border-b border-navy-200 py-7 sm:grid-cols-[56px_0.5fr_0.8fr_1.2fr] sm:gap-7"
                >
                  <span className="font-heading font-bold text-gold-500">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className="font-heading text-xl font-semibold text-navy">
                    {theme.name}
                  </h3>
                  <p className="font-heading text-lg italic leading-7 text-navy-500">
                    {theme.question}
                  </p>
                  <p className="leading-7 text-navy-600">{theme.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section
          className="bg-navy text-cream"
          aria-labelledby="method-heading"
        >
          <div className="mx-auto grid max-w-content gap-12 px-6 py-16 sm:py-24 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">
                A Better Reading Practice
              </p>
              <h2
                id="method-heading"
                className="mt-3 font-heading text-3xl font-bold sm:text-4xl"
              >
                Do not just agree. Examine, test, and respond.
              </h2>
              <p className="mt-5 max-w-md text-lg leading-8 text-cream/70">
                The Journal is designed for reflection that changes judgment and
                conduct, not passive consumption.
              </p>
            </div>
            <ol
              className="border-t border-cream/20"
              data-testid="reading-method"
            >
              {readingMethod.map(([title, description], index) => (
                <li
                  key={title}
                  className="grid gap-3 border-b border-cream/20 py-6 sm:grid-cols-[48px_0.65fr_1.35fr] sm:gap-6"
                >
                  <span className="font-heading font-bold text-gold">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className="font-heading text-xl font-semibold">
                    {title}
                  </h3>
                  <p className="leading-7 text-cream/70">{description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="bg-cream" aria-labelledby="desk-heading">
          <div className="mx-auto max-w-content px-6 py-16 sm:py-24">
            <div className="grid gap-12 lg:grid-cols-[0.62fr_1.38fr] lg:gap-20">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
                  On the Editorial Desk
                </p>
                <h2
                  id="desk-heading"
                  className="mt-3 font-heading text-3xl font-bold text-navy sm:text-4xl"
                >
                  The questions being developed next
                </h2>
                <p className="mt-5 text-lg leading-8 text-navy-600">
                  These are working premises, not published articles. They are
                  shown to make the Journal&apos;s direction transparent without
                  presenting unfinished work as complete.
                </p>
              </div>
              <ol
                className="border-t border-navy-200"
                data-testid="editorial-desk"
              >
                {editorialDesk.map((entry, index) => (
                  <li
                    key={entry.title}
                    className="border-b border-navy-200 py-6"
                  >
                    <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-[0.14em] text-gold-500">
                      <span>{String(index + 1).padStart(2, '0')}</span>
                      <span>{entry.theme}</span>
                    </div>
                    <h3 className="mt-3 font-heading text-2xl font-semibold text-navy">
                      {entry.title}
                    </h3>
                    <p className="mt-3 max-w-2xl leading-7 text-navy-600">
                      {entry.premise}
                    </p>
                    <p className="mt-4 text-xs font-bold uppercase tracking-[0.14em] text-navy-400">
                      In editorial development
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>

        <section className="bg-white" aria-labelledby="standards-heading">
          <div className="mx-auto grid max-w-content gap-12 px-6 py-16 sm:py-24 lg:grid-cols-[0.78fr_1.22fr] lg:gap-20">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
                Publishing Standard
              </p>
              <h2
                id="standards-heading"
                className="mt-3 font-heading text-3xl font-bold text-navy sm:text-4xl"
              >
                Every essay must earn the reader&apos;s attention.
              </h2>
            </div>
            <ul className="border-t border-navy-200">
              {[
                'One precise question worth investigating',
                'A clear argument rather than borrowed certainty',
                'Distinctions that reduce confusion',
                'Practical implications without simplistic formulas',
                'A responsible next question or action',
              ].map((standard, index) => (
                <li
                  key={standard}
                  className="grid grid-cols-[48px_1fr] border-b border-navy-200 py-5"
                >
                  <span className="font-heading font-bold text-gold-500">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="font-semibold leading-7 text-navy-700">
                    {standard}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section
          className="bg-navy text-cream"
          aria-labelledby="continue-heading"
        >
          <div className="mx-auto grid max-w-content gap-10 px-6 py-16 sm:py-24 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">
                Continue Thinking
              </p>
              <h2
                id="continue-heading"
                className="mt-3 font-heading text-4xl font-bold sm:text-5xl"
              >
                Take the question beyond the page.
              </h2>
              <p className="mt-5 text-lg leading-8 text-cream/70">
                Explore the structured Knowledge Centre, ask Salim a direct
                question, or join the weekly Halisi Insight through the footer
                newsletter.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 lg:justify-end">
              <Button href="/knowledge-centre" size="lg">
                Open the Knowledge Centre
              </Button>
              <Button href="/ask-salim" variant="outline-inverse" size="lg">
                Ask Salim
              </Button>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
