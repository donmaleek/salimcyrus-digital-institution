'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import {
  coachingRequestTiers,
  type CoachingCategorySlug,
  type CoachingOffer,
} from '@/lib/data/coaching-offers'
import type { ResolvedCoachingCategory } from '@/lib/data/coaching-catalog'
import { formatCurrency } from '@/lib/utils/currency'
import { CoachingCheckoutForm } from '@/components/payments/CoachingCheckoutForm'
import { CoachingQuoteRequestForm } from '@/components/forms/CoachingQuoteRequestForm'
import { CoachingTripDetailsForm } from '@/components/forms/CoachingTripDetailsForm'

interface CoachingCategoryPickerProps {
  categories: ResolvedCoachingCategory[]
  offers: CoachingOffer[]
}

/** A tasteful fallback shown on a category card/tab until an admin uploads
 * a real photo for it, so the picker never looks broken in the meantime. */
function CategoryIconFallback({ slug }: { slug: CoachingCategorySlug }) {
  const initials = slug
    .split('-')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
  return (
    <span
      aria-hidden
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gold/15 font-heading text-lg font-bold text-gold-700"
    >
      {initials}
    </span>
  )
}

export function CoachingCategoryPicker({ categories, offers }: CoachingCategoryPickerProps) {
  const [category, setCategory] = useState<CoachingCategorySlug>('standard')
  const [selectedOffer, setSelectedOffer] = useState<string | null>(null)
  const [tripDetailsDone, setTripDetailsDone] = useState<Record<string, boolean>>({})

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const requestedOfferName = searchParams.get('offer')
    const requestedOffer = offers.find((offer) => offer.name === requestedOfferName)
    if (requestedOffer) {
      setCategory(requestedOffer.category)
      setSelectedOffer(requestedOffer.name)
      return
    }

    const requestedCategory = searchParams.get('category')
    if (requestedCategory && categories.some((item) => item.slug === requestedCategory)) {
      setCategory(requestedCategory as CoachingCategorySlug)
    }
    // Intentionally runs once on mount: this reads the URL the visitor
    // arrived with, it does not need to react to later prop changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const activeCategory = categories.find((item) => item.slug === category)!
  const pricedTiers = offers.filter((offer) => offer.category === category)
  const requestTiers = coachingRequestTiers.filter((tier) => tier.category === category)

  function chooseCategory(nextCategory: CoachingCategorySlug) {
    setCategory(nextCategory)
    setSelectedOffer(null)
    const url = new URL(window.location.href)
    url.searchParams.delete('offer')
    url.searchParams.set('category', nextCategory)
    window.history.replaceState({}, '', `${url.pathname}${url.search}#choose-session`)
  }

  function toggleOffer(name: string) {
    setSelectedOffer((current) => (current === name ? null : name))
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-navy font-heading text-xl font-bold text-white">
          1
        </span>
        <div>
          <p className="text-base font-bold text-navy">
            Choose the kind of help you need
          </p>
          <p className="mt-1 text-base leading-7 text-navy-600">
            All session types are shown below. Tap one to see its options.
          </p>
        </div>
      </div>
      <div
        className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
        role="tablist"
        aria-label="Coaching formats"
      >
        {categories.map((item) => {
          const isActive = item.slug === category
          const fixedPrices = offers
            .filter((offer) => offer.category === item.slug)
            .map((offer) => offer.priceKes)
          const hasRequestTier = coachingRequestTiers.some(
            (tier) => tier.category === item.slug
          )
          const priceLabel = fixedPrices.length
            ? `From ${formatCurrency(Math.min(...fixedPrices))}`
            : hasRequestTier
              ? 'Ask for a quote'
              : ''

          return (
            <button
              key={item.slug}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls="coaching-offers-panel"
              onClick={() => chooseCategory(item.slug)}
              className={`min-h-[132px] border p-5 text-left transition-[background-color,border-color,color,transform] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 active:translate-y-px ${
                isActive
                  ? 'border-navy bg-navy text-white ring-2 ring-navy ring-offset-2'
                  : 'border-navy-200 bg-white text-navy hover:border-gold-500 hover:bg-cream'
              }`}
            >
              <span className="flex items-start gap-3">
                {item.imagePath ? (
                  <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full">
                    <Image src={item.imagePath} alt="" fill unoptimized className="object-cover" />
                  </span>
                ) : (
                  <CategoryIconFallback slug={item.slug} />
                )}
                <span className="flex-1">
                  <span className="flex items-start justify-between gap-3">
                    <span className="text-lg font-bold leading-6">{item.name}</span>
                    <span
                      className={`shrink-0 text-sm font-bold ${
                        isActive ? 'text-gold' : 'text-navy-500'
                      }`}
                    >
                      {isActive ? 'Selected' : 'Choose'}
                    </span>
                  </span>
                  <span
                    className={`mt-2 block text-base leading-6 ${
                      isActive ? 'text-white/80' : 'text-navy-600'
                    }`}
                  >
                    {item.description}
                  </span>
                  <span
                    className={`mt-3 block text-base font-bold ${
                      isActive ? 'text-gold' : 'text-gold-700'
                    }`}
                  >
                    {priceLabel}
                  </span>
                </span>
              </span>
            </button>
          )
        })}
      </div>

      <div className="mt-12 grid gap-5 border-b border-navy-200 pb-7 sm:grid-cols-[1fr_auto] sm:items-end">
        <div className="flex items-start gap-4">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gold font-heading text-xl font-bold text-navy">
            2
          </span>
          <div>
            <p className="text-base font-bold text-navy">Choose your session</p>
            <h3 className="mt-2 font-heading text-2xl font-bold text-navy sm:text-3xl">
              {activeCategory.name}
            </h3>
            <p className="mt-2 max-w-2xl text-base leading-7 text-navy-600">
              {activeCategory.description}
            </p>
          </div>
        </div>
        <p className="pl-[60px] text-base font-semibold text-navy-600 sm:pl-0">
          {pricedTiers.length + requestTiers.length}{' '}
          {pricedTiers.length + requestTiers.length === 1
            ? 'option'
            : 'options'}
        </p>
      </div>

      <div
        id="coaching-offers-panel"
        role="tabpanel"
        data-testid="booking-offers"
      >
        {pricedTiers.map((offer, index) => {
          const isSelected = selectedOffer === offer.name
          const panelId = `checkout-${category}-${index}`
          const needsTripDetails = Boolean(offer.requiresTripDetails)
          const tripDone = tripDetailsDone[offer.name] ?? false

          return (
            <article
              key={offer.name}
              className="border-b border-navy-200 py-8 sm:py-10"
            >
              <div className="grid gap-7 lg:grid-cols-[0.8fr_1.2fr_0.62fr] lg:items-start lg:gap-12">
                <div>
                  <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-[0.12em] text-gold-700">
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <span className="h-px w-8 bg-gold-400" aria-hidden />
                    <span>{offer.location ?? activeCategory.name}</span>
                  </div>
                  <h4 className="mt-4 max-w-md font-heading text-2xl font-bold leading-tight text-navy sm:text-3xl">
                    {offer.name}
                  </h4>
                  <p className="mt-3 text-lg leading-7 text-navy-600">
                    {offer.tagline}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-bold uppercase tracking-[0.12em] text-navy-500">
                    This session helps you
                  </p>
                  <ul className="mt-4 space-y-3">
                    {offer.points.map((point) => (
                      <li
                        key={point}
                        className="grid grid-cols-[16px_1fr] gap-3 leading-7 text-navy-600"
                      >
                        <span
                          className="mt-[0.7rem] h-1.5 w-1.5 bg-gold-500"
                          aria-hidden
                        />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-5 border-t border-navy-100 pt-4 text-base leading-7 text-navy-600">
                    <span className="font-bold text-navy">You leave with:</span>{' '}
                    {offer.outcome}
                  </p>
                  {offer.logisticsNote && (
                    <p
                      className="mt-4 border-t border-navy-100 pt-4 text-base leading-7 text-navy-600"
                      data-testid="coaching-logistics-note"
                    >
                      <span className="font-bold text-navy">Travel &amp; accommodation:</span>{' '}
                      {offer.logisticsNote}
                    </p>
                  )}
                </div>

                <div className="lg:text-right">
                  <p className="text-sm font-bold uppercase tracking-[0.12em] text-navy-500">
                    Duration
                  </p>
                  <p className="mt-2 font-heading text-2xl font-bold text-navy" data-testid="coaching-duration">
                    {offer.duration}
                  </p>
                  <p className="mt-5 text-sm font-bold uppercase tracking-[0.12em] text-navy-500">
                    Investment
                  </p>
                  <p className="mt-2 font-heading text-3xl font-bold text-navy">
                    {formatCurrency(offer.priceKes)}
                  </p>
                  <p className="mt-1 text-sm text-navy-500">
                    via Paystack, or ${offer.priceUsd} via PayPal
                  </p>
                  <button
                    type="button"
                    aria-expanded={isSelected}
                    aria-controls={panelId}
                    onClick={() => toggleOffer(offer.name)}
                    className="mt-5 min-h-14 w-full bg-gold px-5 py-4 text-base font-bold text-navy transition-colors hover:bg-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 lg:max-w-[240px]"
                  >
                    {isSelected ? 'Close payment options' : 'Book Session'}
                  </button>
                </div>
              </div>

              {isSelected && (
                <div
                  id={panelId}
                  className="mt-8 border-t border-navy-200 bg-cream p-5 sm:p-8 lg:ml-auto lg:w-[62%]"
                >
                  <div className="flex items-start gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-navy font-heading text-xl font-bold text-white">
                      3
                    </span>
                    <div>
                      <p className="text-base font-bold text-navy">
                        {needsTripDetails && !tripDone ? 'Trip details' : 'Choose how to pay'}
                      </p>
                      <p className="mt-1 font-heading text-xl font-bold text-navy">
                        {offer.name}
                      </p>
                    </div>
                  </div>

                  {needsTripDetails && !tripDone ? (
                    <div className="mt-5">
                      <CoachingTripDetailsForm
                        offerName={offer.name}
                        variant={offer.category === 'couples' ? 'couples' : 'individual'}
                        onSubmitted={() =>
                          setTripDetailsDone((current) => ({ ...current, [offer.name]: true }))
                        }
                      />
                    </div>
                  ) : (
                    <>
                      <p className="mt-4 text-base leading-7 text-navy-600">
                        Choose Paystack or PayPal for immediate checkout, or M-Pesa
                        Paybill for manual confirmation.
                      </p>
                      <div className="mt-5">
                        <CoachingCheckoutForm
                          offerName={offer.name}
                          priceKes={offer.priceKes}
                          priceUsd={offer.priceUsd}
                        />
                      </div>
                    </>
                  )}
                </div>
              )}
            </article>
          )
        })}

        {requestTiers.map((tier, index) => {
          const isSelected = selectedOffer === tier.label
          const panelId = `request-${category}-${index}`

          return (
            <article
              key={tier.label}
              className="border-b border-navy-200 py-8 sm:py-10"
            >
              <div className="grid gap-7 lg:grid-cols-[0.8fr_1.2fr_0.62fr] lg:items-start lg:gap-12">
                <div>
                  <div className="flex items-center gap-3 text-sm font-bold uppercase tracking-[0.12em] text-gold-700">
                    <span>
                      {String(pricedTiers.length + index + 1).padStart(2, '0')}
                    </span>
                    <span className="h-px w-8 bg-gold-400" aria-hidden />
                    <span>Tailored engagement</span>
                  </div>
                  <h4 className="mt-4 max-w-md font-heading text-2xl font-bold leading-tight text-navy sm:text-3xl">
                    {tier.label}
                  </h4>
                </div>
                <p className="max-w-xl text-lg leading-8 text-navy-600">
                  {tier.description}
                </p>
                <div className="lg:text-right">
                  <p className="text-sm font-bold uppercase tracking-[0.12em] text-navy-500">
                    Investment
                  </p>
                  <p className="mt-2 font-heading text-2xl font-bold text-navy">
                    Custom proposal
                  </p>
                  <button
                    type="button"
                    aria-expanded={isSelected}
                    aria-controls={panelId}
                    onClick={() => toggleOffer(tier.label)}
                    className="mt-5 min-h-14 w-full border border-navy bg-white px-5 py-4 text-base font-bold text-navy transition-colors hover:bg-navy hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 lg:max-w-[240px]"
                  >
                    {isSelected ? 'Close enquiry' : 'Request a proposal'}
                  </button>
                </div>
              </div>
              {isSelected && (
                <div
                  id={panelId}
                  className="mt-8 border-t border-navy-200 bg-cream p-5 sm:p-8 lg:ml-auto lg:w-[62%]"
                >
                  <CoachingQuoteRequestForm
                    category={tier.category}
                    tierLabel={tier.label}
                  />
                </div>
              )}
            </article>
          )
        })}
      </div>
    </div>
  )
}
