const { test, expect } = require('@playwright/test')

test('all session types are visible without horizontal scrolling', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/book-now')

  const choices = page.getByRole('tab')
  await expect(choices).toHaveCount(7)

  for (const choice of await choices.all()) {
    await choice.scrollIntoViewIfNeeded()
    await expect(choice).toBeVisible()
    const box = await choice.boundingBox()
    expect(box.width).toBeLessThanOrEqual(390)
    expect(box.height).toBeGreaterThanOrEqual(44)
  }

  const pageWidth = await page.evaluate(
    () => document.documentElement.scrollWidth
  )
  expect(pageWidth).toBeLessThanOrEqual(390)
})

test('booking choices use three plain steps and preserve the selected category in the URL', async ({
  page,
}) => {
  await page.goto('/book-now')

  await expect(
    page.getByText('Choose the kind of help you need', { exact: true })
  ).toBeVisible()
  await page.getByRole('tab', { name: /Couples Coaching/ }).click()
  await expect(page).toHaveURL(/category=couples/)
  await expect(page.getByText('Choose your session')).toBeVisible()

  await page
    .getByRole('button', {
      name: "Select Couples Coaching, At Salim's Location",
    })
    .click()
  await expect(page.getByText('Choose how to pay', { exact: true })).toBeVisible()
  await expect(page.getByTestId('coaching-checkout-form')).toHaveCount(1)
})

test('a shared category URL restores the correct session choices', async ({
  page,
}) => {
  await page.goto('/book-now?category=single-motherhood-alignment')

  await expect(
    page.getByRole('tab', { name: /Single Motherhood & Life Alignment/ })
  ).toHaveAttribute('aria-selected', 'true')
  await expect(
    page.getByRole('heading', {
      name: 'Single Motherhood & Life Alignment Session',
    })
  ).toBeVisible()
})
