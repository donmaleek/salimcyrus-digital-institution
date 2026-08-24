const { test, expect } = require('@playwright/test')

function uniqueEmail() {
  return `e2e-auth-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`
}

test('a new user can register and lands on login', async ({ page }) => {
  await page.goto('/register')
  await page.getByLabel('Name').fill('E2E Test User')
  await page.getByLabel('Email').fill(uniqueEmail())
  await page.getByLabel('Password').fill('ValidPassword123!')

  await page.getByRole('button', { name: 'Create Account' }).click()
  await expect(page).toHaveURL(/\/login$/)
})

test('login rejects an unknown account with a visible error', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('Email').fill('definitely-not-registered@example.com')
  await page.getByLabel('Password').fill('WhateverPassword123!')
  await page.getByRole('button', { name: 'Sign In' }).click()

  await expect(page.getByText('Invalid email or password.')).toBeVisible()
})

test('forgot password gives the same confirmation for any email, registered or not', async ({
  page,
}) => {
  await page.goto('/forgot-password')
  await page.getByLabel('Email').fill('nobody-at-all@example.com')

  const [response] = await Promise.all([
    page.waitForResponse((res) => res.url().includes('/api/auth/forgot-password')),
    page.getByRole('button', { name: 'Send Reset Link' }).click(),
  ])

  expect(response.status()).toBe(200)
  await expect(
    page.getByText(/If an account exists for that email, a reset link has been generated/)
  ).toBeVisible()
})

test('reset password page without a token tells the user to request a new link', async ({
  page,
}) => {
  await page.goto('/reset-password')
  await expect(page.getByText(/missing its reset token/)).toBeVisible()
  await expect(page.getByRole('link', { name: 'forgot password' })).toHaveAttribute(
    'href',
    '/forgot-password'
  )
})

test('reset password rejects an invalid or already-used token with a clear error', async ({
  page,
}) => {
  await page.goto('/reset-password?token=this-token-was-never-issued')
  await page.getByLabel('New Password', { exact: true }).fill('BrandNewPassword123!')
  await page.getByLabel('Confirm New Password').fill('BrandNewPassword123!')

  const [response] = await Promise.all([
    page.waitForResponse((res) => res.url().includes('/api/auth/reset-password')),
    page.getByRole('button', { name: 'Reset Password' }).click(),
  ])

  expect(response.status()).toBe(400)
  await expect(page.getByText(/invalid or has expired/)).toBeVisible()
})

test('reset password rejects mismatched confirmation before ever calling the API', async ({
  page,
}) => {
  await page.goto('/reset-password?token=irrelevant-for-this-check')
  await page.getByLabel('New Password', { exact: true }).fill('FirstPassword123!')
  await page.getByLabel('Confirm New Password').fill('DifferentPassword456!')

  await page.getByRole('button', { name: 'Reset Password' }).click()
  await expect(page.getByText('Passwords do not match.')).toBeVisible()
})

test('auth pages use the real brand wordmark, not plain heading text', async ({ page }) => {
  for (const path of ['/login', '/register', '/forgot-password']) {
    await page.goto(path)
    const wordmark = page.getByRole('link', { name: 'Salim Cyrus' }).first()
    await expect(wordmark).toHaveCSS('color', 'rgb(201, 162, 39)')
  }
})
