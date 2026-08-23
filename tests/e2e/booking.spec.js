const { test, expect } = require('@playwright/test')

test('booking flow enquiry form is reachable', async ({ page }) => {
  await page.goto('/work-with-salim/coaching')
  await expect(page.locator('h1')).toBeVisible()
})
