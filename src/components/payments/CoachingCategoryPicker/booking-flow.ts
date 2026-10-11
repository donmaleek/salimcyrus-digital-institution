import type { CoachingCategory, CoachingCategorySlug, CoachingOffer } from '@/lib/data/coaching-offers'
import { coachingRequestTiers } from '@/lib/data/coaching-offers'

export type BookingStep = 1 | 2 | 3
export interface BookingSelection {
  step: BookingStep
  category: CoachingCategorySlug
  selectedOffer: string | null
}

/** Restore only selections present in the catalog supplied by the server. */
export function restoreBookingSelection(
  search: string,
  categories: CoachingCategory[],
  offers: CoachingOffer[]
): BookingSelection {
  const params = new URLSearchParams(search)
  const requestedOffer = offers.find((offer) => offer.name === params.get('offer'))
  if (requestedOffer && categories.some((item) => item.slug === requestedOffer.category)) {
    return { step: 3, category: requestedOffer.category, selectedOffer: requestedOffer.name }
  }
  const requestedCategory = categories.find((item) => item.slug === params.get('category'))
  if (requestedCategory) {
    const request = coachingRequestTiers.find((tier) => tier.category === requestedCategory.slug && tier.label === params.get('request'))
    return {
      step: request ? 3 : 2,
      category: requestedCategory.slug,
      selectedOffer: request?.label ?? null,
    }
  }
  return { step: 1, category: categories[0]?.slug ?? 'standard', selectedOffer: null }
}
