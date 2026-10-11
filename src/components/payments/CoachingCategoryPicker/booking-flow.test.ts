import { restoreBookingSelection } from './booking-flow'
import { coachingCategories, coachingOffers } from '@/lib/data/coaching-offers'

const restore = (search: string) => restoreBookingSelection(search, coachingCategories, coachingOffers)

it('starts at session type selection for a new visitor', () => {
  expect(restore('')).toEqual({ step: 1, category: 'standard', selectedOffer: null })
})
it('restores a valid shared category to session choices', () => {
  expect(restore('?category=couples')).toEqual({ step: 2, category: 'couples', selectedOffer: null })
})
it.each(coachingOffers)('restores $name directly to payment with its actual category', (offer) => {
  expect(restore(`?offer=${encodeURIComponent(offer.name)}&category=vip-summit`)).toEqual({ step: 3, category: offer.category, selectedOffer: offer.name })
})
it('restores request-only tiers within their category', () => {
  expect(restore('?category=individual&request=Your%20Preferred%20Location%2C%20Outside%20Kenya')).toEqual({ step: 3, category: 'individual', selectedOffer: 'Your Preferred Location, Outside Kenya' })
})
it('does not restore a request from a different category', () => {
  expect(restore('?category=standard&request=Speaking%20Engagement')).toEqual({ step: 2, category: 'standard', selectedOffer: null })
})
it('falls back to the valid category when an offer is unknown', () => {
  expect(restore('?category=group&offer=unknown')).toEqual({ step: 2, category: 'group', selectedOffer: null })
})
it('falls back safely for an unknown category or unavailable offer', () => {
  expect(restore('?category=unknown')).toEqual({ step: 1, category: 'standard', selectedOffer: null })
  expect(restoreBookingSelection('?offer=Starter%20Session', [], coachingOffers).step).toBe(1)
})
