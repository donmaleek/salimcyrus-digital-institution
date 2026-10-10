import { db } from '@/lib/db'
import {
  coachingOffers,
  coachingCategories,
  type CoachingOffer,
  type CoachingCategory,
} from '@/lib/data/coaching-offers'

export interface ResolvedCoachingCategory extends CoachingCategory {
  /** null until an admin uploads one; the picker falls back to a built-in
   * icon/gradient treatment rather than rendering a broken image. */
  imagePath: string | null
}

/**
 * Applies a CoachingOfferOverride on top of an offer's static defaults.
 * Every field on the override is optional and independent: editing just
 * the price from the admin dashboard leaves duration/tagline/location at
 * their static values, not blanked out.
 */
function applyOverride(
  offer: CoachingOffer,
  override: { priceKes: number | null; priceUsd: number | null; duration: string | null; tagline: string | null; location: string | null } | undefined
): CoachingOffer {
  if (!override) return offer
  return {
    ...offer,
    priceKes: override.priceKes ?? offer.priceKes,
    priceUsd: override.priceUsd ?? offer.priceUsd,
    duration: override.duration ?? offer.duration,
    tagline: override.tagline ?? offer.tagline,
    location: override.location ?? offer.location,
  }
}

/** Every priced coaching offer, with any admin edits already applied.
 * Use this (not the raw `coachingOffers` import) anywhere a price or
 * duration is shown to a visitor or charged to a buyer. */
export async function getCoachingOffers(): Promise<CoachingOffer[]> {
  const overrides = await db.coachingOfferOverride.findMany()
  const byName = new Map(overrides.map((override) => [override.offerName, override]))
  return coachingOffers.map((offer) => applyOverride(offer, byName.get(offer.name)))
}

/** The single offer a checkout/claim route is about to charge for, with
 * any admin price edit already applied. Returns null for an unknown name,
 * exactly like the static array's `.find` did, so callers keep their
 * existing 404 handling unchanged. */
export async function getCoachingOfferByName(name: string): Promise<CoachingOffer | null> {
  const offer = coachingOffers.find((candidate) => candidate.name === name)
  if (!offer) return null
  const override = await db.coachingOfferOverride.findUnique({ where: { offerName: name } })
  return applyOverride(offer, override ?? undefined)
}

/** Every coaching category, with an admin-uploaded card image attached
 * where one exists. */
export async function getCoachingCategories(): Promise<ResolvedCoachingCategory[]> {
  const images = await db.coachingCategoryImage.findMany()
  const pathBySlug = new Map(images.map((image) => [image.categorySlug, image.imagePath]))
  return coachingCategories.map((category) => ({
    ...category,
    imagePath: pathBySlug.get(category.slug) ?? null,
  }))
}
