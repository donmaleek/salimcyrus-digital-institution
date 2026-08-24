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
    'Publish anonymously if selected'
  )
  await expect(
    form.getByRole('button', { name: 'Prepare Email' })
  ).toBeVisible()
  await expect(form.getByText(/Review the draft and press send/)).toBeVisible()
})

test('Ask Salim keeps the draft when preparing the email', async ({ page }) => {
  await page.goto('/ask-salim')
  const question = page.getByLabel('Your question', { exact: true })
  const context = page.getByLabel(/Helpful context/)

  await question.fill(
    'How do I make a responsible choice when two meaningful paths compete?'
  )
  await context.fill(
    'Both choices fit my values, but they require different commitments.'
  )

  await page.evaluate(() => {
    window.addEventListener('beforeunload', (event) => event.preventDefault())
  })
  await page.getByRole('button', { name: 'Prepare Email' }).click()

  await expect(question).toHaveValue(
    'How do I make a responsible choice when two meaningful paths compete?'
  )
  await expect(context).toHaveValue(
    'Both choices fit my values, but they require different commitments.'
  )
})

test('Ask Salim content contains no em dash characters', async ({ page }) => {
  await page.goto('/ask-salim')
  expect(await page.getByTestId('ask-salim-content').innerText()).not.toContain(
    '—'
  )
})
