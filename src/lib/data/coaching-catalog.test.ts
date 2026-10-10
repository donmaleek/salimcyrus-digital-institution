jest.mock('../../lib/db', () => ({
  db: {
    coachingOfferOverride: { findMany: jest.fn(), findUnique: jest.fn() },
    coachingCategoryImage: { findMany: jest.fn() },
  },
}))

import { db } from '@/lib/db'
import { getCoachingOffers, getCoachingOfferByName, getCoachingCategories } from './coaching-catalog'
import { coachingOffers } from './coaching-offers'

const mockFindMany = db.coachingOfferOverride.findMany as jest.Mock
const mockFindUnique = db.coachingOfferOverride.findUnique as jest.Mock
const mockImagesFindMany = db.coachingCategoryImage.findMany as jest.Mock

describe('getCoachingOffers', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns every static offer unchanged when there are no overrides', async () => {
    mockFindMany.mockResolvedValue([])
    const offers = await getCoachingOffers()
    expect(offers).toEqual(coachingOffers)
  })

  it('applies an override price on top of the static offer without touching its other fields', async () => {
    const target = coachingOffers[0]
    mockFindMany.mockResolvedValue([
      { offerName: target.name, priceKes: 999, priceUsd: null, duration: null, tagline: null, location: null },
    ])
    const offers = await getCoachingOffers()
    const resolved = offers.find((o) => o.name === target.name)!
    expect(resolved.priceKes).toBe(999)
    expect(resolved.priceUsd).toBe(target.priceUsd)
    expect(resolved.duration).toBe(target.duration)
    expect(resolved.tagline).toBe(target.tagline)
  })

  it('applies every overridden field at once when all are set', async () => {
    const target = coachingOffers.find((o) => o.name === 'Identity & Life Alignment Session')!
    mockFindMany.mockResolvedValue([
      {
        offerName: target.name,
        priceKes: 30000,
        priceUsd: 232,
        duration: '3 Hours',
        tagline: 'Updated tagline',
        location: 'Online',
      },
    ])
    const offers = await getCoachingOffers()
    const resolved = offers.find((o) => o.name === target.name)!
    expect(resolved).toMatchObject({
      priceKes: 30000,
      priceUsd: 232,
      duration: '3 Hours',
      tagline: 'Updated tagline',
      location: 'Online',
    })
  })

  it('leaves offers with no matching override completely untouched when other offers do have one', async () => {
    const edited = coachingOffers[0]
    const untouched = coachingOffers[1]
    mockFindMany.mockResolvedValue([
      { offerName: edited.name, priceKes: 1, priceUsd: null, duration: null, tagline: null, location: null },
    ])
    const offers = await getCoachingOffers()
    expect(offers.find((o) => o.name === untouched.name)).toEqual(untouched)
  })
})

describe('getCoachingOfferByName', () => {
  beforeEach(() => jest.clearAllMocks())

  it('returns null for a name that matches no static offer, same as the old .find() behavior', async () => {
    const result = await getCoachingOfferByName('Does Not Exist')
    expect(result).toBeNull()
    expect(mockFindUnique).not.toHaveBeenCalled()
  })

  it('returns the static offer unchanged when no override row exists', async () => {
    mockFindUnique.mockResolvedValue(null)
    const target = coachingOffers[0]
    const result = await getCoachingOfferByName(target.name)
    expect(result).toEqual(target)
  })

  it('applies the override price, which is exactly what a checkout route needs to charge the right amount after an admin edit', async () => {
    const target = coachingOffers[0]
    mockFindUnique.mockResolvedValue({
      offerName: target.name,
      priceKes: 4242,
      priceUsd: 33,
      duration: null,
      tagline: null,
      location: null,
    })
    const result = await getCoachingOfferByName(target.name)
    expect(result?.priceKes).toBe(4242)
    expect(result?.priceUsd).toBe(33)
  })

  it('looks up the override by the exact offer name passed in', async () => {
    mockFindUnique.mockResolvedValue(null)
    await getCoachingOfferByName(coachingOffers[0].name)
    expect(mockFindUnique).toHaveBeenCalledWith({ where: { offerName: coachingOffers[0].name } })
  })
})

describe('getCoachingCategories', () => {
  beforeEach(() => jest.clearAllMocks())

  it('attaches imagePath: null for every category when no admin image has been uploaded', async () => {
    mockImagesFindMany.mockResolvedValue([])
    const categories = await getCoachingCategories()
    expect(categories.every((c) => c.imagePath === null)).toBe(true)
    expect(categories).toHaveLength(8)
  })

  it('attaches the uploaded image path only to the matching category, leaving every other category at null', async () => {
    mockImagesFindMany.mockResolvedValue([
      { categorySlug: 'identity-alignment', imagePath: '/api/coaching/image/identity.webp' },
    ])
    const categories = await getCoachingCategories()
    const identity = categories.find((c) => c.slug === 'identity-alignment')!
    const other = categories.find((c) => c.slug === 'couples')!
    expect(identity.imagePath).toBe('/api/coaching/image/identity.webp')
    expect(other.imagePath).toBeNull()
  })
})
