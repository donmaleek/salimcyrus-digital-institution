const { test, expect } = require('@playwright/test')

test('Ask Salim explains the process and selection standard', async ({
  page,
}) => {
  await page.goto('/ask-salim')

  await expect(
    page.getByRole('heading', {
      name: 'Bring One Honest Question Into Clearer Focus',
    })
  ).toBeVisible()
  await expect(
    page.getByTestId('answer-process').locator(':scope > li')
  ).toHaveCount(4)
  await expect(
    page.getByTestId('question-prompts').locator(':scope > li')
  ).toHaveCount(6)
  await expect(
    page.getByText('Submission does not guarantee a response.')
  ).toBeVisible()
})

test('Ask Salim form provides guidance, privacy choice, and honest action language', async ({
  page,
}) => {
  await page.goto('/ask-salim')
  const form = page.getByTestId('ask-salim-form')

  await expect(form.getByLabel('What is your question about?')).toBeVisible()
  await expect(
    form.getByLabel('Your question', { exact: true })
  ).toHaveAttribute('maxlength', '1000')
  await expect(form.getByLabel(/Helpful context/)).toHaveAttribute(
    'maxlength',
    '600'
  )
  await expect(form.getByLabel('Publication preference')).toHaveValue(
    'anonymous'
  )
  await expect(
    form.getByRole('button', { name: 'Submit Your Question' })
  ).toBeVisible()
  await expect(
    form.getByText(/Only used if a private follow-up is needed/)
  ).toBeVisible()
})

test('Ask Salim question is actually submitted and confirmed, not just drafted', async ({
  page,
}) => {
  await page.goto('/ask-salim')
  const question = page.getByLabel('Your question', { exact: true })
  const context = page.getByLabel(/Helpful context/)

  await question.fill(
    'How do I make a responsible choice when two meaningful paths compete?'
  )
  await context.fill(
    'Both choices fit my values, but they require different commitments.'
  )

  const [response] = await Promise.all([
    page.waitForResponse(
      (res) => res.url().includes('/api/ask-salim') && res.request().method() === 'POST'
    ),
    page.getByRole('button', { name: 'Submit Your Question' }).click(),
  ])

  expect(response.status()).toBe(201)
  await expect(page.getByTestId('ask-salim-submitted')).toBeVisible()
  await expect(page.getByText('Question received.')).toBeVisible()
})

test('Ask Salim content contains no em dash characters', async ({ page }) => {
  await page.goto('/ask-salim')
  expect(await page.getByTestId('ask-salim-content').innerText()).not.toContain(
    '—'
  )
})
