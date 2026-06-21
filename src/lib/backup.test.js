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

  it('normalizes tasks and active preset', () => {
    const payload = createBackupPayload({
      tasks: [{ name: 'Test', interval: 999, unit: 'invalid' }],
      activePreset: 'home-sentinel',
      customPresets: {},
      theme: 'theme-warm-sand',
      showExportPreview: true,
      startOffsetWeeks: 0,
    });
    const result = validateBackup(payload);
    expect(result.ok).toBe(true);
    expect(result.data.tasks[0].interval).toBe(120);
    expect(result.data.tasks[0].unit).toBe('months');
    expect(result.data.activePreset).toBe("Homeowner's Sentinel");
  });

  it('rejects invalid backups', () => {
    expect(validateBackup(null).ok).toBe(false);
    expect(validateBackup({ app: 'Other' }).ok).toBe(false);
  });
});
