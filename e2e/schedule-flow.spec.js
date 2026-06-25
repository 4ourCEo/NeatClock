import { test, expect } from '@playwright/test';

test.describe('schedule flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('preset switch, edit task, export ICS, and backup', async ({ page }) => {
    await expect(page.getByRole('img', { name: 'NeatClock' })).toBeVisible();

    await page.getByRole('button', { name: /Preventive Gearhead/i }).click();

    const confirmModal = page.getByRole('dialog', { name: /Overwrite current list/i });
    if (await confirmModal.isVisible()) {
      await confirmModal.getByRole('button', { name: 'Confirm' }).click();
    }

    await expect(
      page.getByText('Current View:').locator('..').getByText('Preventive Gearhead')
    ).toBeVisible();

    const firstTaskInput = page
      .getByRole('row')
      .filter({ has: page.getByRole('textbox') })
      .first()
      .getByRole('textbox')
      .first();
    await firstTaskInput.fill('Custom Oil Change Reminder');
    await expect(firstTaskInput).toHaveValue('Custom Oil Change Reminder');

    const icsDownload = page.waitForEvent('download');
    await page.getByRole('button', { name: /Generate & Export \.ics/i }).click();
    const download = await icsDownload;
    expect(download.suggestedFilename()).toBe('neatclock-schedule.ics');

    await expect(page.getByRole('heading', { name: 'Calendar downloaded' })).toBeVisible();
    await expect(page.getByText('Import: Google Calendar → Settings → Import')).toBeVisible();

    await page.getByRole('button', { name: 'Keep editing this schedule' }).click();
    await expect(page.getByRole('heading', { name: 'Calendar downloaded' })).toBeHidden();

    const backupButton = page.getByRole('button', { name: 'Backup' });
    await expect(backupButton).toBeVisible();
    const backupDownload = page.waitForEvent('download');
    await backupButton.click();
    const backup = await backupDownload;
    expect(backup.suggestedFilename()).toBe('neatclock-backup.json');
  });
});
