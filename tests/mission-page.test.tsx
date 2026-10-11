import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import MissionPage from '../src/app/(site)/halisi-hub-connect/mission/page'

jest.mock('@/components/layout/PageHero', () => ({
  PageHero: ({ title, description, actions }: { title: React.ReactNode; description: React.ReactNode; actions: React.ReactNode }) => <header><h1>{title}</h1><p>{description}</p>{actions}</header>,
}))

it('preserves mission commitments and provides valid participation routes', () => {
  const html = renderToStaticMarkup(<MissionPage />)
  expect(html.match(/<h1>/g)).toHaveLength(1)
  expect(html.match(/<li /g)).toHaveLength(4)
  for (const title of ['Mentorship', 'Community', 'Masterclasses &amp; Programs', 'Community Initiatives']) {
    expect(html).toContain(title)
  }
  for (const route of ['#our-purpose', '/halisi-hub-connect/community', '/halisi-hub-connect/impact', '/contact']) {
    expect(html).toContain(`href="${route}"`)
  }
  expect(html).toContain('id="our-purpose"')
  for (const id of ['purpose-heading', 'pillars-heading', 'participate-heading']) {
    expect(html).toContain(`aria-labelledby="${id}"`)
    expect(html).toContain(`id="${id}"`)
  }
})
