import { books } from './books'
import { programs } from './programs'
import { knowledgeCategories } from './knowledge-categories'
import { coachingOffers } from './coaching-offers'
import { SOCIAL_LINKS } from '@/lib/utils/constants'

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

  it('every available book has a price and a checkout link', () => {
    const broken = books
      .filter((book) => book.status === 'available')
      .filter((book) => !book.priceKes || !book.paystackUrl)
      .map((book) => book.slug)
    expect(broken).toEqual([])
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
