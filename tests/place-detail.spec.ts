import { test, expect } from '@playwright/test'

test('unknown slug returns 404', async ({ page }) => {
  const response = await page.goto('/places/nonexistent-slug-xyz-abc')
  expect(response?.status()).toBe(404)
})
