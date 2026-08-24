import { books } from './books'
import { programs } from './programs'
import { knowledgeCategories } from './knowledge-categories'
import { coachingOffers } from './coaching-offers'

const KEBAB_CASE = /^[a-z0-9]+(-[a-z0-9]+)*$/

function expectUniqueSlugs(entries: { slug: string }[], label: string) {
  const slugs = entries.map((entry) => entry.slug)
  const seen = new Set<string>()
  const duplicates = slugs.filter((slug) => (seen.has(slug) ? true : (seen.add(slug), false)))

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
      .filter((program) => !program.paystackUrl || program.priceKes <= 0 || program.priceUsd <= 0)
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
    const broken = coachingOffers.filter((offer) => !offer.paystackUrl).map((offer) => offer.name)
    expect(broken).toEqual([])
  })
})

describe('knowledge categories data', () => {
  expectUniqueSlugs(knowledgeCategories, 'knowledge categories')
})
