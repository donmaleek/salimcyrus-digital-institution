const { test, expect } = require('@playwright/test')

test('homepage loads', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Salim Cyrus/)
})

test('keynote hero keeps Salim and primary actions visible on desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')

  const hero = page.getByTestId('home-hero')
  await expect(hero).toBeVisible()
  await expect(hero.getByRole('img', { name: /Salim Cyrus presenting/i })).toBeVisible()
  await expect(hero.getByRole('heading', { name: 'Salim Cyrus' })).toBeVisible()
  await expect(hero.getByRole('link', { name: 'Book a Session' })).toBeVisible()
  await expect(hero.getByRole('link', { name: 'Book Salim to Speak' })).toBeVisible()
})

test('keynote hero remains usable at a narrow mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/')

  const hero = page.getByTestId('home-hero')
  await expect(hero).toBeVisible()
  await expect(hero.getByRole('img', { name: /Salim Cyrus presenting/i })).toBeVisible()
  await expect(hero.getByRole('heading', { name: 'Salim Cyrus' })).toBeVisible()
  await expect(hero.getByRole('link', { name: 'Book a Session' })).toBeVisible()
  await expect(hero.getByRole('link', { name: 'Book Salim to Speak' })).toBeVisible()

  const heroBox = await hero.boundingBox()
  expect(heroBox.width).toBeLessThanOrEqual(375)
})
