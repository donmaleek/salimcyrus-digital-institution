const { test, expect } = require('@playwright/test')

for (const width of [390, 768, 1440]) {
  test(`guided booking is usable at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 })
    await page.goto('/book-now')
    const choice = page.getByRole('button', { name: 'Choose Standard Sessions', exact: true })
    const box = await choice.boundingBox()
    expect(box.y).toBeLessThan(700)
    expect(box.height).toBeGreaterThanOrEqual(48)
    await expect(page.getByTestId('booking-categories').getByRole('button')).toHaveCount(8)
    await choice.click()
    await expect(page.getByTestId('booking-step-heading')).toBeFocused()
    expect((await page.getByTestId('booking-step-heading').boundingBox()).y).toBeLessThan(200)
    expect((await page.getByRole('button', { name: 'Change session type' }).boundingBox()).y).toBeGreaterThanOrEqual(0)
    await page.getByRole('button', { name: 'Book Starter Session', exact: true }).click()
    await expect(page.getByTestId('booking-selection-summary')).toBeVisible()
    await expect(page.getByTestId('booking-step-heading')).toBeFocused()
    const headingBox = await page.getByTestId('booking-step-heading').boundingBox()
    expect(headingBox.y).toBeLessThan(200)
    expect((await page.getByRole('button', { name: 'Back to sessions' }).boundingBox()).y).toBeGreaterThanOrEqual(0)
    for (const target of await page.getByTestId('coaching-checkout-form').getByRole('button').all()) {
      expect((await target.boundingBox()).height).toBeGreaterThanOrEqual(48)
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
    await page.getByRole('button', { name: 'Back to sessions' }).click()
    await page.getByRole('button', { name: 'Change session type' }).click()
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width)
  })
}

test('a keyboard user can choose a session and reach the payment form', async ({ page }) => {
  await page.goto('/book-now')
  await page.getByRole('button', { name: 'Choose Standard Sessions', exact: true }).focus()
  await page.keyboard.press('Enter')
  await expect(page.getByTestId('booking-step-heading')).toBeFocused()
  await page.getByRole('button', { name: 'Book Starter Session', exact: true }).focus()
  await page.keyboard.press('Enter')
  await expect(page.getByTestId('booking-step-heading')).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(page.getByLabel('Email for Paystack receipt')).toBeFocused()
})

test('an existing paid client sees scheduling without a tall hero', async ({ page }) => {
  await page.route('**/api/booking/available-slots', route => route.fulfill({ json: { slots: [] } }))
  await page.goto('/book-now/confirm')
  await expect(page.getByRole('heading', { name: 'Choose your session time', exact: true })).toBeVisible()
  await expect(page.getByTestId('page-hero')).toHaveCount(0)
  expect((await page.getByTestId('booking-intro').boundingBox()).height).toBeLessThan(400)
})
