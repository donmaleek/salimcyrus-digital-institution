import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Button } from '@/components/ui/Button'
import { PageHero } from '@/components/layout/PageHero'
import { db } from '@/lib/db'
import { formatDate } from '@/lib/utils/formatting'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: { slug: string }
}

async function getEntry(slug: string) {
  return db.journalEntry.findFirst({ where: { slug, status: 'published' } })
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const entry = await getEntry(params.slug)
  if (!entry) return { title: 'Journal Entry Not Found' }
  return {
    title: `${entry.title} | Journal`,
    description: entry.summary,
    alternates: { canonical: `/journal/${entry.slug}` },
  }
}

export default async function JournalEntryPage({ params }: PageProps) {
  const entry = await getEntry(params.slug)
  if (!entry) notFound()

  const paragraphs = entry.body
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)

  return (
    <>
      <PageHero
        eyebrow={entry.category}
        title={entry.title}
        description={entry.subtitle ?? undefined}
      />
      <main data-testid="journal-entry-content">
        <section className="bg-cream" aria-labelledby="overview-heading">
          <div className="mx-auto grid max-w-content gap-12 px-6 py-20 sm:py-24 lg:grid-cols-[0.62fr_1.38fr] lg:gap-20">
            <div>
              {entry.publishedAt && (
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-navy-500">
                  Published {formatDate(entry.publishedAt)}
                </p>
              )}
              {entry.readingTime && (
                <p className="mt-2 text-xs font-bold uppercase tracking-[0.15em] text-navy-500">
                  {entry.readingTime}
                </p>
              )}
              <p className="mt-3 text-xs font-bold uppercase tracking-[0.15em] text-gold-500">
                By Salim Cyrus
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
                Overview
              </p>
              <p className="mt-6 text-xl leading-9 text-navy-600">{entry.summary}</p>
              {entry.thesis && (
                <div className="mt-10 border-y border-navy-200 py-7">
                  <p className="text-xs font-bold uppercase tracking-[0.15em] text-navy-400">
                    Central thesis
                  </p>
                  <p className="mt-3 font-heading text-2xl italic leading-9 text-navy">
                    {entry.thesis}
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="bg-white" aria-labelledby="essay-heading">
          <div className="mx-auto max-w-3xl px-6 py-20 sm:py-24">
            <h2 id="essay-heading" className="sr-only">
              Full essay
            </h2>
            <div className="space-y-6 text-lg leading-9 text-navy-700">
              {paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
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
