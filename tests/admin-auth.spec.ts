import { test, expect } from '@playwright/test'

test('unauthenticated user is redirected from /admin to /admin/login', async ({ page }) => {
  await page.goto('/admin')
  await expect(page).toHaveURL(/\/admin\/login/)
})

test('admin login page shows email and password fields', async ({ page }) => {
  await page.goto('/admin/login')
  await expect(page.getByLabel('Email')).toBeVisible()
  await expect(page.getByLabel('Password')).toBeVisible()
})
