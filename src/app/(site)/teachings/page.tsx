import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'
import { PageHero } from '@/components/layout/PageHero'
import { db } from '@/lib/db'
import { formatCurrency } from '@/lib/utils/currency'
import { TEACHING_CATEGORIES } from '@/lib/data/teaching-categories'

export const revalidate = 60

export const metadata: Metadata = {
  title: 'Teaching Library',
  description:
    'Video teachings by Salim Cyrus on relationships, purpose, manhood, kingdom living, leadership, and the marketplace.',
}

export default async function TeachingsPage() {
  const teachings = await db.teaching.findMany({
    where: { status: 'published' },
    orderBy: { createdAt: 'desc' },
  })

  const byCategory = new Map<string, typeof teachings>()
  for (const category of TEACHING_CATEGORIES) byCategory.set(category, [])
  for (const teaching of teachings) {
    const bucket = byCategory.get(teaching.category)
    if (bucket) bucket.push(teaching)
  }

  return (
    <>
      <PageHero
        eyebrow="Teaching Library"
        title="Video Teachings for the Decisions You're Actually Facing"
        description="Focused, self-paced video teachings organized by the area of life they speak into."
        actions={
          <Button href="#teaching-catalog" size="lg">
            Browse the Library
          </Button>
        }
      />

      <main data-testid="teachings-content">
        <section id="teaching-catalog" className="scroll-mt-24 bg-white" aria-labelledby="teaching-catalog-heading">
          <div className="mx-auto max-w-content px-6 py-16 sm:py-24">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">The Library</p>
              <h2 id="teaching-catalog-heading" className="mt-3 font-heading text-3xl font-bold text-navy sm:text-4xl">
                {teachings.length > 0 ? 'Choose a teaching' : 'New teachings are on the way'}
              </h2>
            </div>

            {teachings.length === 0 ? (
              <div className="mt-14 rounded-2xl border border-dashed border-navy-200 bg-cream p-10 text-center">
                <p className="text-navy-500">
                  The Teaching Library is being built out. Check back soon for the first video teachings.
                </p>
              </div>
            ) : (
              TEACHING_CATEGORIES.map((category) => {
                const items = byCategory.get(category) ?? []
                if (items.length === 0) return null
                return (
                  <div key={category} className="mt-14">
                    <h3 className="font-heading text-xl font-bold text-navy">{category}</h3>
                    <div className="mt-6 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4" data-testid={`teaching-category-${category.toLowerCase()}`}>
                      {items.map((teaching) => (
                        <article key={teaching.slug} className="flex flex-col">
                          <Link
                            href={`/teachings/${teaching.slug}`}
                            className="block aspect-video w-full overflow-hidden rounded-xl bg-navy-50 transition-transform duration-300 ease-out hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold"
                          >
                            {teaching.thumbnailPath ? (
                              <Image
                                src={teaching.thumbnailPath}
                                alt={`${teaching.title} thumbnail`}
                                width={400}
                                height={225}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center font-heading text-2xl font-bold text-gold-500">
                                SC
                              </div>
                            )}
                          </Link>
                          <div className="flex flex-1 flex-col pt-4">
                            <Link href={`/teachings/${teaching.slug}`} className="hover:underline">
                              <h4 className="line-clamp-2 font-heading text-lg font-bold leading-snug text-navy">
                                {teaching.title}
                              </h4>
                            </Link>
                            <p className="mt-1 text-sm text-navy-500">by Salim Cyrus</p>
                            <span className="mt-2 font-heading text-xl font-bold text-navy">
                              {formatCurrency(teaching.priceKes)}
                            </span>
                            <div className="mt-4">
                              <Button href={`/teachings/${teaching.slug}`} className="w-full">
                                View Teaching
                              </Button>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </section>
      </main>
    </>
  )
}
