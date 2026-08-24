import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { PageHero } from '@/components/layout/PageHero'
import { findJournalEntry, publishedJournalEntries } from '@/lib/data/journal'

interface PageProps {
  params: { slug: string }
}

export function generateStaticParams() {
  return publishedJournalEntries.map((entry) => ({ slug: entry.slug }))
}

export function generateMetadata({ params }: PageProps): Metadata {
  const entry = findJournalEntry(params.slug)
  if (!entry) return { title: 'Journal Entry Not Found' }
  return {
    title: `${entry.title} | Journal`,
    description: entry.summary,
    alternates: { canonical: `/journal/${entry.slug}` },
  }
}

const ideas = [
  {
    title: 'Public expression can begin with private silence',
    description:
      'Before judging what someone shares online, ask whether their immediate relationships have made honest conversation possible.',
  },
  {
    title: 'Visibility is not the same as understanding',
    description:
      'Digital reactions can acknowledge a person for a moment while leaving the deeper need for patient, contextual listening unmet.',
  },
  {
    title: 'Listening is a relational responsibility',
    description:
      'Families, friendships, workplaces, and faith communities become safer when attention is practiced before advice or correction.',
  },
  {
    title: 'The repair begins offline',
    description:
      'Healthier digital behavior is supported by homes and communities where people can speak without being ignored, mocked, or prematurely judged.',
  },
]

const reflectionQuestions = [
  'Who speaks differently online because they do not feel heard around you?',
  'When someone shares pain, do you listen for understanding or prepare a correction?',
  'Which relationships in your life need more patient, private conversation?',
  'What boundary separates healthy disclosure from public exposure for you?',
]

export default function JournalEntryPage({ params }: PageProps) {
  const entry = findJournalEntry(params.slug)
  if (!entry) notFound()

  return (
    <>
      <PageHero
        eyebrow={entry.category}
        title={entry.title}
        description={entry.subtitle}
      />
      <main data-testid="journal-entry-content">
        <section className="bg-cream" aria-labelledby="overview-heading">
          <div className="mx-auto grid max-w-content gap-12 px-6 py-20 sm:py-24 lg:grid-cols-[0.62fr_1.38fr] lg:gap-20">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-navy-500">
                Published {entry.publishedAt}
              </p>
              <p className="mt-3 text-xs font-bold uppercase tracking-[0.15em] text-gold-500">
                By Salim Cyrus
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
                Editorial Overview
              </p>
              <h2
                id="overview-heading"
                className="mt-3 font-heading text-3xl font-bold text-navy sm:text-4xl"
              >
                The question beneath the online noise
              </h2>
              <p className="mt-6 text-xl leading-9 text-navy-600">
                {entry.summary}
              </p>
              <div className="mt-10 border-y border-navy-200 py-7">
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-navy-400">
                  Central thesis
                </p>
                <p className="mt-3 font-heading text-2xl italic leading-9 text-navy">
                  {entry.thesis}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white" aria-labelledby="ideas-heading">
          <div className="mx-auto max-w-content px-6 py-20 sm:py-24">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
              Argument Map
            </p>
            <h2
              id="ideas-heading"
              className="mt-3 font-heading text-3xl font-bold text-navy sm:text-4xl"
            >
              Four ideas to carry into the full essay
            </h2>
            <ol
              className="mt-12 border-t border-navy-200"
              data-testid="entry-ideas"
            >
              {ideas.map((idea, index) => (
                <li
                  key={idea.title}
                  className="grid gap-4 border-b border-navy-200 py-7 sm:grid-cols-[56px_0.85fr_1.15fr] sm:gap-8"
                >
                  <span className="font-heading font-bold text-gold-500">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className="font-heading text-xl font-semibold text-navy">
                    {idea.title}
                  </h3>
                  <p className="leading-7 text-navy-600">{idea.description}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section
          className="bg-navy text-cream"
          aria-labelledby="questions-heading"
        >
          <div className="mx-auto grid max-w-content gap-12 px-6 py-20 sm:py-24 lg:grid-cols-[0.72fr_1.28fr] lg:gap-20">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">
                Reflection
              </p>
              <h2
                id="questions-heading"
                className="mt-3 font-heading text-3xl font-bold sm:text-4xl"
              >
                Questions for the reader
              </h2>
              <p className="mt-5 text-lg leading-8 text-cream/70">
                Use these prompts before moving to the complete essay.
              </p>
            </div>
            <ol className="border-t border-cream/20">
              {reflectionQuestions.map((question, index) => (
                <li
                  key={question}
                  className="grid grid-cols-[48px_1fr] border-b border-cream/20 py-5"
                >
                  <span className="font-heading font-bold text-gold">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <p className="font-heading text-xl leading-8 text-cream/90">
                    {question}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="bg-cream" aria-labelledby="original-heading">
          <div className="mx-auto grid max-w-content gap-10 px-6 py-20 sm:py-24 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
                Continue Reading
              </p>
              <h2
                id="original-heading"
                className="mt-3 font-heading text-4xl font-bold text-navy sm:text-5xl"
              >
                Continue through the Journal.
              </h2>
              <p className="mt-5 text-lg leading-8 text-navy-600">
                Explore more essays on identity, relationships, responsibility,
                faith, purpose, and society from the Journal editorial desk.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 lg:justify-end">
              <Button href="/journal" size="lg">
                Explore the Journal
              </Button>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
