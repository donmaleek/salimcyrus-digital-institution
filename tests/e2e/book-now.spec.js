const { test, expect } = require('@playwright/test')

const chooseStandard = async page => {
  await page.goto('/book-now')
  await page.getByRole('button', { name: 'Choose Standard Sessions', exact: true }).click()
}
const bookStarter = async page => {
  await chooseStandard(page)
  await page.getByRole('button', { name: 'Book Starter Session', exact: true }).click()
}

test('desktop header opens the booking route', async ({ page }) => {
  await page.goto('/about')
  await page.getByRole('link', { name: 'Book Session Now', exact: true }).click()
  await expect(page).toHaveURL(/\/book-now$/)
  await expect(page.getByRole('heading', { name: 'Book your session', exact: true })).toBeVisible()
})

test('booking shows one decision at a time and moves focus to the next step', async ({ page }) => {
  await page.goto('/book-now')
  await expect(page.getByTestId('booking-categories').getByRole('button')).toHaveCount(8)
  await expect(page.getByTestId('booking-offers')).toHaveCount(0)
  await expect(page.getByTestId('coaching-checkout-form')).toHaveCount(0)
  await page.getByRole('button', { name: 'Choose Standard Sessions', exact: true }).click()
  await expect(page.getByTestId('booking-step-heading')).toBeFocused()
  await expect(page.getByTestId('booking-offers').locator(':scope > article')).toHaveCount(3)
  await expect(page.getByTestId('booking-categories')).toHaveCount(0)
  await page.getByRole('button', { name: 'Book Starter Session', exact: true }).click()
  await expect(page.getByTestId('booking-step-heading')).toBeFocused()
  await expect(page.getByTestId('coaching-checkout-form')).toHaveCount(1)
  await expect(page.getByTestId('booking-offers')).toHaveCount(0)
  await expect(page.getByTestId('booking-selection-summary')).toContainText('Starter Session')
})

test('back, change type and browser back restore the right choice', async ({ page }) => {
  await bookStarter(page)
  await page.getByRole('button', { name: 'Back to sessions' }).click()
  await expect(page.getByTestId('booking-offers')).toBeVisible()
  await expect(page.getByTestId('coaching-checkout-form')).toHaveCount(0)
  await page.getByRole('button', { name: 'Change session type' }).click()
  await page.getByRole('button', { name: 'Choose Couples Coaching', exact: true }).click()
  await expect(page.getByTestId('booking-offers').locator(':scope > article')).toHaveCount(4)
  await expect(page).toHaveURL(/category=couples/)
  await page.goBack()
  await expect(page.getByTestId('booking-categories')).toBeVisible()
  await page.goForward()
  await expect(page.getByTestId('booking-offers')).toBeVisible()
  await page.reload()
  await expect(page.getByTestId('booking-offers')).toContainText('Couples Coaching')
})

for (const [name, category] of [
  ['Identity & Life Alignment Session', 'identity-alignment'],
  ['Single Motherhood & Life Alignment Session', 'single-motherhood-alignment'],
]) {
  test(`${name} deep link opens its live checkout directly`, async ({ page }) => {
    await page.goto(`/book-now?category=standard&offer=${encodeURIComponent(name)}#choose-session`)
    await expect(page.getByTestId('booking-selection-summary')).toContainText(name)
    await expect(page.getByTestId('coaching-checkout-form')).toBeVisible()
    await expect(page.getByTestId('booking-step-heading')).toBeFocused()
    await page.getByRole('button', { name: 'Back to sessions' }).click()
    await expect(page).toHaveURL(new RegExp(`category=${category}`))
    const card = page.getByTestId('booking-offers').locator('article').filter({ has: page.getByRole('heading', { name, exact: true }) })
    const price = await card.locator('dd').nth(1).innerText()
    await card.getByRole('button').click()
    await expect(page.getByTestId('booking-selection-summary')).toContainText(price.split(' / ')[0])
  })
}

test('invalid deep links fall back to visible type choices', async ({ page }) => {
  await page.goto('/book-now?category=unknown&offer=unknown')
  await expect(page.getByTestId('booking-categories')).toBeVisible()
  await expect(page.getByTestId('coaching-checkout-form')).toHaveCount(0)
})

test('a quote-only session opens the actual form in one selection and can recover from failure', async ({ page }) => {
  let requests = 0
  await page.route('**/api/coaching/request-quote', async route => {
    requests++
    await route.fulfill({ status: requests === 1 ? 500 : 200, json: { success: requests > 1 } })
  })
  await page.goto('/book-now?category=vip-summit')
  await page.getByRole('button', { name: 'Request Speaking Engagement' }).click()
  await expect(page.getByLabel('Name', { exact: true })).toBeVisible()
  await expect(page.getByTestId('coaching-checkout-form')).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Request a Quote', exact: true })).toHaveCount(0)
  await page.getByLabel('Name', { exact: true }).fill('Test Client')
  await page.getByLabel('Email', { exact: true }).fill('client@example.com')
  await page.getByLabel('Details', { exact: true }).fill('Test conference booking request for next year.')
  await page.getByRole('button', { name: 'Send Request', exact: true }).click()
  await expect(page.getByRole('alert').filter({ hasText: 'Could not send your request' })).toBeVisible()
  await page.getByRole('button', { name: 'Send Request', exact: true }).click()
  await expect(page.getByTestId('quote-request-sent')).toBeVisible()
  expect(requests).toBe(2)
})

