const { test, expect } = require('@playwright/test')

test('Resources guide cards are real links, not fake download labels', async ({
  page,
}) => {
  await page.goto('/resources')

  const cards = page.getByTestId('resource-guide-card')
  const count = await cards.count()
  expect(count).toBeGreaterThan(0)

  for (let i = 0; i < count; i++) {
    await expect(cards.nth(i)).toHaveAttribute('href', '/resources/free-guides')
  }
  await expect(page.getByText('Get this guide').first()).toBeVisible()
})

test('Resources index and Free Guides list the same guides', async ({ page }) => {
  await page.goto('/resources')
  const indexTitle = await page
    .getByTestId('resource-guide-card')
    .first()
    .locator('p')
    .first()
    .innerText()

  await page.goto('/resources/free-guides')
  await expect(page.getByText(indexTitle, { exact: true })).toBeVisible()
})
