import { test, expect } from '@playwright/test';

test.describe('B2B co-branding banner', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.clear());
  });

  test('parses and displays brandName, brandPhone, and brandWeb URL parameters', async ({ page }) => {
    await page.goto('/?brandName=Gilbert+Real+Estate&brandPhone=123-456-7890&brandWeb=gilbert.com');

    // Verify Brought to you by banner header is present
    await expect(page.getByText('Brought to you by', { exact: false })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Gilbert Real Estate' })).toBeVisible();

    // Verify contact info is rendered
    await expect(page.getByText('123-456-7890', { exact: true })).toBeVisible();
    await expect(page.getByRole('link', { name: 'gilbert.com' })).toBeVisible();
  });
});
