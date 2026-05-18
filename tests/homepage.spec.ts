import { test, expect } from '@playwright/test'

test('homepage renders hero section', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('h1')).toBeVisible()
})

test('homepage renders filter bar', async ({ page }) => {
  await page.goto('/')
  // Check for category filter buttons
  await expect(page.getByRole('button', { name: 'ramen' })).toBeVisible()
})

test('homepage map tab link exists', async ({ page }) => {
  await page.goto('/')
  const mapLink = page.getByRole('link', { name: /map/i })
  await expect(mapLink).toBeVisible()
})
