'use client'

import { useEffect, useState } from 'react'
import {
  coachingCategories,
  coachingOffers,
  coachingRequestTiers,
  type CoachingCategorySlug,
} from '@/lib/data/coaching-offers'
import { formatCurrency } from '@/lib/utils/currency'
import { CoachingCheckoutForm } from '@/components/payments/CoachingCheckoutForm'
import { CoachingQuoteRequestForm } from '@/components/forms/CoachingQuoteRequestForm'

export function CoachingCategoryPicker() {
  const [category, setCategory] = useState<CoachingCategorySlug>('standard')
  const [selectedOffer, setSelectedOffer] = useState<string | null>(null)

  useEffect(() => {
    const requestedOfferName = new URLSearchParams(window.location.search).get(
      'offer'
    )
    const requestedOffer = coachingOffers.find(
      (offer) => offer.name === requestedOfferName
    )
    if (!requestedOffer) return

    setCategory(requestedOffer.category)
    setSelectedOffer(requestedOffer.name)
  }, [])

  const activeCategory = coachingCategories.find(
    (item) => item.slug === category
  )!
  const pricedTiers = coachingOffers.filter(
    (offer) => offer.category === category
  )
  const requestTiers = coachingRequestTiers.filter(
    (tier) => tier.category === category
  )

  function chooseCategory(nextCategory: CoachingCategorySlug) {
    setCategory(nextCategory)
    setSelectedOffer(null)
  }

  function toggleOffer(name: string) {
    setSelectedOffer((current) => (current === name ? null : name))
  }

  return (
    <div>
      <div
        className="flex gap-2 overflow-x-auto border-b border-navy-200 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="tablist"
        aria-label="Coaching formats"
      >
        {coachingCategories.map((item) => {
          const isActive = item.slug === category
          return (
            <button
              key={item.slug}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls="coaching-offers-panel"
              onClick={() => chooseCategory(item.slug)}
              className={`min-h-12 shrink-0 border px-5 py-3 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 ${
                isActive
                  ? 'border-navy bg-navy text-white'
                  : 'border-navy-200 bg-white text-navy hover:border-gold-500 hover:text-gold-700'
              }`}
            >
              {item.name}
            </button>
          )
        })}
      </div>

      <div className="grid gap-5 border-b border-navy-200 py-7 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-gold-600">
            Selected format
          </p>
          <h3 className="mt-2 font-heading text-2xl font-bold text-navy sm:text-3xl">
            {activeCategory.name}
          </h3>
          <p className="mt-2 max-w-2xl text-base leading-7 text-navy-600">
            {activeCategory.description}
          </p>
        </div>
        <p className="text-sm font-semibold text-navy-500">
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

          return (
            <article
              key={offer.name}
              className="border-b border-navy-200 py-8 sm:py-10"
            >
              <div className="grid gap-7 lg:grid-cols-[0.8fr_1.2fr_0.62fr] lg:items-start lg:gap-12">
                <div>
                  <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.16em] text-gold-600">
                    <span>{String(index + 1).padStart(2, '0')}</span>
                    <span className="h-px w-8 bg-gold-400" aria-hidden />
                    <span>{offer.duration}</span>
                  </div>
                  <h4 className="mt-4 max-w-md font-heading text-2xl font-bold leading-tight text-navy sm:text-3xl">
                    {offer.name}
                  </h4>
                  <p className="mt-3 text-lg leading-7 text-navy-600">
                    {offer.tagline}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-navy-400">
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
                  <p className="mt-5 border-t border-navy-100 pt-4 text-sm leading-6 text-navy-500">
                    <span className="font-bold text-navy">You leave with:</span>{' '}
                    {offer.outcome}
                  </p>
                </div>

                <div className="lg:text-right">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-navy-400">
                    Investment
                  </p>
                  <p className="mt-2 font-heading text-3xl font-bold text-navy">
                    {formatCurrency(offer.priceKes)}
                  </p>
                  <p className="mt-1 text-sm text-navy-500">
                    or ${offer.priceUsd} via PayPal
                  </p>
                  <button
                    type="button"
                    aria-expanded={isSelected}
                    aria-controls={panelId}
                    onClick={() => toggleOffer(offer.name)}
                    className="mt-5 min-h-12 w-full bg-gold px-5 py-3 text-sm font-bold text-navy transition-colors hover:bg-gold-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 lg:max-w-[220px]"
                  >
                    {isSelected
                      ? 'Close payment options'
                      : `Select ${offer.name}`}
                  </button>
                </div>
              </div>

              {isSelected && (
                <div
                  id={panelId}
                  className="mt-8 border-t border-navy-200 bg-cream p-5 sm:p-8 lg:ml-auto lg:w-[62%]"
                >
                  <p className="font-heading text-xl font-bold text-navy">
                    Pay for {offer.name}
                  </p>
                  <p className="mt-2 text-sm leading-6 text-navy-600">
                    Choose PayPal for immediate checkout or M-Pesa Paybill for
                    manual confirmation.
                  </p>
                  <div className="mt-5">
                    <CoachingCheckoutForm
                      offerName={offer.name}
                      priceKes={offer.priceKes}
                      priceUsd={offer.priceUsd}
                    />
                  </div>
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
                  <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-[0.16em] text-gold-600">
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
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-navy-400">
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
                    className="mt-5 min-h-12 w-full border border-navy bg-white px-5 py-3 text-sm font-bold text-navy transition-colors hover:bg-navy hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2 lg:max-w-[220px]"
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
