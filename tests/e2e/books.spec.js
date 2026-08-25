const { test, expect } = require('@playwright/test')

test('Books page presents all available books with order and detail routes', async ({
  page,
}) => {
  await page.goto('/books')

  const list = page.getByTestId('available-book-list')
  await expect(list.getByRole('article')).toHaveCount(14)
  for (const title of [
    'Understanding the Marketplace',
    'The Unhealed Traumas of Our Parents',
    'Concealed Redemption',
  ]) {
    await expect(list.getByRole('heading', { name: title })).toBeVisible()
  }
  await expect(list.getByText('KES 1,499')).toHaveCount(14)
  await expect(list.getByRole('link', { name: 'Order' })).toHaveCount(14)
  await expect(list.getByRole('link', { name: 'Details' })).toHaveCount(14)
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
  await expect(page.getByText('It Is a Life Without Purpose')).toBeVisible()
})

test('Books page contains no em dash characters', async ({ page }) => {
  await page.goto('/books')
  expect(await page.getByTestId('books-content').innerText()).not.toContain('—')
})
