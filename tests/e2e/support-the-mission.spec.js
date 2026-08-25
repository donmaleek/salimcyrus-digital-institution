const { test, expect } = require('@playwright/test')

test('support page presents three clear payment routes and independent proof', async ({
  page,
}) => {
  await page.goto('/support-the-mission')

  const options = page.getByTestId('payment-options')
  await expect(options.getByRole('heading', { name: 'Paystack' })).toBeVisible()
  await expect(
    options.getByRole('heading', { name: 'M-Pesa Paybill' })
  ).toBeVisible()
  await expect(options.getByRole('heading', { name: 'PayPal' })).toBeVisible()
  await expect(options.getByText('303030')).toBeVisible()
  await expect(options.getByText('S6UB#')).toBeVisible()
  await expect(options.getByText('salimcyrus@gmail.com')).toBeVisible()
  await expect(
    options.getByRole('button', { name: 'Continue to Paystack' })
  ).toBeVisible()

  await expect(
    page.getByRole('link', { name: 'Read the Tuko Feature' })
  ).toHaveAttribute('href', /tuko\.co\.ke\/people\/family\/445138/)
})

test('Paystack form validates required donation fields in the browser', async ({
  page,
}) => {
  await page.goto('/support-the-mission')
  await page.getByRole('button', { name: 'Continue to Paystack' }).click()

  await expect(page.locator('#support-email')).toHaveJSProperty(
    'validity.valueMissing',
    true
  )
  await expect(page.locator('#support-amount')).toHaveJSProperty(
    'validity.valueMissing',
    true
  )
})
