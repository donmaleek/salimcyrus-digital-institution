const { test, expect } = require('@playwright/test')

const slug = 'people-vent-on-social-media-because-they-arent-heard-in-person'

test('legacy published essay URL permanently redirects to the journal entry', async ({ page }) => {
  const response = await page.goto(`/${slug}/`)

  expect(response.status()).toBe(200)
  await expect(page).toHaveURL(new RegExp(`/journal/${slug}$`))
  await expect(
    page.getByRole('heading', {
      name: "People Vent on Social Media Because They Aren't Heard in Person",
    })
  ).toBeVisible()
})
