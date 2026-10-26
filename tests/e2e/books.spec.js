const { test, expect } = require('@playwright/test')

test('Books page presents all available books with order and detail routes', async ({
  page,
}) => {
  await page.goto('/books')

  const list = page.getByTestId('available-book-list')
  await expect(list.getByRole('article')).toHaveCount(14)
  for (const title of [
    'Understanding the Marketplace',
    'The Great Deception',
    'Concealed Redemption',
  ]) {
    await expect(list.getByRole('heading', { name: title })).toBeVisible()
  }
  const prices = await list.getByText(/^KES \d{3}$/).allInnerTexts()
  expect(prices.length).toBeGreaterThanOrEqual(14)
  for (const price of prices) {
    const kes = Number(price.replace('KES ', ''))
    expect(kes).toBeGreaterThanOrEqual(500)
    expect(kes).toBeLessThanOrEqual(600)
  }
  await expect(list.getByRole('link', { name: 'Buy & Download' })).toHaveCount(14)
  const detailLinks = await list.getByRole('link', { name: 'Buy & Download' }).evaluateAll((a) => a.map((x) => x.getAttribute('href')))
  expect(detailLinks.length).toBe(14)
  for (const href of detailLinks) expect(href).toMatch(/^\/books\/[a-z0-9-]+$/)
})

test('Books page explains its reading practice', async ({ page }) => {
  await page.goto('/books')

  await expect(
    page.getByRole('heading', {
      name: 'Read for a decision, not a finish line',
    })
  ).toBeVisible()
  for (const step of [
    'Read with one question',
    'Mark what confronts you',
    'Choose one response',
    'Review after seven days',
  ]) {
    await expect(page.getByRole('heading', { name: step })).toBeVisible()
  }
})

test('Books page lists the purpose title as available', async ({ page }) => {
  await page.goto('/books')

  await expect(
    page.getByRole('heading', { name: 'The Greatest Tragedy Is Not Death' })
  ).toBeVisible()
  await expect(page.getByText('Pornography and the Death of Purpose').first()).toBeVisible()
})

test('Books page contains no em dash characters', async ({ page }) => {
  await page.goto('/books')
  expect(await page.getByTestId('books-content').innerText()).not.toContain('—')
})
