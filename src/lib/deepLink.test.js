import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  PRESET_DEEP_LINKS,
  parseDeepLinkParams,
  shouldApplyDeepLink,
  hasSavedTasks,
} from './deepLink.js';

vi.mock('./storage.js', () => ({
  storageGet: vi.fn(),
}));

import { storageGet } from './storage.js';

describe('deepLink', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    storageGet.mockReturnValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('maps URL preset slugs to built-in preset names', () => {
    expect(PRESET_DEEP_LINKS.home).toBe("Homeowner's Sentinel");
    expect(PRESET_DEEP_LINKS.gearhead).toBe('Preventive Gearhead');
    expect(PRESET_DEEP_LINKS.cfo).toBe('Automated CFO');
  });

  it('parseDeepLinkParams returns null for missing or unknown preset', () => {
    expect(parseDeepLinkParams('')).toBeNull();
    expect(parseDeepLinkParams('?preset=unknown')).toBeNull();
  });

  it('parseDeepLinkParams resolves preset and fresh flag', () => {
    expect(parseDeepLinkParams('?preset=gearhead')).toEqual({
      presetParam: 'gearhead',
      presetName: 'Preventive Gearhead',
      fresh: false,
    });
    expect(parseDeepLinkParams('?preset=CFO&fresh=1')).toEqual({
      presetParam: 'cfo',
      presetName: 'Automated CFO',
      fresh: true,
    });
  });

  it('hasSavedTasks is false when storage is empty or invalid', () => {
    storageGet.mockReturnValue(null);
    expect(hasSavedTasks()).toBe(false);

    storageGet.mockReturnValue('[]');
    expect(hasSavedTasks()).toBe(false);

    storageGet.mockReturnValue('{bad');
    expect(hasSavedTasks()).toBe(false);
  });

  it('hasSavedTasks is true when saved tasks exist', () => {
    storageGet.mockReturnValue(JSON.stringify([{ name: 'Oil', interval: 6, unit: 'months' }]));
    expect(hasSavedTasks()).toBe(true);
  });

  it('shouldApplyDeepLink applies when no saved tasks', () => {
    storageGet.mockReturnValue(null);
    expect(shouldApplyDeepLink(parseDeepLinkParams('?preset=home'))).toBe(true);
  });

  it('shouldApplyDeepLink skips when saved tasks exist unless fresh=1', () => {
    storageGet.mockImplementation((key) => {
      if (key === 'neatclock_tasks') {
        return JSON.stringify([{ name: 'Custom', interval: 1, unit: 'months' }]);
      }
      return null;
    });

    expect(shouldApplyDeepLink(parseDeepLinkParams('?preset=gearhead'))).toBe(false);
    expect(shouldApplyDeepLink(parseDeepLinkParams('?preset=gearhead&fresh=1'))).toBe(true);
  });
});
