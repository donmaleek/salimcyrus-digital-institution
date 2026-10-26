const { test, expect } = require('@playwright/test')

// Needs a real admin account and a seeded CRM (npm run crm:seed):
// E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD. Creates throwaway records, so point it
// at a local or staging database only.
const email = process.env.E2E_ADMIN_EMAIL
const password = process.env.E2E_ADMIN_PASSWORD

test.skip(!email || !password, 'set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD to run')

test.beforeEach(async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel(/email/i).first().fill(email)
  await page.getByLabel(/password/i).first().fill(password)
  await page.getByRole('button', { name: /sign in|log in/i }).click()
  await page.waitForURL(/dashboard/)
})

test('admin sidebar has no duplicate dashboard entry and every link loads', async ({ page }) => {
  const links = await page.locator('nav[aria-label="Dashboard"] a').evaluateAll((a) => a.map((x) => x.getAttribute('href')))
  expect(links.length).toBeGreaterThanOrEqual(18)
  expect(links).not.toContain('/dashboard')
  for (const href of links) {
    const response = await page.goto(href)
    expect(response.status(), href).toBeLessThan(400)
  }
})

test('opportunity can be saved without a close date and in a non-default pipeline', async ({ page }) => {
  await page.goto('/dashboard/admin/crm/pipeline')
  await page.getByRole('button', { name: 'Add opportunity' }).click()
  const dialog = page.locator('[aria-label="Add opportunity"]').first()
  const title = `E2E Opportunity ${Date.now()}`
  await dialog.getByLabel('Opportunity').fill(title)
  await dialog.getByLabel(/Expected value/).fill('25000.50')
  const pipeline = dialog.getByLabel('Pipeline')
  const options = await pipeline.locator('option').count()
  expect(options).toBeGreaterThan(1)
  await pipeline.selectOption({ index: 2 })
  const response = page.waitForResponse((r) => r.url().includes('/api/admin/crm/opportunities') && r.request().method() === 'POST')
  await dialog.getByRole('button', { name: 'Save record' }).click()
  expect((await response).status()).toBe(201)
  await expect(page.getByText(title).first()).toBeVisible()
})

test('task can be created and completed with visible feedback', async ({ page }) => {
  await page.goto('/dashboard/admin/crm/tasks')
  await page.getByRole('button', { name: 'Create task' }).click()
  const dialog = page.locator('[aria-label="Create task"]').first()
  const title = `E2E Task ${Date.now()}`
  await dialog.getByLabel('What needs to happen?').fill(title)
  await dialog.getByLabel('Due date').fill('2026-12-01T09:00')
  await dialog.getByRole('button', { name: 'Save record' }).click()
  const row = page.getByText(title).first().locator('xpath=ancestor::*[.//button[normalize-space()="Complete"]][1]')
  const patch = page.waitForResponse((r) => r.url().includes('/api/admin/crm/tasks') && r.request().method() === 'PATCH')
  await row.getByRole('button', { name: 'Complete' }).click()
  expect((await patch).status()).toBe(200)
  await expect(page.getByText(title)).toHaveCount(0)
})

test('teaching prices snap to whole numbers before saving', async ({ page }) => {
  await page.goto('/dashboard/admin/teachings/new')
  await page.getByLabel(/Price \(KES\)/).fill('1500.5')
  await page.getByLabel(/Price \(USD\)/).fill('12.5')
  await expect(page.getByLabel(/Price \(KES\)/)).toHaveValue('1501')
  await expect(page.getByLabel(/Price \(USD\)/)).toHaveValue('13')
})
