import { test, expect } from '@playwright/test';

test.describe('storage failure toast', () => {
  test('surfaces save failure when localStorage quota is exceeded', async ({ page }) => {
    await page.addInitScript(() => {
      const originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = function setItem(key, value) {
        if (String(key).startsWith('neatclock_')) {
          const err = new DOMException('Quota exceeded', 'QuotaExceededError');
          throw err;
        }
        return originalSetItem.call(this, key, value);
      };
    });

    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    const firstTaskInput = page
      .getByRole('row')
      .filter({ has: page.getByRole('textbox') })
      .first()
      .getByRole('textbox')
      .first();
    await firstTaskInput.fill('Storage Failure Test Task');

    await page.waitForTimeout(400);

    await expect(page.locator('.toast-fixed')).toContainText(/Could not save/i);
  });
});
