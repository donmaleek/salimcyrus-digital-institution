import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { knowledgeCategories } from '@/lib/data/knowledge-categories'
import { CategoryFilter } from '@/components/sections/knowledge/CategoryFilter'

interface PageProps {
  params: { slug: string }
}

export function generateStaticParams() {
  return knowledgeCategories.map((category) => ({ slug: category.slug }))
}

export function generateMetadata({ params }: PageProps): Metadata {
  const category = knowledgeCategories.find((c) => c.slug === params.slug)
  return { title: category ? category.name : 'Category' }
}

export default function CategoryPage({ params }: PageProps) {
  const category = knowledgeCategories.find((c) => c.slug === params.slug)
  if (!category) notFound()

  return (
    <section className="bg-cream">
      <div className="mx-auto max-w-content px-6 py-20">
        <p className="font-body text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
          Knowledge Centre
        </p>
        <h1 className="mt-4 font-heading text-4xl font-bold text-navy sm:text-5xl">
          {category.name}
        </h1>

        <div className="mt-8">
          <CategoryFilter activeSlug={category.slug} />
        </div>

        <div className="mt-10 flex flex-wrap gap-2">
          {category.topics.map((topic) => (
            <span
              key={topic}
              className="rounded-full border border-navy-200 bg-white px-4 py-2 text-sm text-navy-700"
            >
              {topic}
            </span>
          ))}
        </div>

        <p className="mt-12 text-sm text-navy-400">
          Articles in this category will appear here as they&apos;re published in the CMS.
        </p>
      </div>
    </section>
  )
}
