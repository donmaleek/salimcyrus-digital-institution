const { test, expect } = require('@playwright/test')

test('homepage loads', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Salim Cyrus/)
})

test('keynote hero keeps Salim and primary actions visible on desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 })
  await page.goto('/')

  const hero = page.getByTestId('home-hero')
  await expect(hero).toBeVisible()
  await expect(hero.getByRole('img', { name: /Salim Cyrus presenting/i })).toBeVisible()
  await expect(hero.getByRole('heading', { name: 'Salim Cyrus' })).toBeVisible()
  await expect(hero.getByRole('link', { name: 'Book a Session' })).toBeVisible()
  await expect(hero.getByRole('link', { name: 'Book Salim to Speak' })).toBeVisible()

  const heroBox = await hero.boundingBox()
  expect(heroBox.width / heroBox.height).toBeCloseTo(1672 / 941, 1)
})

test('landscape image remains visible in a desktop page hero', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1080 })
  await page.goto('/work-with-salim/speaking')

  const image = page.getByRole('img', { name: 'Salim Cyrus delivering a keynote on stage' })
  await expect(image).toBeVisible()

  const imageBox = await image.boundingBox()
  expect(imageBox.width).toBeGreaterThanOrEqual(440)
  expect(imageBox.height).toBeGreaterThanOrEqual(247)
  await expect.poll(() => image.evaluate((element) => element.naturalWidth)).toBeGreaterThan(0)
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
