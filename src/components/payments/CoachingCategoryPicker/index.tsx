'use client'

import { useState } from 'react'
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

  const activeCategory = coachingCategories.find((c) => c.slug === category)!
  const pricedTiers = coachingOffers.filter((offer) => offer.category === category)
  const requestTiers = coachingRequestTiers.filter((tier) => tier.category === category)

  return (
    <div>
      <label htmlFor="coaching-category" className="block font-semibold text-navy">
        Choose a coaching format
      </label>
      <select
        id="coaching-category"
        value={category}
        onChange={(e) => setCategory(e.target.value as CoachingCategorySlug)}
        className="mt-3 min-h-12 w-full max-w-md rounded-none border border-navy-200 bg-white px-4 py-3 text-base font-semibold text-navy focus:border-gold-500 focus:outline-none focus:ring-2 focus:ring-gold/30"
      >
        {coachingCategories.map((c) => (
          <option key={c.slug} value={c.slug}>
            {c.name}
          </option>
        ))}
      </select>
      <p className="mt-3 max-w-2xl text-navy-600">{activeCategory.description}</p>

      <div
        className="mt-8 grid gap-px overflow-hidden border border-navy-200 bg-navy-200 sm:grid-cols-2 lg:grid-cols-3"
        data-testid="booking-offers"
      >
        {pricedTiers.map((offer, index) => (
          <article key={offer.name} className="flex min-h-[470px] flex-col bg-white p-7 sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <span className="font-heading text-sm font-bold text-gold-500">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-navy-400">{offer.duration}</span>
            </div>
            <h3 className="mt-8 font-heading text-2xl font-bold text-navy">{offer.name}</h3>
            <p className="mt-3 leading-7 text-navy-600">{offer.tagline}</p>
            <ul className="mt-7 space-y-3 border-t border-navy-200 pt-6">
              {offer.points.map((point) => (
                <li key={point} className="grid grid-cols-[18px_1fr] gap-2 text-sm leading-6 text-navy-600">
                  <span className="text-gold-500" aria-hidden>
                    +
                  </span>
                  {point}
                </li>
              ))}
            </ul>
            <div className="mt-auto pt-8">
              <p className="mb-5 text-xs font-bold uppercase leading-5 tracking-[0.12em] text-navy-500">
                Outcome: {offer.outcome}
              </p>
              <p className="mb-4 font-heading text-2xl font-bold text-navy">{formatCurrency(offer.priceKes)}</p>
              <CoachingCheckoutForm offerName={offer.name} priceKes={offer.priceKes} priceUsd={offer.priceUsd} />
            </div>
          </article>
        ))}
        {requestTiers.map((tier, index) => (
          <article key={tier.label} className="flex min-h-[470px] flex-col bg-white p-7 sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <span className="font-heading text-sm font-bold text-gold-500">
                {String(pricedTiers.length + index + 1).padStart(2, '0')}
              </span>
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-navy-400">Custom quote</span>
            </div>
            <h3 className="mt-8 font-heading text-2xl font-bold text-navy">{tier.label}</h3>
            <p className="mt-3 leading-7 text-navy-600">{tier.description}</p>
            <div className="mt-auto pt-8">
              <p className="mb-5 text-xs font-bold uppercase leading-5 tracking-[0.12em] text-navy-500">
                Priced after a short conversation
              </p>
              {category !== 'standard' && <CoachingQuoteRequestForm category={category} tierLabel={tier.label} />}
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}
