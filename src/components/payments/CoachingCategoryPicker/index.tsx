'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import {
  coachingRequestTiers,
  type CoachingCategorySlug,
  type CoachingOffer,
} from '@/lib/data/coaching-offers'
import type { ResolvedCoachingCategory } from '@/lib/data/coaching-catalog'
import { formatCurrency } from '@/lib/utils/currency'
import { WHATSAPP_URL } from '@/lib/utils/constants'
import { CoachingCheckoutForm } from '@/components/payments/CoachingCheckoutForm'
import { CoachingQuoteRequestForm } from '@/components/forms/CoachingQuoteRequestForm'
import { CoachingTripDetailsForm } from '@/components/forms/CoachingTripDetailsForm'
import { restoreBookingSelection, type BookingStep } from './booking-flow'

interface CoachingCategoryPickerProps {
  categories: ResolvedCoachingCategory[]
  offers: CoachingOffer[]
}

function CategoryIconFallback({ slug }: { slug: CoachingCategorySlug }) {
  return (
    <span aria-hidden className="flex aspect-[16/9] w-full items-center justify-center bg-navy font-heading text-4xl text-gold">
      {slug.split('-').map((part) => part[0]).join('').slice(0, 2).toUpperCase()}
    </span>
  )
}

const control = 'min-h-12 rounded-lg px-4 py-3 text-base font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-navy'

