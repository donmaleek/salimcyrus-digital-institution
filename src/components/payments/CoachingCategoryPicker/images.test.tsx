import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { CoachingCategoryPicker } from './index'
import { coachingCategories, coachingOffers } from '@/lib/data/coaching-offers'

jest.mock('../CoachingCheckoutForm', () => ({ CoachingCheckoutForm: () => null }))
jest.mock('../../forms/CoachingQuoteRequestForm', () => ({ CoachingQuoteRequestForm: () => null }))
jest.mock('../../forms/CoachingTripDetailsForm', () => ({ CoachingTripDetailsForm: () => null }))

function render(imagePath: string | null) {
  return renderToStaticMarkup(
    <CoachingCategoryPicker
      categories={coachingCategories.map((category) => ({ ...category, imagePath }))}
      offers={coachingOffers}
    />
  )
}

it('renders uploaded photos in full-width rectangular frames above the card text', () => {
  const html = render('/images/coaching.jpg')
  expect(html).toContain('relative block aspect-[16/10] w-full overflow-hidden bg-cream')
  expect(html).toContain('class="object-cover"')
  expect(html).toContain('data-nimg="fill"')
  expect(html).not.toContain('h-12 w-12')
  expect(html.indexOf('/images/coaching.jpg')).toBeLessThan(html.indexOf(coachingCategories[0].name))
  expect(html).toContain('aria-selected="true"')
})

it('reserves the same rectangular space when a category has no uploaded photo', () => {
  const html = render(null)
  expect(html).toContain('flex aspect-[16/10] w-full items-center justify-center')
  expect(html).not.toContain('<img')
  expect(html).not.toContain('h-12 w-12')
  for (const category of coachingCategories) expect(html).toContain(category.name.replace(/&/g, '&amp;'))
})
