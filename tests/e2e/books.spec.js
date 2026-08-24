const { test, expect } = require('@playwright/test')

test('Books page presents two available books with purchase and detail routes', async ({
  page,
}) => {
  await page.goto('/books')

  const list = page.getByTestId('available-book-list')
  await expect(list.getByRole('article')).toHaveCount(2)
  for (const title of ['Concealed Redemption', 'The Great Deception']) {
    await expect(list.getByRole('heading', { name: title })).toBeVisible()
  }
  await expect(list.getByText('KES 1,499')).toHaveCount(2)
  await expect(list.getByRole('link', { name: 'Buy Now' })).toHaveCount(2)
  await expect(
    list.getByRole('link', { name: 'Read About the Book' })
  ).toHaveCount(2)
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

test('Books page distinguishes the upcoming purpose title', async ({
  page,
}) => {
  await page.goto('/books')

  await expect(page.getByText('Upcoming Title', { exact: true })).toBeVisible()
  await expect(
    page.getByRole('heading', { name: 'The Greatest Tragedy Is Not Death...' })
  ).toBeVisible()
  await expect(page.getByText('It Is a Life Without Purpose')).toBeVisible()
  await expect(
    page.getByRole('link', { name: 'Get Release Updates' })
  ).toHaveAttribute('href', '/contact')
})

test('Books page contains no em dash characters', async ({ page }) => {
  await page.goto('/books')
  expect(await page.getByTestId('books-content').innerText()).not.toContain('—')
})
