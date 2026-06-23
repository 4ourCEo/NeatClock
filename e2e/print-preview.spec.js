import { test, expect } from '@playwright/test';

test.describe('print preview', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('toggles printer friendly view and hides task name inputs', async ({ page }) => {
    await expect(page.getByRole('row').getByRole('textbox').first()).toBeVisible();

    await page.locator('#btn-print-preview-toggle').click();

    await expect(page.locator('main')).toHaveClass(/print-preview-mode/);
    await expect(page.getByRole('row').getByRole('textbox')).toHaveCount(0);
  });
});
