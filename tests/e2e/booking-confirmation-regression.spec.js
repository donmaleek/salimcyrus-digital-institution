const { test, expect } = require('@playwright/test')

test.beforeEach(async ({ page }) => {
  await page.route('**/api/booking/available-slots', (route) =>
    route.fulfill({ status: 200, json: { slots: [] } })
  )
})

test('confirmation requires a Paystack reference and gives truthful guest next steps', async ({
  page,
}) => {
  await page.route('**/api/booking/confirm', (route) =>
    route.fulfill({
      status: 201,
      json: {
        booking: {
          id: 'booking-guest-1',
          status: 'confirmed',
          slotId: null,
          accountLinked: false,
        },
      },
    })
  )
  await page.goto('/book-now/confirm')

  const paymentReference = page.getByLabel('Paystack payment reference')
  await expect(paymentReference).toHaveAttribute('required', '')
  await page.getByLabel('Name').fill('Guest Client')
  await page.locator('#booking-email').fill('guest@example.com')
  await paymentReference.fill('PS_GUEST_1')
  await page.getByRole('button', { name: 'Confirm My Booking' }).click()

  await expect(page.getByTestId('booking-confirmed')).toContainText(
    'Payment verified. Booking confirmed.'
  )
  await expect(page.getByTestId('booking-confirmed')).toContainText(
    'We will send updates to guest@example.com'
  )
  await expect(
    page.getByRole('link', { name: 'View My Booking' })
  ).toHaveCount(0)
})

test('linked customer receives a direct dashboard booking link', async ({ page }) => {
  await page.route('**/api/booking/confirm', (route) =>
    route.fulfill({
      status: 201,
      json: {
        booking: {
          id: 'booking-member-1',
          status: 'confirmed',
          slotId: null,
          accountLinked: true,
        },
      },
    })
  )
  await page.goto('/book-now/confirm')
  await page.getByLabel('Name').fill('Member Client')
  await page.locator('#booking-email').fill('member@example.com')
  await page.getByLabel('Paystack payment reference').fill('PS_MEMBER_1')
  await page.getByRole('button', { name: 'Confirm My Booking' }).click()

  await expect(page.getByRole('link', { name: 'View My Booking' })).toHaveAttribute(
    'href',
    '/dashboard/my-bookings/booking-member-1'
  )
})

test('availability failure is distinguished from a genuine empty calendar', async ({ page }) => {
  await page.unroute('**/api/booking/available-slots')
  await page.route('**/api/booking/available-slots', (route) =>
    route.fulfill({ status: 503, json: { error: 'Unavailable' } })
  )
  await page.goto('/book-now/confirm')

  await expect(
    page.getByText('Available times could not be loaded', { exact: false })
  ).toBeVisible()
})
