import { test, expect } from '@playwright/test';

test.describe('Partner Builder Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => localStorage.clear());
  });

  test('loads partner builder and generates co-branded URL link', async ({ page }) => {
    await page.goto('/?page=partner');

    // Verify builder title is visible
    await expect(page.getByRole('heading', { name: 'Co-Brand neatclock.pro' })).toBeVisible();

    // Fill form details
    const nameInput = page.locator('label:has-text("Business Name") + input');
    await nameInput.fill('Bloodsaw Realty');

    const phoneInput = page.locator('label:has-text("Phone") + input');
    await phoneInput.fill('555-0199');

    const webInput = page.locator('label:has-text("Website") + input');
    await webInput.fill('bloodsaw.com');

    // Verify live preview is rendered
    await expect(page.getByText('Brought to you by')).toBeVisible();
    await expect(page.locator('h4:has-text("Bloodsaw Realty")')).toBeVisible();

    // Verify generated URL matches values
    const urlTextArea = page.locator('textarea');
    const generatedUrl = await urlTextArea.inputValue();
    expect(generatedUrl).toContain('brandName=Bloodsaw+Realty');
    expect(generatedUrl).toContain('brandPhone=555-0199');
    expect(generatedUrl).toContain('brandWeb=bloodsaw.com');
    expect(generatedUrl).toContain('preset=home');
  });
});
