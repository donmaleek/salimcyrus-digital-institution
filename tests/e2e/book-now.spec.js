const { test, expect } = require('@playwright/test')

test('desktop header opens the booking route', async ({ page }) => {
  await page.goto('/')

  const action = page.getByRole('link', {
    name: 'Book Session Now',
    exact: true,
  })
  await expect(action).toBeVisible()
  await expect(action).toHaveAttribute('href', '/book-now')
  await action.click()
  await expect(page).toHaveURL(/\/book-now$/)
})

test('Book Now presents an organised, progressive coaching selection flow', async ({
  page,
}) => {
  await page.goto('/book-now')

  await expect(
    page.getByRole('heading', {
      name: 'Choose the Depth Your Decision Requires',
    })
  ).toBeVisible()
  await expect(
    page.getByRole('tab', { name: 'Standard Sessions' })
  ).toHaveAttribute('aria-selected', 'true')
  await expect(
    page.getByTestId('booking-offers').locator(':scope > article')
  ).toHaveCount(3)
  await expect(
    page.getByTestId('booking-process').locator(':scope > li')
  ).toHaveCount(4)
  await expect(page.getByTestId('coaching-checkout-form')).toHaveCount(0)

  const starter = page.getByRole('button', { name: 'Select Starter Session' })
  await starter.click()
  await expect(
    page.getByRole('button', { name: 'Close payment options' })
  ).toHaveAttribute('aria-expanded', 'true')
  await expect(page.getByTestId('coaching-checkout-form')).toHaveCount(1)

  await page.getByRole('tab', { name: 'Individual Coaching' }).click()
  await expect(
    page.getByRole('tab', { name: 'Individual Coaching' })
  ).toHaveAttribute('aria-selected', 'true')
  await expect(page.getByTestId('coaching-checkout-form')).toHaveCount(0)
  await expect(
    page.getByTestId('booking-offers').locator(':scope > article')
  ).toHaveCount(4)
})

test('mobile navigation exposes Book Now', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/book-now')
  await page.getByRole('button', { name: 'Open menu' }).click()

  const action = page
    .getByRole('navigation', { name: 'Mobile' })
    .getByRole('link', { name: 'Book Session Now' })
  await expect(action).toBeVisible()
  await expect(action).toHaveAttribute('href', '/book-now')
})

test('Book Now content contains no em dash characters', async ({ page }) => {
  await page.goto('/book-now')
  expect(await page.getByTestId('book-now-content').innerText()).not.toContain(
    '—'
  )
})
