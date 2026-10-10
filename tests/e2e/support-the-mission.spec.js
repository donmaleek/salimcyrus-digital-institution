const { test, expect } = require('@playwright/test')

test('support page presents two clear payment routes and independent proof', async ({
  page,
}) => {
  await page.goto('/support-the-mission')

  const options = page.getByTestId('payment-options')
  await expect(options.getByRole('heading', { name: 'Paystack' })).toBeVisible()
  await expect(options.getByRole('heading', { name: 'PayPal' })).toBeVisible()
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
