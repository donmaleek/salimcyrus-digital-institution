const { test, expect } = require('@playwright/test')

test('Halisi Hub Connect presents a complete institutional overview', async ({
  page,
}) => {
  await page.goto('/halisi-hub-connect')

  await expect(
    page.getByRole('heading', {
      name: 'Wisdom That Forms People. People Who Strengthen Communities.',
    })
  ).toBeVisible()
  await expect(
    page.getByTestId('halisi-pillars').locator(':scope > li')
  ).toHaveCount(4)
  await expect(
    page.getByTestId('operating-model').locator(':scope > li')
  ).toHaveCount(4)
  await expect(
    page.getByTestId('measurement-framework').locator(':scope > div')
  ).toHaveCount(4)
})

test('Halisi Hub Connect exposes clear participation routes', async ({
  page,
}) => {
  await page.goto('/halisi-hub-connect')

  await expect(
    page.getByRole('link', { name: /Explore the mission/ })
  ).toHaveAttribute('href', '/halisi-hub-connect/mission')
  await expect(
    page.getByRole('link', { name: /Enter the community/ })
  ).toHaveAttribute('href', '/halisi-hub-connect/community')
  await expect(
    page.getByRole('link', { name: /View the impact framework/ })
  ).toHaveAttribute('href', '/halisi-hub-connect/impact')
  await expect(
    page
      .getByTestId('halisi-hub-content')
      .getByRole('link', { name: 'Support the Mission' })
  ).toHaveAttribute('href', '/support-the-mission')
})

test('Halisi impact page uses evidence categories instead of placeholder figures', async ({
  page,
}) => {
  await page.goto('/halisi-hub-connect/impact')

  await expect(
    page.getByRole('heading', {
      name: 'Measure the Work. Learn from It. Report It Honestly.',
    })
  ).toBeVisible()
  await expect(
    page.getByTestId('impact-outcomes').locator(':scope > div')
  ).toHaveCount(6)
  await expect(page.getByText('Evidence before promotion')).toBeVisible()
})

test('Halisi Hub route family contains no em dash characters', async ({
  page,
}) => {
  for (const route of [
    '/halisi-hub-connect',
    '/halisi-hub-connect/mission',
    '/halisi-hub-connect/community',
    '/halisi-hub-connect/impact',
  ]) {
    await page.goto(route)
    expect(await page.locator('body').innerText()).not.toContain('—')
  }
})