export function CoachingCategoryPicker({ categories, offers }: CoachingCategoryPickerProps) {
  const [category, setCategory] = useState<CoachingCategorySlug>(categories[0]?.slug ?? 'standard')
  const [selectedOffer, setSelectedOffer] = useState<string | null>(null)
  const [step, setStep] = useState<BookingStep>(1)
  const [tripDetailsDone, setTripDetailsDone] = useState<Record<string, boolean>>({})
  const headingRef = useRef<HTMLHeadingElement>(null)
  const decisionRef = useRef<HTMLDivElement>(null)
  const focusNext = useRef(false)

  useEffect(() => {
    function restore(event?: PopStateEvent) {
      const selection = restoreBookingSelection(window.location.search, categories, offers)
      setCategory(selection.category)
      setSelectedOffer(selection.selectedOffer)
      setStep(selection.step)
      focusNext.current = Boolean(event) || selection.step !== 1
    }
    restore()
    window.addEventListener('popstate', restore)
    return () => window.removeEventListener('popstate', restore)
  }, [categories, offers])

  const activeOffer = offers.find((item) => item.category === category && item.name === selectedOffer)
  const activeTripDone = activeOffer ? tripDetailsDone[activeOffer.name] ?? false : false

  useEffect(() => {
    if (!focusNext.current) return
    focusNext.current = false
    headingRef.current?.focus({ preventScroll: true })
    decisionRef.current?.scrollIntoView({ block: 'start', behavior: 'instant' })
  }, [step, category, selectedOffer, activeTripDone])

  const activeCategory = categories.find((item) => item.slug === category)
  const pricedTiers = offers.filter((offer) => offer.category === category)
  const requestTiers = coachingRequestTiers.filter((tier) => tier.category === category)
  const offer = pricedTiers.find((item) => item.name === selectedOffer)
  const tier = requestTiers.find((item) => item.label === selectedOffer)
  const needsTripDetails = Boolean(offer?.requiresTripDetails)
  const tripDone = offer ? tripDetailsDone[offer.name] ?? false : false

  function navigate(nextStep: BookingStep, nextCategory = category, name: string | null = selectedOffer, isRequest = false) {
    if (nextStep === step && nextCategory === category && name === selectedOffer) return
    focusNext.current = true
    setCategory(nextCategory)
    setSelectedOffer(name)
    setStep(nextStep)
    const url = new URL(window.location.href)
    url.searchParams.delete('offer')
    url.searchParams.delete('request')
    url.searchParams.delete('category')
    if (nextStep > 1) url.searchParams.set('category', nextCategory)
    if (nextStep === 3 && name) url.searchParams.set(isRequest ? 'request' : 'offer', name)
    window.history.pushState({}, '', `${url.pathname}${url.search}#choose-session`)
  }

  function chooseCategory(nextCategory: CoachingCategorySlug) {
    navigate(2, nextCategory, null)
  }

  if (!activeCategory) return <p>Please <a href="/contact" className="underline">contact the team</a> for help booking a session.</p>

  const title = step === 1 ? 'What would you like help with?' : step === 2 ? 'Choose your session' : tier ? 'Send your booking request' : needsTripDetails && !tripDone ? 'Tell us where to meet you' : 'Your details & payment'
  const stepLabels = ['Session type', 'Choose session', tier ? 'Send request' : 'Details & payment']

  return (
    <div data-testid="guided-booking" data-step={step}>
      <ol aria-label="Booking progress" className="mb-7 grid grid-cols-3 gap-2 border-b border-navy-100 pb-5">
        {stepLabels.map((label, index) => {
          const number = (index + 1) as BookingStep
          return (
            <li key={index}>
              <button
                type="button"
                disabled={number > step}
                aria-current={number === step ? 'step' : undefined}
                onClick={() => navigate(number, category, number === 1 ? null : selectedOffer, Boolean(tier))}
                className={`flex min-h-12 w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-navy sm:text-base ${number === step ? 'bg-navy text-white' : number < step ? 'text-navy underline underline-offset-4' : 'text-navy-500'}`}
              >
                <span aria-hidden className="shrink-0">{number}.</span>
                {label}
              </button>
            </li>
          )
        })}
      </ol>

      <div ref={decisionRef} className="mb-6 scroll-mt-6">
        {step > 1 && (
          <button type="button" onClick={() => navigate(step === 3 ? 2 : 1, category, null)} className={`${control} mb-3 -ml-4 text-navy underline underline-offset-4`}>
            <span aria-hidden>←</span> {step === 3 ? 'Back to sessions' : 'Change session type'}
          </button>
        )}
        <p className="mb-2 text-sm font-semibold text-navy-500">Step {step} of 3</p>
        <h2 ref={headingRef} tabIndex={-1} className="scroll-mt-6 font-heading text-2xl font-bold leading-tight text-navy outline-none sm:text-3xl" data-testid="booking-step-heading">
          {title}
        </h2>
        <p className="mt-3 text-base leading-7 text-navy-600">
          {step === 1 ? 'Choose a session type to see the available sessions and prices.' : step === 2 ? `Sessions for ${activeCategory.name}. Choose one to continue.` : tier ? 'Share a few details. The team will contact you with rates and availability. No payment is taken here.' : needsTripDetails && !tripDone ? 'We need your travel details before you continue to payment.' : 'Pay securely, then choose a time or ask for scheduling help on the confirmation page.'}
        </p>
      </div>

      {step === 1 && (
        <>
          <div className="grid gap-3 sm:grid-cols-2" aria-label="Session types" data-testid="booking-categories">
            {categories.map((item) => {
              const fixedPrices = offers.filter((candidate) => candidate.category === item.slug).map((candidate) => candidate.priceKes)
              const priceLabel = fixedPrices.length ? `From ${formatCurrency(Math.min(...fixedPrices))}` : 'Ask for a quote'
              return (
                <button key={item.slug} type="button" onClick={() => chooseCategory(item.slug)} aria-label={`Choose ${item.name}`} className="flex min-h-12 items-start justify-between gap-4 rounded-xl border border-navy-200 bg-white p-4 text-left transition-colors hover:border-navy hover:bg-navy-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-navy sm:p-5">
                  <span>
                    <span className="block text-base font-bold text-navy">{item.name}</span>
                    <span className="mt-1 block text-base leading-6 text-navy-600">{item.description}</span>
                    <span className="mt-2 block text-base font-semibold text-navy">{priceLabel}</span>
                  </span>
                  <span aria-hidden className="mt-1 text-xl text-navy">→</span>
                </button>
              )
            })}
          </div>
          <p className="mt-5 rounded-lg bg-navy-50 p-4 text-base leading-7 text-navy-600"><span className="font-semibold text-navy">Not sure where to start?</span> Choose Standard Sessions for a focused question or decision, or <a href={WHATSAPP_URL} className="font-semibold text-navy underline underline-offset-4">ask us on WhatsApp</a>.</p>
        </>
      )}

      {step > 1 && (
        <div className="grid items-start gap-7 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div>
            {step === 2 && (
              <div className="space-y-4" data-testid="booking-offers">
                {pricedTiers.map((offer) => (
                  <article key={offer.name} className="rounded-xl border border-navy-200 bg-white p-5 sm:p-6">
                    <h3 className="text-xl font-bold leading-7 text-navy">{offer.name}</h3>
                    <p className="mt-2 text-base leading-7 text-navy-600">{offer.tagline}</p>
                    {offer.location && <p className="mt-2 text-base leading-7 text-navy-600"><span className="font-semibold text-navy">Location:</span> {offer.location}</p>}
                    <dl className="mt-5 flex flex-wrap gap-x-8 gap-y-3 border-y border-navy-100 py-4">
                      <div><dt className="text-sm font-semibold text-navy-500">Duration</dt><dd className="mt-1 text-lg font-bold text-navy" data-testid="coaching-duration">{offer.duration}</dd></div>
                      <div><dt className="text-sm font-semibold text-navy-500">Price</dt><dd className="mt-1 text-lg font-bold text-navy">{formatCurrency(offer.priceKes)} <span className="text-base font-normal text-navy-600">/ ${offer.priceUsd} USD</span></dd></div>
                    </dl>
                    <details className="mt-4 text-base leading-7 text-navy-600">
                      <summary className="min-h-12 cursor-pointer py-3 font-semibold text-navy">What this session includes</summary>
                      <p className="mt-2 font-semibold text-navy">This session helps you</p>
                      <ul className="mt-2 list-disc space-y-1 pl-5">{offer.points.map((point) => <li key={point}>{point}</li>)}</ul>
                      <p className="mt-3"><span className="font-semibold text-navy">You leave with:</span> {offer.outcome}</p>
                    </details>
                    {offer.logisticsNote && <p className="mt-3 rounded-lg bg-cream p-3 text-base leading-7 text-navy-600" data-testid="coaching-logistics-note"><span className="font-semibold text-navy">Travel &amp; accommodation:</span> {offer.logisticsNote}</p>}
                    <button type="button" onClick={() => navigate(3, category, offer.name)} aria-label={`Book ${offer.name}`} className={`${control} mt-4 w-full bg-navy text-white hover:bg-navy-700`}>
                      Book this session <span aria-hidden>→</span>
                    </button>
                  </article>
                ))}
                {requestTiers.map((tier) => (
                  <article key={tier.label} className="rounded-xl border border-navy-200 bg-white p-5 sm:p-6">
                    <h3 className="text-xl font-bold leading-7 text-navy">{tier.label}</h3>
                    <p className="mt-2 text-base leading-7 text-navy-600">{tier.description}</p>
                    <p className="mt-4 text-lg font-bold text-navy">{tier.detail?.rateNote ?? 'Ask for a quote'}</p>
                    {tier.detail && <details className="mt-3 text-base leading-7 text-navy-600"><summary className="min-h-12 cursor-pointer py-3 font-semibold text-navy">Travel and booking arrangements</summary><dl className="space-y-3" data-testid="coaching-request-arrangements"><div><dt className="font-semibold text-navy">Duration</dt><dd>{tier.detail.durationNote}</dd></div>{tier.detail.arrangements.map((arrangement) => <div key={arrangement.label}><dt className="font-semibold text-navy">{arrangement.label}</dt><dd>{arrangement.note}</dd></div>)}</dl><ol className="mt-3 list-decimal space-y-2 pl-5">{tier.detail.howToBook.map((item) => <li key={item}>{item}</li>)}</ol></details>}
                    <button type="button" aria-label={`Request ${tier.label}`} onClick={() => navigate(3, category, tier.label, true)} className={`${control} mt-4 w-full bg-navy text-white hover:bg-navy-700`}>
                      {tier.detail?.ctaLabel ?? 'Request this session'} <span aria-hidden>→</span>
                    </button>
                  </article>
                ))}
              </div>
            )}
            {step === 3 && offer && (
              <section aria-label="Complete your booking" className="rounded-xl border border-navy-200 bg-white p-5 sm:p-7" key={`${category}-${offer.name}`}>
                <div className="mb-6 border-b border-navy-100 pb-5" data-testid="booking-selection-summary">
                  <p className="text-sm font-semibold text-navy-500">Your selected session</p>
                  <h3 className="mt-2 text-xl font-bold leading-7 text-navy">{offer.name}</h3>
                  <p className="mt-2 text-base text-navy-600">{offer.duration}</p>
                  {offer.location && <p className="mt-2 text-base leading-7 text-navy-600"><span className="font-semibold text-navy">Location:</span> {offer.location}</p>}
                  <p className="mt-3 text-2xl font-bold text-navy">{formatCurrency(offer.priceKes)} <span className="text-base font-normal text-navy-600">/ ${offer.priceUsd} USD</span></p>
                  {offer.logisticsNote && <p className="mt-3 text-base leading-7 text-navy-600" data-testid="coaching-logistics-note">{offer.logisticsNote}</p>}
                </div>
                {needsTripDetails && !tripDone ? (
                  <CoachingTripDetailsForm offerName={offer.name} variant={offer.category === 'couples' ? 'couples' : 'individual'} onSubmitted={() => { focusNext.current = true; setTripDetailsDone((current) => ({ ...current, [offer.name]: true })) }} />
                ) : (
                  <CoachingCheckoutForm offerName={offer.name} priceKes={offer.priceKes} priceUsd={offer.priceUsd} />
                )}
              </section>
            )}
            {step === 3 && tier && <section aria-label="Request your session" className="rounded-xl border border-navy-200 bg-white p-5 sm:p-7" key={`${category}-${tier.label}`}><h3 className="mb-2 text-xl font-bold text-navy">{tier.label}</h3><CoachingQuoteRequestForm category={tier.category} tierLabel={tier.label} collectsLocationAndDate={tier.collectsLocationAndDate} initiallyExpanded /></section>}
          </div>
          <aside className="rounded-xl border border-navy-100 bg-cream p-5 lg:sticky lg:top-6" aria-label="Booking help">
            <p className="text-sm font-semibold text-navy-500">{activeCategory.name}</p>
            <h3 className="mt-3 font-heading text-xl font-bold text-navy">A clear next step</h3>
            <p className="mt-3 text-base leading-7 text-navy-600">{tier ? 'The team will discuss your needs, price and schedule with you before confirming.' : 'After payment, choose an available date and time on the confirmation page. If no suitable time is available, the team will help you schedule.'}</p>
            <a href={WHATSAPP_URL} className={`${control} mt-4 block border border-navy-200 bg-white text-center text-navy hover:bg-navy-50`}>Need help? WhatsApp us</a>
            <div className="mt-5 overflow-hidden rounded-lg">
              {activeCategory.imagePath ? <span className="relative block aspect-[16/9] w-full overflow-hidden bg-navy"><Image src={activeCategory.imagePath} alt="" fill unoptimized sizes="(min-width: 1024px) 300px, 100vw" className="object-cover object-[center_35%]" /></span> : <CategoryIconFallback slug={activeCategory.slug} />}
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}
