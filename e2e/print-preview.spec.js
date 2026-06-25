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
    await expect(page.locator('main')).toHaveAttribute('data-active-preset', "Homeowner's Sentinel");
    await expect(page.locator('main.print-preview-mode')).toHaveCSS('padding', /48px|0\.5in/);
  });

  test('toggles print customizer options (brand header and notes)', async ({ page }) => {
    // Navigate with brand parameters so B2B banner is active
    await page.goto('/?brandName=Gilbert+Real+Estate');
    
    // Toggle to Print Preview
    await page.locator('#btn-print-preview-toggle').click();
    
    // Customizer controls should be visible
    await expect(page.getByText('Print Customizer:')).toBeVisible();
    
    // Verify B2B banner is initially visible and does not have no-print
    const brandBanner = page.locator('.b2b-brand-banner');
    await expect(brandBanner).toBeVisible();
    await expect(brandBanner).not.toHaveClass(/no-print/);
    
    // Checkboxes should exist
    const showHeaderCheckbox = page.getByLabel('Show Brand Header');
    const appendNotesCheckbox = page.getByLabel('Append Blank Note Lines');
    
    await expect(showHeaderCheckbox).toBeChecked();
    await expect(appendNotesCheckbox).not.toBeChecked();
    
    // The notes section should not be visible initially
    await expect(page.getByRole('heading', { name: 'Notes & Hand-written Tasks' })).not.toBeVisible();
    
    // Toggle blank notes checkbox
    await appendNotesCheckbox.check();
    await expect(page.getByRole('heading', { name: 'Notes & Hand-written Tasks' })).toBeVisible();
    
    // Toggle show brand header off
    await showHeaderCheckbox.uncheck();
    await expect(brandBanner).toHaveClass(/no-print/);
    
    // Toggle show brand header back on
    await showHeaderCheckbox.check();
    await expect(brandBanner).not.toHaveClass(/no-print/);
  });
});