test('travel details block payment until successfully submitted', async ({ page }) => {
  let requestBody
  let requests = 0
  await page.route('**/api/coaching/trip-details', async route => {
    requests++
    requestBody = route.request().postDataJSON()
    await route.fulfill({ status: requests === 1 ? 500 : 200, json: requests === 1 ? { error: 'Please try again.' } : { success: true } })
  })
  const name = 'Couples Coaching, Your Location (Kenya, Outside Mombasa)'
  await page.goto(`/book-now?offer=${encodeURIComponent(name)}`)
  await expect(page.getByTestId('coaching-trip-details-form')).toBeVisible()
  await expect(page.getByTestId('coaching-checkout-form')).toHaveCount(0)
  await page.getByLabel('Names of participants').fill('Client One and Client Two')
  await page.getByLabel('Phone number').fill('+254700000000')
  await page.getByLabel('Email', { exact: true }).fill('client@example.com')
  await page.getByLabel('County / town / location').fill('Nairobi')
  await page.getByLabel('Preferred date').fill('2027-02-12')
  await page.getByLabel('Preferred time').fill('10:00')
  await page.getByLabel('Number of participants').fill('2')
  await page.getByRole('button', { name: 'Continue to Payment' }).click()
  await expect(page.getByTestId('coaching-checkout-form')).toHaveCount(0)
  await expect(page.getByTestId('coaching-trip-details-form').getByRole('alert')).toContainText('Please try again.')
  await page.getByRole('button', { name: 'Continue to Payment' }).click()
  await expect(page.getByTestId('coaching-checkout-form')).toBeVisible()
  expect(requestBody.offerName).toBe(name)
  expect(requestBody.participants).toBe('2')
})

test('Paystack validates email, preserves the API payload, and recovers from malformed responses', async ({ page }) => {
  let requests = 0
  let requestBody
  await page.route('**/api/coaching/checkout', async route => {
    requests++
    requestBody = route.request().postDataJSON()
    await route.fulfill({ status: 502, contentType: 'text/html', body: '<html>Unavailable</html>' })
  })
  await bookStarter(page)
  const pay = page.getByRole('button', { name: /^Pay with Paystack/ })
  await pay.click()
  expect(requests).toBe(0)
  await page.getByLabel('Email for Paystack receipt').fill('invalid')
  await pay.click()
  expect(requests).toBe(0)
  await page.getByLabel('Email for Paystack receipt').fill('client@example.com')
  await pay.click()
  await expect(page.getByTestId('coaching-checkout-form').getByRole('alert')).toContainText('checkout could not be started')
  await expect(pay).toBeEnabled()
  expect(requestBody).toEqual({ email: 'client@example.com', offerName: 'Starter Session' })
  await pay.click()
  await expect(pay).toBeEnabled()
  expect(requests).toBe(2)
})

test('PayPal works without entering a Paystack email and shows recoverable network errors', async ({ page }) => {
  let requestBody
  await page.route('**/api/coaching/checkout-paypal', async route => {
    requestBody = route.request().postDataJSON()
    await route.abort('failed')
  })
  await bookStarter(page)
  const pay = page.getByRole('button', { name: /^Pay with PayPal/ })
  await pay.click()
  await expect(page.getByTestId('coaching-checkout-form').getByRole('alert')).toContainText('Could not connect to PayPal')
  await expect(pay).toBeEnabled()
  expect(requestBody).toEqual({ offerName: 'Starter Session' })
})

test('mobile navigation exposes Book Now', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/book-now')
  await page.getByRole('button', { name: 'Open menu' }).click()
  await expect(page.getByRole('navigation', { name: 'Mobile' }).getByRole('link', { name: 'Book Session Now' })).toBeVisible()
})

for (const provider of ['paystack', 'paypal']) {
  test(`${provider} successful checkout redirects to the provider`, async ({ page }) => {
    const destination = `https://checkout.example.test/${provider}`
    await page.route('https://checkout.example.test/**', route => route.fulfill({ body: 'Mock secure checkout', contentType: 'text/html' }))
    await page.route(provider === 'paystack' ? '**/api/coaching/checkout' : '**/api/coaching/checkout-paypal', route => route.fulfill({ json: provider === 'paystack' ? { authorizationUrl: destination } : { approvalUrl: destination } }))
    await bookStarter(page)
    if (provider === 'paystack') await page.getByLabel('Email for Paystack receipt').fill('client@example.com')
    await page.getByRole('button', { name: provider === 'paystack' ? /^Pay with Paystack/ : /^Pay with PayPal/ }).click()
    await expect(page).toHaveURL(destination)
  })
}

test('changing session while checkout is pending does not redirect to an old offer', async ({ page }) => {
  let release
  let started
  const pending = new Promise(resolve => { release = resolve })
  const requestStarted = new Promise(resolve => { started = resolve })
  await page.route('**/api/coaching/checkout-paypal', async route => {
    started()
    await pending
    await route.fulfill({ json: { approvalUrl: 'https://checkout.example.test/old-offer' } })
  })
  await bookStarter(page)
  await page.getByRole('button', { name: /^Pay with PayPal/ }).click()
  await requestStarted
  await page.getByRole('button', { name: 'Back to sessions' }).click()
  release()
  await expect(page.getByTestId('booking-offers')).toBeVisible()
  await expect(page).toHaveURL(/category=standard#choose-session$/)
})

test('progress current-step clicks do not add duplicate history entries', async ({ page }) => {
  await chooseStandard(page)
  const historyLength = await page.evaluate(() => history.length)
  await page.getByRole('button', { name: 'Choose session', exact: true }).click()
  expect(await page.evaluate(() => history.length)).toBe(historyLength)
})

test('session location details remain visible before and after selection', async ({ page }) => {
  await page.goto('/book-now?category=individual')
  const card = page.getByTestId('booking-offers').locator('article').first()
  await expect(card.getByText('Location:', { exact: false })).toBeVisible()
  const location = await card.getByText('Location:', { exact: false }).innerText()
  await card.getByRole('button').click()
  await expect(page.getByTestId('booking-selection-summary')).toContainText(location)
})
