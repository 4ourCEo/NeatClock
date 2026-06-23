import { test, expect } from '@playwright/test';

test.describe('theme swap', () => {
  test('switches to Obsidian and shows light logo variant', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    await expect(page.getByRole('img', { name: 'NeatClock' })).toHaveAttribute('src', '/logo.png');

    await page.getByRole('button', { name: /Obsidian/i }).click();

    await expect(page.getByRole('img', { name: 'NeatClock' })).toHaveAttribute('src', '/logo-light.png');
  });
});
