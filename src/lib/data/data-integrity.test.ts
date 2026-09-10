import { books, BOOK_MIN_PRICE_KES, BOOK_MAX_PRICE_KES } from './books'
import { programs } from './programs'
import { knowledgeCategories } from './knowledge-categories'
import { coachingOffers, coachingCategories, coachingRequestTiers } from './coaching-offers'
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

  it('publishes all 14 distinct confirmed titles', () => {
    expect(books).toHaveLength(14)
    expect(new Set(books.map((book) => book.title)).size).toBe(14)
  })

  it('every book is priced within range and no two books share a price', () => {
    const prices = books.map((book) => book.priceKes)
    expect(prices.every((p) => p >= BOOK_MIN_PRICE_KES && p <= BOOK_MAX_PRICE_KES)).toBe(true)
    expect(new Set(prices).size).toBe(prices.length)
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

  it('every coaching offer has a valid positive price in both KES and USD (checkout is PayPal/Paybill now, not a Paystack link)', () => {
    const broken = coachingOffers
      .filter((offer) => !(offer.priceKes > 0) || !(offer.priceUsd > 0))
      .map((offer) => offer.name)
    expect(broken).toEqual([])
  })

  it('every coaching offer belongs to one of the five published categories', () => {
    const validSlugs = new Set(coachingCategories.map((c) => c.slug))
    const broken = coachingOffers.filter((offer) => !validSlugs.has(offer.category)).map((offer) => offer.name)
    expect(broken).toEqual([])
  })

  it('every request-only tier belongs to one of the five published categories', () => {
    const validSlugs = new Set(coachingCategories.map((c) => c.slug))
    const broken = coachingRequestTiers.filter((tier) => !validSlugs.has(tier.category)).map((tier) => tier.label)
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
