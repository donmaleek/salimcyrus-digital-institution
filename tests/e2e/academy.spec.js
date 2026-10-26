const { test, expect } = require('@playwright/test')

test('Academy explains its method and subject areas', async ({ page }) => {
  await page.goto('/academy')

  const content = page.getByTestId('academy-content')
  await expect(
    content.getByRole('heading', { name: 'From insight to formation' })
  ).toBeVisible()
  for (const step of [
    'Name the real issue',
    'Learn a clear framework',
    'Practice the change',
    'Review and strengthen',
  ]) {
    await expect(content.getByRole('heading', { name: step })).toBeVisible()
  }
  for (const subject of [
    'Identity',
    'Relationships',
    'Manhood',
    'Kingdom',
    'Execution',
    'Restoration',
  ]) {
    await expect(
      content.getByRole('heading', { name: subject, exact: true })
    ).toBeVisible()
  }
})

test('Academy lists seven programs with explicit international pricing', async ({
  page,
}) => {
  await page.goto('/academy')

  const programs = page.getByTestId('academy-programs')
  await expect(programs.getByRole('article')).toHaveCount(7)
  await expect(programs.getByText(/KES\s*25,000/).first()).toBeVisible()
  await expect(programs.getByText(/USD\s*193/).first()).toBeVisible()
  await expect(
    programs.getByRole('link', { name: 'View curriculum and apply' })
  ).toHaveCount(7)
})

test('Academy distinguishes available programs from planned courses', async ({
  page,
}) => {
  await page.goto('/academy')

  await expect(page.getByText('Three Ways to Learn, All Available Now')).toBeVisible()
  await expect(
    page.getByRole('link', { name: 'Browse Masterclasses' })
  ).toHaveAttribute('href', '/academy/masterclasses')
  await expect(
    page.getByRole('link', { name: 'Browse Courses' })
  ).toHaveAttribute('href', '/academy/courses')
})

test('Academy contains no em dash characters', async ({ page }) => {
  await page.goto('/academy')
  expect(await page.getByTestId('academy-content').innerText()).not.toContain(
    '—'
  )
})
