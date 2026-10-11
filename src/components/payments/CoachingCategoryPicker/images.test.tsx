import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { CoachingCategoryPicker } from './index'
import { coachingCategories, coachingOffers } from '@/lib/data/coaching-offers'

jest.mock('../CoachingCheckoutForm', () => ({ CoachingCheckoutForm: () => null }))
jest.mock('../../forms/CoachingQuoteRequestForm', () => ({ CoachingQuoteRequestForm: () => null }))
jest.mock('../../forms/CoachingTripDetailsForm', () => ({ CoachingTripDetailsForm: () => null }))

it('shows compact named session types before imagery or payment fields', () => {
  const html = renderToStaticMarkup(<CoachingCategoryPicker categories={coachingCategories.map((category) => ({ ...category, imagePath: '/images/coaching.jpg' }))} offers={coachingOffers} />)
  expect(html).toContain('What would you like help with?')
  expect(html).toContain('aria-current="step"')
  for (const category of coachingCategories) expect(html).toContain(`aria-label="Choose ${category.name.replace(/&/g, '&amp;')}"`)
  expect(html).not.toContain('<img')
  expect(html).not.toContain('<input')
  expect(html).toContain('From KES 3,500')
})
it('offers a contact route if no categories are available', () => {
  const html = renderToStaticMarkup(<CoachingCategoryPicker categories={[]} offers={[]} />)
  expect(html).toContain('href="/contact"')
})
