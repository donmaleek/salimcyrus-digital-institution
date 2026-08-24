const { test, expect } = require('@playwright/test')

const routes = [
  '/books',
  '/knowledge-centre',
  '/halisi-hub-connect',
  '/journal',
  '/ask-salim',
  '/contact',
]

test.use({ viewport: { width: 390, height: 844 } })

for (const route of routes) {
  test(`${route} has a safe and usable mobile hero`, async ({ page }) => {
    await page.goto(route)

    const header = page.locator('header')
    const hero = page.getByTestId('page-hero')
    const heading = hero.getByRole('heading', { level: 1 })
    const [headerBox, heroBox, headingBox] = await Promise.all([
      header.boundingBox(),
      hero.boundingBox(),
      heading.boundingBox(),
    ])

    expect(headerBox).not.toBeNull()
    expect(heroBox).not.toBeNull()
    expect(headingBox).not.toBeNull()
    expect(heroBox.height).toBeGreaterThanOrEqual(780)
    expect(headingBox.y).toBeGreaterThanOrEqual(
      headerBox.y + headerBox.height + 12
    )

    const actionLinks = hero.locator('a').filter({ hasNotText: 'Salim Cyrus' })
    for (let index = 0; index < (await actionLinks.count()); index += 1) {
      const box = await actionLinks.nth(index).boundingBox()
      expect(box).not.toBeNull()
      expect(box.x).toBeGreaterThanOrEqual(23)
      expect(box.x + box.width).toBeLessThanOrEqual(367)
      expect(box.height).toBeGreaterThanOrEqual(44)
    }

    if ((await actionLinks.count()) > 0) {
      const lastActionBox = await actionLinks.last().boundingBox()
      const scrollCueBox = await hero
        .getByText('Scroll to explore', { exact: true })
        .boundingBox()
      expect(lastActionBox).not.toBeNull()
      expect(scrollCueBox).not.toBeNull()
      expect(lastActionBox.y + lastActionBox.height + 16).toBeLessThanOrEqual(
        scrollCueBox.y
      )
    }
  })

  test(`${route} has no horizontal mobile overflow`, async ({ page }) => {
    await page.goto(route)
    const dimensions = await page.evaluate(() => ({
      viewport: window.innerWidth,
      document: document.documentElement.scrollWidth,
      body: document.body.scrollWidth,
    }))

    expect(dimensions.document).toBeLessThanOrEqual(dimensions.viewport)
    expect(dimensions.body).toBeLessThanOrEqual(dimensions.viewport)
  })
}
