import { test, expect } from '@playwright/test';

test.describe('preset deep links — fresh visit', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.clear());
  });

  test('?preset=gearhead loads Preventive Gearhead on fresh visit', async ({ page }) => {
    await page.goto('/?preset=gearhead');

    await expect(page.getByRole('img', { name: 'NeatClock' })).toBeVisible();
    await expect(
      page.getByText('Current View:').locator('..').getByText('Preventive Gearhead')
    ).toBeVisible();
    await expect(page.locator('table input[type="text"]').first()).toHaveValue('Engine Oil Change');
  });

  test('?preset=home loads Home Sentinel preset', async ({ page }) => {
    await page.goto('/?preset=home');

    await expect(
      page.getByText('Current View:').locator('..').getByText("Homeowner's Sentinel")
    ).toBeVisible();
    await expect(page.locator('table input[type="text"]').first()).toHaveValue('HVAC Filter Replacement');
  });
});

test('?fresh=1 overrides saved tasks', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.goto('/?preset=gearhead');

  const firstTaskInput = page
    .getByRole('row')
    .filter({ has: page.getByRole('textbox') })
    .first()
    .getByRole('textbox')
    .first();
  await firstTaskInput.fill('Custom task name');
  await firstTaskInput.blur();
  await page.waitForFunction(() => {
    const saved = localStorage.getItem('neatclock_tasks');
    return saved?.includes('Custom task name');
  });
  await page.goto('/');

  await expect(page.locator('table input[type="text"]').first()).toHaveValue('Custom task name');

  await page.goto('/?preset=home&fresh=1');

  await expect(
    page.getByText('Current View:').locator('..').getByText("Homeowner's Sentinel")
  ).toBeVisible();
  await expect(page.locator('table input[type="text"]').first()).toHaveValue('HVAC Filter Replacement');
});
