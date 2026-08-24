const { test, expect } = require('@playwright/test')

test('Contact routes private enquiries without duplicating Ask Salim', async ({
  page,
}) => {
  await page.goto('/contact')

  await expect(
    page.getByRole('heading', { name: 'Start With the Right Conversation' })
  ).toBeVisible()
  await expect(
    page.getByTestId('contact-pathways').locator(':scope > li')
  ).toHaveCount(6)
  await expect(
    page.getByRole('link', { name: /Ask a public question/ })
  ).toHaveAttribute('href', '/ask-salim')
  await expect(
    page.getByText(
      'Ask Salim remains separate because it serves a different purpose.'
    )
  ).toBeVisible()
})

test('Contact provides specialist engagement routes', async ({ page }) => {
  await page.goto('/contact')

  const routes = [
    ['Explore coaching', '/work-with-salim/coaching'],
    ['Plan a speaking engagement', '/work-with-salim/speaking'],
    ['Discuss consulting', '/work-with-salim/consulting'],
    ['Enter Halisi Hub Connect', '/halisi-hub-connect'],
    ['Open the press kit', '/media/press-kit'],
  ]
  for (const [name, href] of routes) {
    await expect(
      page.getByRole('link', { name: new RegExp(name) })
    ).toHaveAttribute('href', href)
  }
})

test('Contact form uses honest action language and preserves its draft', async ({
  page,
}) => {
  await page.goto('/contact')
  const form = page.getByTestId('contact-form')

  await form.getByLabel('Name', { exact: true }).fill('Amina')
  await form.getByLabel('Email', { exact: true }).fill('amina@example.com')
  await form
    .getByLabel('Enquiry type')
    .selectOption('Partnership or collaboration')
  const message = form.getByLabel('Message', { exact: true })
  await message.fill(
    'I would like to discuss a community partnership for a leadership gathering in Nairobi.'
  )

  await page.evaluate(() => {
    window.addEventListener('beforeunload', (event) => event.preventDefault())
  })
  await form.getByRole('button', { name: 'Prepare Email' }).click()

  await expect(message).toHaveValue(
    'I would like to discuss a community partnership for a leadership gathering in Nairobi.'
  )
  await expect(form.getByLabel('Name', { exact: true })).toHaveValue('Amina')
  await expect(form.getByText(/Review the draft and press send/)).toBeVisible()
})

test('Contact content contains no em dash characters', async ({ page }) => {
  await page.goto('/contact')
  expect(await page.getByTestId('contact-content').innerText()).not.toContain(
    '—'
  )
})
