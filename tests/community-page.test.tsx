import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import CommunityPage from '../src/app/(site)/halisi-hub-connect/community/page'

jest.mock('@/components/layout/PageHero', () => ({
  PageHero: ({
    title,
    description,
    actions,
  }: {
    title: React.ReactNode
    description: React.ReactNode
    actions: React.ReactNode
  }) => (
    <header>
      <h1>{title}</h1>
      <p>{description}</p>
      {actions}
    </header>
  ),
}))

it('explains the community and preserves all membership prices and enquiry routes', () => {
  const html = renderToStaticMarkup(<CommunityPage />)
  expect(html.match(/<h1>/g)).toHaveLength(1)
  expect(html).toContain('id="membership"')
  expect(html).toContain('href="#membership"')
  for (const name of ['Basic', 'Inner Circle', 'Elite'])
    expect(html).toContain(`Enquire About ${name}`)
  for (const amount of ['500', '1,500', '5,000']) expect(html).toContain(amount)
  expect(html).toContain('Weekly live mentorship')
  expect(html).toContain('Monthly deep-dive session')
  expect(html).toContain(
    'This page does not collect payment or activate a membership.'
  )
  expect(html.match(/href="\/contact"/g)).toHaveLength(4)
})
