import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { knowledgeCategories } from '@/lib/data/knowledge-categories'
import { CategoryFilter } from '@/components/sections/knowledge/CategoryFilter'
import { PageHero } from '@/components/layout/PageHero'

interface PageProps {
  params: { slug: string }
}

export function generateStaticParams() {
  return knowledgeCategories.map((category) => ({ slug: category.slug }))
}

export function generateMetadata({ params }: PageProps): Metadata {
  const category = knowledgeCategories.find((c) => c.slug === params.slug)
  return {
    title: category ? category.name : 'Category',
    description: category?.description,
  }
}

export default function CategoryPage({ params }: PageProps) {
  const category = knowledgeCategories.find((c) => c.slug === params.slug)
  if (!category) notFound()

  return (
    <>
      <PageHero
        eyebrow="Knowledge Centre"
        title={category.name}
        description={category.description}
      />
      <section className="bg-cream">
        <div className="mx-auto max-w-content px-6 py-20">
          <div>
            <CategoryFilter activeSlug={category.slug} />
          </div>

          <div className="mt-12 grid gap-10 lg:grid-cols-[0.68fr_1.32fr] lg:gap-20">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold-500">
                Guiding Question
              </p>
              <h2 className="mt-3 font-heading text-3xl font-bold leading-tight text-navy">
                {category.guidingQuestion}
              </h2>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-navy-400">
                Subjects in this field
              </p>
              <ol className="mt-4 grid border-t border-navy-200 sm:grid-cols-2">
                {category.topics.map((topic, index) => (
                  <li
                    key={topic}
                    className="flex min-h-16 items-center gap-3 border-b border-navy-200 py-4 sm:odd:pr-6 sm:even:border-l sm:even:pl-6"
                  >
                    <span className="font-heading text-sm font-bold text-gold-500">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <span className="font-semibold text-navy-700">{topic}</span>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <p className="mt-12 border-t border-navy-200 pt-6 text-sm text-navy-500">
            Articles for this field are in editorial development.
          </p>
        </div>
      </section>
    </>
  )
}
