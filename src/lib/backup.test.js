import { describe, expect, it } from 'vitest';
import { createBackupPayload, validateBackup } from './backup.js';

describe('backup', () => {
  it('creates a versioned payload', () => {
    const payload = createBackupPayload({
      tasks: [{ id: '1', name: 'Test', interval: 1, unit: 'months' }],
      activePreset: 'Home',
      customPresets: {},
      theme: 'theme-warm-sand',
      showExportPreview: false,
      startOffsetWeeks: 2,
    });
    expect(payload.app).toBe('NeatClock');
    expect(payload.version).toBe(1);
    expect(payload.preferences.startOffsetWeeks).toBe(2);
  });

  it('validates good backups', () => {
    const payload = createBackupPayload({
      tasks: [],
      activePreset: 'Home',
      customPresets: {},
      theme: 'theme-warm-sand',
      showExportPreview: true,
      startOffsetWeeks: 0,
    });
    expect(validateBackup(payload).ok).toBe(true);
  });

  it('rejects invalid backups', () => {
    expect(validateBackup(null).ok).toBe(false);
    expect(validateBackup({ app: 'Other' }).ok).toBe(false);
  });
});
