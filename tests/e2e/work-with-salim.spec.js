const { test, expect } = require('@playwright/test')

test('work with Salim page provides three clear engagement paths', async ({
  page,
}) => {
  await page.goto('/work-with-salim')

  const content = page.getByTestId('work-with-salim-content')
  await expect(
    content.getByRole('heading', { name: 'Private Coaching', exact: true })
  ).toBeVisible()
  await expect(
    content.getByRole('heading', { name: 'Speaking', exact: true })
  ).toBeVisible()
  await expect(
    content.getByRole('heading', { name: 'Consulting', exact: true })
  ).toBeVisible()
  await expect(
    content.getByRole('link', { name: 'Explore Coaching' })
  ).toHaveAttribute('href', '/work-with-salim/coaching')
})

test('work with Salim page compares all coaching formats and programs', async ({
  page,
}) => {
  await page.goto('/work-with-salim')

  for (const format of [
    'Starter Session',
    'Clarity Session',
    'Deep Reset Session',
    'Private Coaching',
  ]) {
    await expect(page.getByRole('rowheader', { name: format })).toBeVisible()
  }

  const programList = page.getByTestId('program-list')
  await expect(programList.getByRole('article')).toHaveCount(7)
  await expect(programList.getByText(/KES\s*25,000/).first()).toBeVisible()
  await expect(programList.getByText(/USD\s*193/).first()).toBeVisible()
})

test('work with Salim page has no em dash characters', async ({ page }) => {
  await page.goto('/work-with-salim')
  expect(
    await page.getByTestId('work-with-salim-content').innerText()
  ).not.toContain('—')
})
