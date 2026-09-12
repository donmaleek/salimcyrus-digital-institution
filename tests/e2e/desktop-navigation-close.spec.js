const { test, expect } = require('@playwright/test')

test('desktop submenu closes after a child route is selected', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 })
  await page.goto('/about')

  const navigation = page.getByRole('navigation', { name: 'Primary' })
  const parent = navigation.getByRole('link', { name: 'Work With Salim' })
  const child = navigation.getByRole('link', { name: 'Coaching' })

  await parent.hover()
  await expect(child).toBeVisible()
  await child.click()

  await expect(page).toHaveURL(/\/work-with-salim\/coaching$/)
  await expect(child).toBeHidden()
})
