const { test, expect } = require('@playwright/test')

test('Knowledge Centre presents seven distinct fields without repeated topics', async ({
  page,
}) => {
  await page.goto('/knowledge-centre')

  const categories = page.getByTestId('knowledge-category-list')
  await expect(categories.locator(':scope > li')).toHaveCount(7)
  const topicLists = page.getByTestId('category-topics')
  await expect(topicLists).toHaveCount(7)

  const topics = await topicLists.locator('li').allTextContents()
  expect(topics).toHaveLength(47)
  const normalized = topics.map((topic) => topic.trim().toLowerCase())
  expect(new Set(normalized).size).toBe(normalized.length)
})

test('Knowledge Centre makes each category question and route clear', async ({
  page,
}) => {
  await page.goto('/knowledge-centre')

  for (const name of [
    'Relationships',
    'Manhood',
    'Purpose',
    'Kingdom',
    'Leadership',
    'Business',
    'Society',
  ]) {
    await expect(page.getByRole('heading', { name, exact: true })).toBeVisible()
  }
  await expect(page.getByText('47')).toBeVisible()
  await expect(page.getByText('Non-repeated subjects')).toBeVisible()
})

test('Knowledge category page uses its distinct editorial definition', async ({
  page,
}) => {
  await page.goto('/knowledge-centre/category/relationships')

  await expect(
    page.getByRole('heading', {
      name: 'How do we love with both wisdom and maturity?',
    })
  ).toBeVisible()
  await expect(page.getByText('Dating discernment')).toBeVisible()
  await expect(page.getByText('Marriage preparation')).toBeVisible()
  await expect(
    page.getByText('Articles for this field are in editorial development.')
  ).toBeVisible()
})

test('Knowledge Centre contains no em dash characters', async ({ page }) => {
  await page.goto('/knowledge-centre')
  expect(
    await page.getByTestId('knowledge-centre-content').innerText()
  ).not.toContain('—')
})
