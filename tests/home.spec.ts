import { test, expect } from '@playwright/test';

test('homepage répond et a un title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Shopify|Home|Boutique/i);
});
