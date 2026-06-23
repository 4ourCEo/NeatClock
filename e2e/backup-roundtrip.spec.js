import { test, expect } from '@playwright/test';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

test.describe('backup roundtrip', () => {
  test('restores edited task name after export, clear, and import', async ({ page }) => {
    const editedName = 'E2E Roundtrip Restored Task';

    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    const firstTaskInput = page
      .getByRole('row')
      .filter({ has: page.getByRole('textbox') })
      .first()
      .getByRole('textbox')
      .first();
    await firstTaskInput.fill(editedName);
    await expect(firstTaskInput).toHaveValue(editedName);
    await page.waitForFunction(
      (name) => localStorage.getItem('neatclock_tasks')?.includes(name),
      editedName,
      { timeout: 2000 }
    );

    const backupDownload = page.waitForEvent('download');
    await page.getByRole('button', { name: 'Backup', exact: true }).click();
    const download = await backupDownload;
    expect(download.suggestedFilename()).toBe('neatclock-backup.json');

    const backupPath = path.join(os.tmpdir(), `neatclock-backup-${Date.now()}.json`);
    await download.saveAs(backupPath);

    await page.evaluate(() => localStorage.clear());
    await page.waitForTimeout(400);
    await page.reload();
    await page.waitForLoadState('networkidle');

    const restoredTaskInput = page
      .getByRole('row')
      .filter({ has: page.getByRole('textbox') })
      .first()
      .getByRole('textbox')
      .first();
    await expect(restoredTaskInput).toHaveValue('HVAC Filter Replacement');

    await page.getByRole('button', { name: 'Restore', exact: true }).click();
    await page.locator('input[type="file"]').setInputFiles(backupPath);

    const restoreModal = page.getByRole('dialog').filter({ hasText: 'Restore backup?' });
    await expect(restoreModal).toBeVisible();
    await restoreModal.getByRole('button', { name: 'Confirm' }).click();

    await expect(restoredTaskInput).toHaveValue(editedName);

    fs.unlinkSync(backupPath);
  });
});
