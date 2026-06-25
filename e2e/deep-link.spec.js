import { test, expect } from '@playwright/test';

test('?preset=gearhead loads Preventive Gearhead on fresh visit', async ({ page }) => {
  await page.addInitScript(() => localStorage.clear());
  await page.goto('/?preset=gearhead');

  await expect(page.getByRole('img', { name: 'NeatClock' })).toBeVisible();
  await expect(
    page.getByText('Current View:').locator('..').getByText('Preventive Gearhead')
  ).toBeVisible();
  await expect(page.locator('table input[type="text"]').first()).toHaveValue('Engine Oil Change');
});
