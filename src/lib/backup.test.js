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

  it('normalizes custom preset tasks on restore', () => {
    const result = validateBackup({
      app: 'NeatClock',
      version: 1,
      tasks: [{ name: 'Main', interval: 1, unit: 'months' }],
      activePreset: 'My Preset',
      customPresets: {
        'My Preset': [{ name: 'Bad', interval: 999, unit: 'invalid' }],
      },
    });
    expect(result.ok).toBe(true);
    expect(result.data.customPresets['My Preset'][0].interval).toBe(120);
    expect(result.data.customPresets['My Preset'][0].unit).toBe('months');
    expect(result.data.activePreset).toBe('My Preset');
  });

  it('filters empty and invalid custom preset names', () => {
    const result = validateBackup({
      app: 'NeatClock',
      version: 1,
      tasks: [{ name: 'Main', interval: 1, unit: 'months' }],
      activePreset: "Homeowner's Sentinel",
      customPresets: {
        '': [{ name: 'A', interval: 1, unit: 'months' }],
        '   ': [{ name: 'B', interval: 1, unit: 'months' }],
        Valid: [{ name: 'C', interval: 1, unit: 'months' }],
        __proto__: [{ name: 'Evil', interval: 1, unit: 'months' }],
      },
    });
    expect(result.ok).toBe(true);
    expect(Object.keys(result.data.customPresets)).toEqual(['Valid']);
  });

  it('accepts backup with unvalidated theme in preferences (App.jsx validates theme)', () => {
    const result = validateBackup({
      app: 'NeatClock',
      version: 1,
      tasks: [{ name: 'Main', interval: 1, unit: 'months' }],
      activePreset: "Homeowner's Sentinel",
      customPresets: {},
      preferences: { theme: 'evil-theme' },
    });
    expect(result.ok).toBe(true);
    expect(result.data.preferences.theme).toBe('evil-theme');
  });

  it('normalizes customPresets array type to empty object', () => {
    const result = validateBackup({
      app: 'NeatClock',
      version: 1,
      tasks: [{ name: 'Main', interval: 1, unit: 'months' }],
      activePreset: "Homeowner's Sentinel",
      customPresets: [{ name: 'Not a preset map' }],
    });
    expect(result.ok).toBe(true);
    expect(result.data.customPresets).toEqual({});
  });

  it('keeps only the first 50 custom presets', () => {
    const customPresets = {};
    for (let i = 0; i < 51; i += 1) {
      customPresets[`Preset ${i}`] = [{ name: `Task ${i}`, interval: 1, unit: 'months' }];
    }

    const result = validateBackup({
      app: 'NeatClock',
      version: 1,
      tasks: [{ name: 'Main', interval: 1, unit: 'months' }],
      activePreset: "Homeowner's Sentinel",
      customPresets,
    });

    expect(result.ok).toBe(true);
    expect(Object.keys(result.data.customPresets)).toHaveLength(50);
    expect(result.data.customPresets['Preset 0']).toHaveLength(1);
    expect(result.data.customPresets['Preset 50']).toBeUndefined();
    expect(result.data.customPresets['Preset 49']).toHaveLength(1);
  });
});
