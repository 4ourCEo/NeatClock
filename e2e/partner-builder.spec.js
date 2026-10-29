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
    expect(link.searchParams.get('business_id')).toMatch(/^[0-9a-f-]{36}$/i);
    expect(link.searchParams.has('fresh')).toBe(false);
    expect(link.searchParams.get('brandName')).toBe('North & Main Plumbing');
    expect(link.searchParams.get('brandPhone')).toBe('555-0199');
    expect(link.searchParams.get('brandWeb')).toBe('https://northmain.example/');

    const qr = page.getByRole('img', { name: 'QR code for customer calendar' });
    await expect(qr).toBeVisible();
    await expect.poll(async () => qr.getAttribute('src')).toMatch(/^data:image\/png;base64,/);
    await expect(page.getByRole('button', { name: /QR download checkout unavailable/i })).toBeDisabled();
  });

  test('opening a business link displays its preset and preserves an existing customer schedule', async ({ page }) => {
    const saved = [{ id: 'customer-custom-task', name: 'My custom reminder', interval: 2, unit: 'months' }];
    await page.addInitScript((tasks) => localStorage.setItem('neatclock_tasks', JSON.stringify(tasks)), saved);
    await page.goto('/?preset=hvac-business&business_id=b8a1c7d2-4f65-4cc3-a239-01c0ef89a112&brandName=North+Heating&brandPhone=555-0100');
    await page.waitForTimeout(400);
    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('neatclock_tasks')));
    expect(stored.map((task) => task.name)).toContain('My custom reminder');
    await expect(page.getByText('Replace HVAC air filter')).toBeVisible();
    await expect(page.getByText('Flush water heater')).toHaveCount(0);
    await expect(page.getByText('North Heating', { exact: true }).first()).toBeVisible();
    const calendarDownload = page.waitForEvent('download');
    await page.getByRole('button', { name: /Download branded calendar/i }).click();
    expect((await calendarDownload).suggestedFilename()).toBe('hvac-customer-care.ics');
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

  test('retry remains available when a saved entitlement cannot be rechecked temporarily', async ({ page }) => {
    let unavailable = true;
    const sessionId = 'cs_test_neatclock_saved_retry';
    await page.addInitScript(({ session, draft }) => {
      localStorage.setItem('neatclock_business_entitlement_v1', JSON.stringify({ checkoutSessionId: session, token: 'previously-issued-token' }));
      localStorage.setItem('neatclock_business_draft_v1', JSON.stringify(draft));
    }, { session: sessionId, draft: { industry: 'hvac', brand: { brandName: 'North Heating', brandPhone: '', brandEmail: '', brandWeb: '', brandLogo: '', brandColor: 'e07a5f' } } });
    await page.route('**/api/business-checkout', (route) => route.fulfill({ json: { available: false } }));
    await page.route('**/api/business-entitlement?session_id=*', (route) => {
      if (unavailable) return route.fulfill({ status: 503, json: { error: 'payment_verification_unavailable' } });
      return route.fulfill({ json: {
        checkout: { checkoutSessionId: sessionId, orderReference: 'saved_order_ref_123456' },
        payment: { verified: true, amountMinor: 4900, currency: 'usd' },
        product: { productId: 'neatclock.business-calendar-qr' },
        entitlement: { token: 'test.signed-entitlement', claims: { industry: 'hvac' } },
        fulfillment: { status: 'delivered' },
      } });
    });

    await page.goto('/?page=partner');
    await expect(page.getByRole('button', { name: 'Retry payment verification' })).toBeVisible();
    unavailable = false;
    await page.getByRole('button', { name: 'Retry payment verification' }).click();
    await expect(page.getByRole('status').filter({ hasText: 'Payment verified' })).toBeVisible();
  });
});
