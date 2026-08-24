const { test, expect } = require('@playwright/test')

test('Journal presents a verified lead essay and structured editorial map', async ({
  page,
}) => {
  await page.goto('/journal')

  await expect(
    page.getByRole('heading', {
      name: 'Essays for the Questions That Refuse Easy Answers',
    })
  ).toBeVisible()
  await expect(
    page.getByRole('heading', {
      name: "People Vent on Social Media Because They Aren't Heard in Person",
    })
  ).toBeVisible()
  await expect(
    page.getByTestId('journal-themes').locator(':scope > li')
  ).toHaveCount(6)
  await expect(
    page.getByTestId('reading-method').locator(':scope > li')
  ).toHaveCount(4)
  await expect(
    page.getByTestId('editorial-desk').locator(':scope > li')
  ).toHaveCount(5)
})

test('Journal opens the published essay overview without a dead source link', async ({
  page,
}) => {
  await page.goto('/journal')
  await page.getByRole('link', { name: /Read the editorial overview/ }).click()

  await expect(page).toHaveURL(
    /people-vent-on-social-media-because-they-arent-heard-in-person/
  )
  await expect(
    page.getByTestId('entry-ideas').locator(':scope > li')
  ).toHaveCount(4)
  await expect(
    page.getByRole('link', { name: 'Explore the Journal' })
  ).toHaveAttribute('href', '/journal')
})

test('Journal route family contains no em dash characters', async ({
  page,
}) => {
  for (const route of [
    '/journal',
    '/journal/people-vent-on-social-media-because-they-arent-heard-in-person',
  ]) {
    await page.goto(route)
    expect(
      await page
        .getByTestId(
          route === '/journal' ? 'journal-content' : 'journal-entry-content'
        )
        .innerText()
    ).not.toContain('—')
  }
})
