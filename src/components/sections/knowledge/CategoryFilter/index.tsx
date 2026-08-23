import Link from 'next/link'
import { knowledgeCategories } from '@/lib/data/knowledge-categories'

export function CategoryFilter({ activeSlug }: { activeSlug?: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      {knowledgeCategories.map((category) => (
        <Link
          key={category.slug}
          href={`/knowledge-centre/category/${category.slug}`}
          className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
            activeSlug === category.slug
              ? 'border-gold bg-gold text-navy-900'
              : 'border-navy-200 text-navy-700 hover:border-gold hover:text-gold-500'
          }`}
        >
          {category.name}
        </Link>
      ))}
    </div>
  )
}
