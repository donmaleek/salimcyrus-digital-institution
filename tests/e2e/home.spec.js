const { test, expect } = require('@playwright/test')

test('homepage loads', async ({ page }) => {
  await page.goto('/')
  await expect(page).toHaveTitle(/Salim Cyrus/)
})

test('desktop navigation has generous spacing without wrapping', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/')

  const nav = page.getByRole('navigation', { name: 'Primary' })
  await expect(nav).toBeVisible()

  const links = nav.getByRole('link')
  const first = await links.nth(0).boundingBox()
  const second = await links.nth(1).boundingBox()
  expect(second.x - (first.x + first.width)).toBeGreaterThanOrEqual(8)
  expect(second.y).toBe(first.y)
})

test('keynote hero keeps Salim and primary actions visible on desktop', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1920, height: 1080 })
  await page.goto('/')

  const hero = page.getByTestId('home-hero')
  await expect(hero).toBeVisible()
  await expect(hero.getByText('Scroll to explore')).toBeVisible()
  await expect(
    hero.getByRole('img', { name: /Salim Cyrus presenting/i })
  ).toBeVisible()
  await expect(hero.getByRole('heading', { name: 'Salim Cyrus' })).toBeVisible()
  await expect(hero.getByRole('link', { name: 'Book a Session' })).toBeVisible()
  await expect(
    hero.getByRole('link', { name: 'Book Salim to Speak' })
  ).toBeVisible()

  const heroBox = await hero.boundingBox()
  const cueBox = await hero.getByText('Scroll to explore').boundingBox()
  expect(heroBox.height).toBeCloseTo((heroBox.width * 941) / 1672 - 100, 0)
  expect(
    heroBox.y + heroBox.height - (cueBox.y + cueBox.height)
  ).toBeGreaterThanOrEqual(40)
})

test('landscape image remains visible in a desktop page hero', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1920, height: 1080 })
  await page.goto('/work-with-salim/speaking')

  const hero = page.getByTestId('page-hero')
  const image = hero.getByTestId('page-hero-full-image')
  await expect(hero).toBeVisible()
  await expect(image).toBeVisible()
  await expect(hero.getByText('Scroll to explore')).toBeVisible()

  const imageBox = await image.boundingBox()
  expect(imageBox.width).toBeGreaterThanOrEqual(1900)
  expect(imageBox.height).toBeGreaterThanOrEqual(680)
  await expect
    .poll(() => image.evaluate((element) => element.naturalWidth))
    .toBeGreaterThan(0)
})

for (const [route, asset] of [
  ['/academy', 'academy-hero.webp'],
  ['/knowledge-centre', 'knowledge-hero.webp'],
  ['/halisi-hub-connect', 'community-hero.webp'],
  ['/media', 'media-hero.webp'],
]) {
  test(`${route} uses its topic-specific hero image`, async ({ page }) => {
    await page.goto(route)
    const image = page.getByTestId('page-hero-full-image')
    await expect(image).toBeVisible()
    await expect
      .poll(() => image.evaluate((element) => element.currentSrc))
      .toContain(asset)
  })
}

test('keynote hero remains usable at a narrow mobile viewport', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/')

  const hero = page.getByTestId('home-hero')
  await expect(hero).toBeVisible()
  await expect(
    hero.getByRole('img', { name: /Salim Cyrus presenting/i })
  ).toBeVisible()
  await expect(hero.getByRole('heading', { name: 'Salim Cyrus' })).toBeVisible()
  await expect(hero.getByRole('link', { name: 'Book a Session' })).toBeVisible()
  await expect(
    hero.getByRole('link', { name: 'Book Salim to Speak' })
  ).toBeVisible()

  const heroBox = await hero.boundingBox()
  expect(heroBox.width).toBeLessThanOrEqual(375)
  expect(heroBox.height).toBeLessThanOrEqual(812)
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth)
  ).toBeLessThanOrEqual(375)
})

test('page hero sits behind navigation and fills the canvas', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 768 })
  await page.goto('/academy')

  const headerBox = await page.locator('header').boundingBox()
  const hero = page.getByTestId('page-hero')
  const heroBox = await hero.boundingBox()
  const image = hero.getByTestId('page-hero-full-image')

  expect(headerBox.y).toBe(heroBox.y)
  expect(heroBox.height).toBeCloseTo((heroBox.width * 941) / 1672 - 100, 0)
  await expect(hero.getByText('Scroll to explore')).toBeVisible()
  expect(
    await page
      .locator('header')
      .evaluate((element) => getComputedStyle(element).backgroundColor)
  ).toBe('rgba(0, 0, 0, 0)')
  expect(
    await image.evaluate((element) => getComputedStyle(element).objectFit)
  ).toBe('cover')
})

test('mobile page hero uses portrait art that fills its canvas', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/media')

  const hero = page.getByTestId('page-hero')
  const image = page.getByTestId('page-hero-full-image')
  const heroBox = await hero.boundingBox()

  expect(
    await image.evaluate((element) => getComputedStyle(element).objectFit)
  ).toBe('cover')
  await expect
    .poll(() => image.evaluate((element) => element.currentSrc))
    .toContain('media-hero-mobile.webp')
  expect(heroBox.width / heroBox.height).toBeCloseTo(941 / 1672, 1)
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth)
  ).toBeLessThanOrEqual(390)
  await expect(hero.getByText('Scroll to explore')).toBeVisible()
})
