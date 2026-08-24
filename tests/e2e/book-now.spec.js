const { test, expect } = require('@playwright/test')

test('desktop header uses Book Now and opens the booking route', async ({
  page,
}) => {
  await page.goto('/')

  const action = page.getByRole('link', { name: 'Book Now', exact: true })
  await expect(action).toBeVisible()
  await expect(action).toHaveAttribute('href', '/book-now')
  await action.click()
  await expect(page).toHaveURL(/\/book-now$/)
})

test('Book Now presents four selectable coaching offers', async ({ page }) => {
  await page.goto('/book-now')

  await expect(
    page.getByRole('heading', {
      name: 'Choose the Depth Your Decision Requires',
    })
  ).toBeVisible()
  await expect(
    page.getByTestId('booking-offers').locator(':scope > article')
  ).toHaveCount(4)
  await expect(
    page.getByTestId('fit-guide').locator(':scope > li')
  ).toHaveCount(4)
  await expect(
    page.getByTestId('booking-process').locator(':scope > li')
  ).toHaveCount(4)
  await expect(page.getByRole('link', { name: 'Book 30 min' })).toHaveAttribute(
    'href',
    /paystack\.com/
  )
})

test('mobile navigation exposes Book Now', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/book-now')
  await page.getByRole('button', { name: 'Open menu' }).click()

  const action = page
    .getByRole('navigation', { name: 'Mobile' })
    .getByRole('link', { name: 'Book Now' })
  await expect(action).toBeVisible()
  await expect(action).toHaveAttribute('href', '/book-now')
})

test('Book Now content contains no em dash characters', async ({ page }) => {
  await page.goto('/book-now')
  expect(await page.getByTestId('book-now-content').innerText()).not.toContain(
    '—'
  )
})
