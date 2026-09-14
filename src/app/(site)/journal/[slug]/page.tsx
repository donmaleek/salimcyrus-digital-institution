import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { Button } from '@/components/ui/Button'
import { PageHero } from '@/components/layout/PageHero'
import { db } from '@/lib/db'
import { formatDate } from '@/lib/utils/formatting'
import { hasActiveJournalSubscription } from '@/services/payments/journal-subscriptions'
import { JournalSubscribeForm } from '@/components/payments/JournalSubscribeForm'
import { JournalSubscriptionReturn } from '@/components/payments/JournalSubscriptionReturn'

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
    openGraph: entry.coverImageData ? { images: [`/api/journal/${entry.id}/cover`] } : undefined,
  }
}

export default async function JournalEntryPage({ params }: PageProps) {
  const entry = await getEntry(params.slug)
  if (!entry) notFound()

  const session = await getServerSession(authOptions)
  const userId = (session?.user as { id?: string } | undefined)?.id
  const subscribed = userId ? await hasActiveJournalSubscription(userId) : false

  const paragraphs = entry.body
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)

  const visibleParagraphs = subscribed ? paragraphs : paragraphs.slice(0, 1)
  const lockedParagraphCount = paragraphs.length - visibleParagraphs.length

  return (
    <>
      <PageHero
        eyebrow={entry.category}
        title={entry.title}
        description={entry.subtitle ?? undefined}
      />
      <main data-testid="journal-entry-content">
        {entry.coverImageData && (
          <figure className="bg-cream px-6 pt-12">
            <div className="relative mx-auto aspect-[16/9] w-full max-w-content overflow-hidden rounded-2xl shadow-xl"><Image src={`/api/journal/${entry.id}/cover`} alt={entry.coverImageAlt ?? ''} fill unoptimized priority className="object-cover" /></div>
            {entry.coverImageCaption && <figcaption className="mx-auto mt-3 max-w-content text-sm italic text-navy-500">{entry.coverImageCaption}</figcaption>}
          </figure>
        )}
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
            <div className="space-y-6 text-lg leading-9 text-navy-700" data-testid="essay-body">
              {visibleParagraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            {lockedParagraphCount > 0 && (
              <div
                className="mt-10 rounded-2xl border border-navy-200 bg-cream p-6 sm:p-10"
                data-testid="journal-paywall"
              >
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-gold-700">
                  Journal Membership
                </p>
                <h3 className="mt-3 font-heading text-2xl font-bold text-navy sm:text-3xl">
                  Keep reading with a Journal Membership.
                </h3>
                <p className="mt-3 max-w-xl leading-7 text-navy-600">
                  {lockedParagraphCount} more paragraph{lockedParagraphCount === 1 ? '' : 's'} of this essay,
                  plus every other essay in the Journal, for KES 500 a month.
                </p>
                {session?.user?.email ? (
                  <div className="mt-6 max-w-sm">
                    <JournalSubscribeForm email={session.user.email} />
                    <JournalSubscriptionReturn />
                  </div>
                ) : (
                  <div className="mt-6 flex flex-wrap gap-4">
                    <Button href={`/login?callbackUrl=${encodeURIComponent(`/journal/${entry.slug}`)}`}>
                      Sign In to Subscribe
                    </Button>
                    <Button href={`/register?callbackUrl=${encodeURIComponent(`/journal/${entry.slug}`)}`} variant="outline">
                      Create an Account
                    </Button>
                  </div>
                )}
              </div>
            )}
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
