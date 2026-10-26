const { test, expect } = require('@playwright/test')

// Needs a real admin account: E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD. Creates a
// throwaway masterclass, so point it at a local or staging database only.
const email = process.env.E2E_ADMIN_EMAIL
const password = process.env.E2E_ADMIN_PASSWORD

test.skip(!email || !password, 'set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD to run')

test('admin can set up a masterclass and upload a >10MB protected video', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel(/email/i).first().fill(email)
  await page.getByLabel(/password/i).first().fill(password)
  await page.getByRole('button', { name: /sign in|log in/i }).click()
  await page.waitForURL(/dashboard/)

  await page.goto('/dashboard/admin/courses/new')
  const editor = page.getByTestId('course-editor')
  await editor.getByLabel('Title', { exact: true }).fill(`E2E Masterclass ${Date.now()}`)
  await editor.getByLabel('Format').selectOption('masterclass')
  await editor.getByLabel('Sales description').fill('An end to end check of the masterclass setup and secure video upload flow.')
  await editor.getByLabel(/Learning outcomes/).fill('Verify the upload path')
  await editor.getByLabel('Price (KES)').fill('1500.7')
  await editor.getByLabel('Section 1 title').fill('Session')
  await editor.getByLabel('Lesson title').fill('Replay')
  await editor.getByLabel('Duration (minutes)').fill('45.5')

  await expect(editor.getByLabel('Price (KES)')).toHaveValue('1501')
  await expect(editor.getByLabel('Duration (minutes)')).toHaveValue('46')

  await page.getByRole('button', { name: 'Save draft' }).click()
  await page.waitForURL(/\/dashboard\/admin\/courses\/[^/]+\/edit/)

  await page.locator('input[type=file][accept^="video"]').setInputFiles({
    name: 'replay.mp4',
    mimeType: 'video/mp4',
    buffer: Buffer.alloc(40 * 1024 * 1024),
  })
  await expect(page.getByText(/Video uploaded/)).toBeVisible({ timeout: 60000 })
})
