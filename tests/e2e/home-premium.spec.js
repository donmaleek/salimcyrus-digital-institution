const { test, expect } = require('@playwright/test')

test.describe('premium institutional homepage', () => {
  test('guides visitors through the complete institution', async ({ page }) => {
    await page.goto('/')

    await expect(page.getByTestId('home-authority')).toContainText('Certified Life Coach')
    await expect(page.getByTestId('home-pathways')).toContainText('I need clarity now')
    await expect(page.getByTestId('home-academy')).toContainText('Identity Reformation Program')
    await expect(page.getByTestId('home-books')).toContainText('Concealed Redemption')
    await expect(page.getByTestId('home-knowledge')).toContainText('Seven fields of thought')
    await expect(page.getByTestId('home-community-journal')).toContainText('Halisi Hub Connect')
    await expect(page.getByRole('link', { name: 'Contact the Institution' })).toBeVisible()
  })

  test('keeps the redesigned homepage usable on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 })
    await page.goto('/')

    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390)
    for (const id of ['home-authority', 'home-pathways', 'home-academy', 'home-books', 'home-knowledge', 'home-community-journal']) {
      await expect(page.getByTestId(id)).toBeVisible()
    }

    const actions = page.getByRole('link', { name: /Find Your Starting Point|Contact the Institution/ })
    for (let index = 0; index < await actions.count(); index += 1) {
      const box = await actions.nth(index).boundingBox()
      expect(box.height).toBeGreaterThanOrEqual(44)
    }
  })
})
