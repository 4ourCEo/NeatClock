import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PRESETS } from '../config/presets.js';
import * as deepLink from '../lib/deepLink.js';
import {
  loadInitialTasks,
  loadInitialCustomPresets,
  loadInitialActivePreset,
  loadInitialTheme,
  loadInitialShowExportPreview,
  loadInitialStartOffsetWeeks,
  useScheduleBootstrap,
} from './useScheduleBootstrap.js';

vi.mock('../lib/storage.js', () => ({
  storageGet: vi.fn(),
}));

import { storageGet } from '../lib/storage.js';

describe('useScheduleBootstrap loaders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('loadInitialTasks returns normalized tasks from valid storage JSON', () => {
    const raw = [
      { name: '  Filter change  ', interval: '2', unit: 'week' },
      { name: 'Smoke check', interval: 6, unit: 'months' },
    ];
    storageGet.mockImplementation((key) => {
      if (key === 'neatclock_tasks') return JSON.stringify(raw);
      return null;
    });

    const tasks = loadInitialTasks();

    expect(tasks).toHaveLength(2);
    expect(tasks[0].name).toBe('Filter change');
    expect(tasks[0].interval).toBe(2);
    expect(tasks[0].unit).toBe('months');
    expect(tasks[0].id).toBeTruthy();
    expect(tasks[1].unit).toBe('months');
  });

  it('loadInitialTasks falls back to default preset when storage is empty', () => {
    storageGet.mockReturnValue(null);

    const tasks = loadInitialTasks();

    expect(tasks).toEqual(PRESETS["Homeowner's Sentinel"]);
  });

  it('loadInitialTasks applies deep link preset when storage is empty', () => {
    storageGet.mockReturnValue(null);
    vi.spyOn(deepLink, 'getDeepLinkBootstrap').mockReturnValue({
      presetParam: 'gearhead',
      presetName: 'Preventive Gearhead',
      fresh: false,
    });

    const tasks = loadInitialTasks();

    expect(tasks).toEqual(PRESETS['Preventive Gearhead']);
  });

  it('loadInitialActivePreset applies deep link preset when storage is empty', () => {
    storageGet.mockReturnValue(null);
    vi.spyOn(deepLink, 'getDeepLinkBootstrap').mockReturnValue({
      presetParam: 'cfo',
      presetName: 'Automated CFO',
      fresh: false,
    });

    expect(loadInitialActivePreset()).toBe('Automated CFO');
  });

  it('loadInitialCustomPresets applies normalizeCustomPresets to corrupt entries', () => {
    const corrupt = {
      'My Preset': [{ name: 'Oil', interval: 'bad', unit: 'weeks' }],
      constructor: [{ name: 'ignored' }],
      'Broken Preset': null,
      '': [{ name: 'empty key' }],
    };
    storageGet.mockImplementation((key) => {
      if (key === 'neatclock_custom_presets') return JSON.stringify(corrupt);
      return null;
    });

    const presets = loadInitialCustomPresets();

    expect(presets).toHaveProperty('My Preset');
    expect(presets['My Preset'][0].interval).toBe(1);
    expect(presets['My Preset'][0].unit).toBe('weeks');
    expect(presets).toHaveProperty('Broken Preset');
    expect(presets['Broken Preset']).toEqual([]);
    expect(presets).not.toHaveProperty('constructor');
    expect(Object.keys(presets)).not.toContain('');
  });

  it('loadInitialCustomPresets returns {} when JSON is invalid', () => {
    storageGet.mockImplementation((key) => {
      if (key === 'neatclock_custom_presets') return '{not-json';
      return null;
    });

    expect(loadInitialCustomPresets()).toEqual({});
  });

  it('loadInitialActivePreset resolves custom preset after normalizing corrupt storage', () => {
    const corrupt = {
      'Garage List': [{ name: 'Tires', interval: 6, unit: 'months' }],
      prototype: [],
    };
    storageGet.mockImplementation((key) => {
      if (key === 'neatclock_custom_presets') return JSON.stringify(corrupt);
      if (key === 'neatclock_active_preset') return 'Garage List';
      return null;
    });

    expect(loadInitialActivePreset()).toBe('Garage List');
  });

  it('loadInitialTheme falls back when stored theme is invalid', () => {
    storageGet.mockImplementation((key) => {
      if (key === 'neatclock_theme') return 'theme-not-real';
      if (key === 'neatclock_dark_mode') return null;
      return null;
    });

    expect(loadInitialTheme()).toBe('theme-warm-sand');
  });

  it('loadInitialTheme honors legacy dark mode when theme key is invalid', () => {
    storageGet.mockImplementation((key) => {
      if (key === 'neatclock_theme') return 'bogus';
      if (key === 'neatclock_dark_mode') return 'true';
      return null;
    });

    expect(loadInitialTheme()).toBe('theme-obsidian');
  });

  it('loadInitialShowExportPreview reads persisted preference', () => {
    storageGet.mockImplementation((key) => {
      if (key === 'neatclock_show_export_preview') return 'false';
      return null;
    });

    expect(loadInitialShowExportPreview()).toBe(false);
  });

  it('loadInitialStartOffsetWeeks clamps out-of-range values', () => {
    storageGet.mockImplementation((key) => {
      if (key === 'neatclock_start_offset') return '99';
      return null;
    });

    expect(loadInitialStartOffsetWeeks()).toBe(12);
  });

  it('useScheduleBootstrap exposes all loader functions', () => {
    const bootstrap = useScheduleBootstrap();

    expect(bootstrap.initialTasks).toBe(loadInitialTasks);
    expect(bootstrap.initialCustomPresets).toBe(loadInitialCustomPresets);
    expect(bootstrap.initialActivePreset).toBe(loadInitialActivePreset);
    expect(bootstrap.initialTheme).toBe(loadInitialTheme);
    expect(bootstrap.initialShowExportPreview).toBe(loadInitialShowExportPreview);
    expect(bootstrap.initialStartOffsetWeeks).toBe(loadInitialStartOffsetWeeks);
  });
});
