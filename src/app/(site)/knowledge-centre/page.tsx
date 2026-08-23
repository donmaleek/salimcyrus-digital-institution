import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHero } from '@/components/layout/PageHero'
import { knowledgeCategories } from '@/lib/data/knowledge-categories'

export const metadata: Metadata = {
  title: 'Knowledge Centre',
  description: 'A searchable library of teachings on relationships, manhood, purpose, kingdom, leadership, business, and society.',
}

export default function KnowledgeCentrePage() {
  return (
    <>
      <PageHero
        eyebrow="Knowledge Centre"
        title="A Library, Not a Biography"
        description="Articles, videos, and answered questions organized by the fundamental areas that shape human life."
      />
      <section className="bg-cream">
        <div className="mx-auto max-w-content px-6 py-20">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {knowledgeCategories.map((category) => (
              <Link
                key={category.slug}
                href={`/knowledge-centre/category/${category.slug}`}
                className="rounded-2xl border border-navy-100 bg-white p-6 transition-shadow hover:shadow-lg"
              >
                <h2 className="font-heading text-lg font-semibold text-navy">{category.name}</h2>
                <p className="mt-2 text-sm text-navy-500">{category.topics.slice(0, 5).join(' · ')}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
