import type { MetadataRoute } from 'next'
import { programs } from '@/lib/data/programs'
import { books } from '@/lib/data/books'
import { knowledgeCategories } from '@/lib/data/knowledge-categories'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://salimcyrus.com'

const staticRoutes = [
  '',
  '/about',
  '/work-with-salim',
  '/work-with-salim/coaching',
  '/work-with-salim/speaking',
  '/work-with-salim/consulting',
  '/academy',
  '/academy/courses',
  '/academy/masterclasses',
  '/knowledge-centre',
  '/ask-salim',
  '/journal',
  '/media',
  '/media/videos',
  '/media/podcast',
  '/media/press-kit',
  '/books',
  '/halisi-hub-connect',
  '/halisi-hub-connect/mission',
  '/halisi-hub-connect/community',
  '/halisi-hub-connect/impact',
  '/events',
  '/resources',
  '/resources/free-guides',
  '/resources/digital-library',
  '/testimonials',
  '/contact',
  '/support-the-mission',
  '/faq',
  '/privacy',
  '/terms',
  '/disclaimers',
]

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  const entries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: now,
    changeFrequency: route === '' ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : 0.7,
  }))

  for (const program of programs) {
    entries.push({
      url: `${BASE_URL}/academy/masterclasses/${program.slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.8,
    })
  }

  for (const book of books) {
    entries.push({
      url: `${BASE_URL}/books/${book.slug}`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    })
  }

  for (const category of knowledgeCategories) {
    entries.push({
      url: `${BASE_URL}/knowledge-centre/category/${category.slug}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.6,
    })
  }

  return entries
}
