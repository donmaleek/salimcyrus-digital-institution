const { test, expect } = require('@playwright/test')

test("about page presents Salim's story without a story image", async ({
  page,
}) => {
  await page.goto('/about')

  const story = page.getByTestId('about-story')
  await expect(
    story.getByRole('heading', { name: 'Truth should change how you live.' })
  ).toBeVisible()
  await expect(story.locator('img')).toHaveCount(0)
  await expect(story.getByText('Relationships and marriage')).toBeVisible()
})

test('about page presents credentials and published works', async ({
  page,
}) => {
  await page.goto('/about')

  const credentials = page.getByTestId('about-credentials')
  for (const title of [
    'Strategic Accountability Coach',
    'Certified Life Coach',
    'Advanced Emotional Intelligence',
    'Human Potential Practitioner',
    'Decision Architecture Specialist',
  ]) {
    await expect(credentials.getByText(title)).toBeVisible()
  }
  await expect(credentials.getByText('Concealed Redemption')).toBeVisible()
  await expect(credentials.getByText('The Great Deception')).toBeVisible()
})

test('about page contains no em dash characters', async ({ page }) => {
  await page.goto('/about')
  expect(await page.locator('main').innerText()).not.toContain('—')
})
