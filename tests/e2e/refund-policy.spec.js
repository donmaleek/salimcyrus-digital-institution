const { test, expect } = require('@playwright/test')

test('FAQ links to a real Refund and Cancellation Policy page', async ({ page }) => {
  await page.goto('/faq')

  const cancelQuestion = page.getByRole('button', { name: 'Can I cancel?' })
  await cancelQuestion.click()

  const link = page
    .locator('#main-content')
    .getByRole('link', { name: 'Refund & Cancellation Policy' })
  await expect(link).toBeVisible()
  await expect(link).toHaveAttribute('href', '/refund-policy')

  // Next prefetches linked pages, so the click may need no network response at
  // all; assert on the navigation itself instead of a response that may not fire.
  await Promise.all([page.waitForURL('**/refund-policy'), link.click()])
  await expect(
    page.getByRole('heading', { name: 'Refund & Cancellation Policy' })
  ).toBeVisible()
})

test('Refund policy covers sessions, packages, programs, and digital products', async ({
  page,
}) => {
  await page.goto('/refund-policy')

  await expect(page.getByRole('heading', { name: 'Coaching Sessions' })).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Multi-Session Coaching Packages' })
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Programs, Masterclasses & Memberships' })
  ).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'Books & Digital Downloads' })
  ).toBeVisible()
})
