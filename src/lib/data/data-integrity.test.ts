import { books } from './books'
import { programs } from './programs'
import { knowledgeCategories } from './knowledge-categories'
import { coachingOffers } from './coaching-offers'
import { SOCIAL_LINKS } from '@/lib/utils/constants'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

const KEBAB_CASE = /^[a-z0-9]+(-[a-z0-9]+)*$/

function expectUniqueSlugs(entries: { slug: string }[], label: string) {
  const slugs = entries.map((entry) => entry.slug)
  const seen = new Set<string>()
  const duplicates = slugs.filter((slug) =>
    seen.has(slug) ? true : (seen.add(slug), false)
  )

  it(`${label}: every slug is unique`, () => {
    expect(duplicates).toEqual([])
  })

  it(`${label}: every slug is a URL-safe kebab-case string`, () => {
    const invalid = slugs.filter((slug) => !KEBAB_CASE.test(slug))
    expect(invalid).toEqual([])
  })
}

describe('books data', () => {
  expectUniqueSlugs(books, 'books')

  it('every available book has a price and an order link', () => {
    const broken = books
      .filter((book) => book.status === 'available')
      .filter((book) => !book.priceKes || !book.purchaseUrl)
      .map((book) => book.slug)
    expect(broken).toEqual([])
  })

  it('publishes all 14 distinct confirmed titles at KES 1,499', () => {
    expect(books).toHaveLength(14)
    expect(new Set(books.map((book) => book.title)).size).toBe(14)
    expect(books.every((book) => book.priceKes === 1499)).toBe(true)
  })

  it('every book has a confirmed file for instant download (no ambiguous or missing mappings in the catalog)', () => {
    const missingFile = books.filter((book) => !book.fileName).map((book) => book.slug)
    expect(missingFile).toEqual([])
  })

  it('every book has an optimized local cover and a title-specific order message', () => {
    for (const book of books) {
      expect(
        existsSync(join(process.cwd(), 'public', book.cover.replace(/^\//, '')))
      ).toBe(true)
      expect(book.purchaseUrl).toContain('https://wa.me/')
      expect(decodeURIComponent(book.purchaseUrl)).toContain(book.title)
    }
  })
})

describe('programs data', () => {
  expectUniqueSlugs(programs, 'programs')

  it('every program has a checkout link and positive KES/USD prices', () => {
    const broken = programs
      .filter(
        (program) =>
          !program.paystackUrl || program.priceKes <= 0 || program.priceUsd <= 0
      )
      .map((program) => program.slug)
    expect(broken).toEqual([])
  })
})

describe('coaching offers data', () => {
  it('every offer name is unique', () => {
    const names = coachingOffers.map((offer) => offer.name)
    expect(new Set(names).size).toBe(names.length)
  })

  it('every coaching offer has a checkout link', () => {
    const broken = coachingOffers
      .filter((offer) => !offer.paystackUrl)
      .map((offer) => offer.name)
    expect(broken).toEqual([])
  })
})

describe('knowledge categories data', () => {
  expectUniqueSlugs(knowledgeCategories, 'knowledge categories')
})

describe('social links', () => {
  it('contains the canonical profile URL for every supported platform', () => {
    expect(SOCIAL_LINKS).toEqual({
      linkedin: 'https://www.linkedin.com/in/salim-cyrus-636b2257/',
      tiktok:
        'https://www.tiktok.com/@salimcyrusconnect?is_from_webapp=1&sender_device=pc',
      x: 'https://x.com/SalimCyruske',
      instagram: 'https://www.instagram.com/salimcyruske/',
      facebook: 'https://www.facebook.com/Salimcyrus/',
    })
  })

  it('uses unique HTTPS URLs', () => {
    const urls = Object.values(SOCIAL_LINKS)
    expect(new Set(urls).size).toBe(urls.length)
    expect(urls.every((url) => url.startsWith('https://'))).toBe(true)
  })
})
