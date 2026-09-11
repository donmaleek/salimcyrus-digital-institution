import type { MetadataRoute } from 'next'
import { programs } from '@/lib/data/programs'
import { books } from '@/lib/data/books'
import { knowledgeCategories } from '@/lib/data/knowledge-categories'
import { db } from '@/lib/db'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://salimcyrus.com'

const staticRoutes = [
  '',
  '/about',
  '/book-now',
  '/work-with-salim',
  '/work-with-salim/coaching',
  '/work-with-salim/coaching/identity-life-alignment',
  '/work-with-salim/coaching/single-motherhood-life-alignment',
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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
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

  const adminBooks = await db.book
    .findMany({ where: { status: 'available' }, select: { slug: true, updatedAt: true } })
    .catch((error: unknown) => {
      console.warn('Sitemap generated without admin-uploaded books', {
        reason: error instanceof Error ? error.name : 'database unavailable',
      })
      return []
    })

  for (const book of adminBooks) {
    entries.push({
      url: `${BASE_URL}/books/${book.slug}`,
      lastModified: book.updatedAt,
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

  const journalEntries = await db.journalEntry
    .findMany({
      where: { status: 'published' },
      select: { slug: true, publishedAt: true, updatedAt: true },
    })
    .catch((error: unknown) => {
      console.warn('Sitemap generated without database journal entries', {
        reason: error instanceof Error ? error.name : 'database unavailable',
      })
      return []
    })

  for (const entry of journalEntries) {
    entries.push({
      url: `${BASE_URL}/journal/${entry.slug}`,
      lastModified: entry.publishedAt ?? entry.updatedAt,
      changeFrequency: 'monthly',
      priority: 0.7,
    })
  }

  return entries
}
