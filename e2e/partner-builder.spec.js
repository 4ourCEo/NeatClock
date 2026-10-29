import { test, expect } from '@playwright/test';

test.describe('NeatClock Business HVAC and plumbing calendar flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      if (sessionStorage.getItem('neatclock-test-storage-cleared')) return;
      localStorage.clear();
      sessionStorage.setItem('neatclock-test-storage-cleared', '1');
    });
  });

  test('generates a plumbing customer calendar with business branding, share link, and QR', async ({ page }) => {
    await page.route('**/api/business-checkout', (route) => route.fulfill({ json: { available: false } }));
    await page.goto('/?page=partner');

    await expect(page.getByRole('heading', { name: /branded maintenance calendar/i })).toBeVisible();
    await page.getByLabel('Industry preset').selectOption('plumbing');
    await page.getByLabel('Business name *').fill('North & Main Plumbing');
    await page.getByLabel('Phone (optional)').fill('555-0199');
    await page.getByLabel('Website (optional)').fill('northmain.example');

    await expect(page.getByText('Flush water heater')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'North & Main Plumbing' })).toBeVisible();

    const link = new URL(await page.getByLabel('Customer share link').inputValue());
    expect(link.searchParams.get('preset')).toBe('plumbing-business');
    expect(link.searchParams.get('fresh')).toBe('1');
    expect(link.searchParams.get('brandName')).toBe('North & Main Plumbing');
    expect(link.searchParams.get('brandPhone')).toBe('555-0199');
    expect(link.searchParams.get('brandWeb')).toBe('https://northmain.example/');

    const qr = page.getByRole('img', { name: 'QR code for customer calendar' });
    await expect(qr).toBeVisible();
    await expect.poll(async () => qr.getAttribute('src')).toMatch(/^data:image\/png;base64,/);
    await expect(page.getByRole('button', { name: /QR download checkout unavailable/i })).toBeDisabled();
  });

  test('simulated paid return verifies entitlement before delivering the QR download', async ({ page }) => {
    const sessionId = 'cs_test_neatclock_e2e';
    let checkoutCreated = false;
    await page.route('**/api/business-checkout', async (route) => {
      if (route.request().method() === 'GET') {
        return route.fulfill({ json: { available: true, price: { amountMinor: 4900, currency: 'usd' } } });
      }
      checkoutCreated = true;
      return route.fulfill({ json: {
        checkout: { checkoutSessionId: sessionId, orderReference: 'test_order_ref_12345678' },
        checkoutUrl: `${new URL(route.request().url()).origin}/?page=partner&purchase=complete&session_id=${sessionId}`,
      } });
    });
    await page.route('**/api/business-entitlement?session_id=*', (route) => route.fulfill({ json: {
      product: { productId: 'neatclock.business-calendar-qr' },
      checkout: { checkoutSessionId: sessionId },
      payment: { verified: true, amountMinor: 4900, currency: 'usd' },
      entitlement: { token: 'test.signed-entitlement', claims: { expiresAt: Math.floor(Date.now() / 1000) + 3600 } },
      fulfillment: { status: 'delivered' },
    } }));

    await page.goto('/?page=partner');
    await page.getByLabel('Business name *').fill('Northstar Heating');
    await page.getByRole('button', { name: /purchase QR license/i }).click();
    await expect(page).toHaveURL(/purchase=complete/);
    await expect(page.getByRole('status').filter({ hasText: 'Payment verified' })).toBeVisible();
    expect(checkoutCreated).toBe(true);

    const download = page.waitForEvent('download');
    await page.getByRole('link', { name: /Download QR PNG/i }).click();
    expect((await download).suggestedFilename()).toBe('neatclock-business-calendar-qr.png');
  });
});
