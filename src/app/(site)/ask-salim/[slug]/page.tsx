import type { Metadata } from 'next'
import { NotPublished } from '@/components/sections/shared/NotPublished'
import { PageHero } from '@/components/layout/PageHero'
import { db } from '@/lib/db'
import { formatDate } from '@/lib/utils/formatting'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: { slug: string }
}

async function getAnswer(slug: string) {
  return db.askSalimQuestion.findFirst({
    where: { slug, status: 'answered', publishedAt: { not: null } },
  })
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const entry = await getAnswer(params.slug)
  if (!entry) {
    return { title: 'Ask Salim', robots: { index: false, follow: false } }
  }
  return {
    title: `${entry.question} | Ask Salim`,
    description: entry.answer?.slice(0, 160),
    alternates: { canonical: `/ask-salim/${entry.slug}` },
  }
}

function askerLabel(entry: { publicationPreference: string; askerName: string | null }) {
  if (entry.publicationPreference === 'first_name' && entry.askerName) {
    return entry.askerName
  }
  return 'Anonymous'
}

export default async function AskSalimAnswerPage({ params }: PageProps) {
  const entry = await getAnswer(params.slug)

  if (!entry || !entry.answer) {
    return (
      <NotPublished
        label="Answer"
        slug={params.slug}
        backHref="/ask-salim"
        backLabel="Back to Ask Salim"
      />
    )
  }

  const paragraphs = entry.answer
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)

  return (
    <>
      <PageHero eyebrow={entry.category} title={entry.question} />
      <main data-testid="ask-salim-answer-content">
        <section className="bg-white" aria-labelledby="answer-heading">
          <div className="mx-auto max-w-3xl px-6 py-20 sm:py-24">
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs font-bold uppercase tracking-[0.14em] text-navy-500">
              <span>Asked by {askerLabel(entry)}</span>
              {entry.publishedAt && <span>Answered {formatDate(entry.publishedAt)}</span>}
            </div>
            <h2 id="answer-heading" className="sr-only">
              Salim&apos;s answer
            </h2>
            <div className="mt-8 space-y-6 text-lg leading-9 text-navy-700">
              {paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
