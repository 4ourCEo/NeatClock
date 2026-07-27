// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('../lib/storage.js', () => ({
  storageGet: vi.fn(),
}));

import { storageGet } from '../lib/storage.js';
import { loadInitialTheme } from './useScheduleBootstrap.js';

function stubMatchMedia(matches) {
  vi.stubGlobal('matchMedia', vi.fn().mockImplementation((query) => ({
    matches,
    media: query,
  })));
}

describe('loadInitialTheme — OS dark-mode preference (jsdom)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('uses obsidian for a first-time visitor whose OS prefers dark mode', () => {
    storageGet.mockReturnValue(null);
    stubMatchMedia(true);

    expect(loadInitialTheme()).toBe('theme-obsidian');
  });

  it('uses warm sand for a first-time visitor whose OS does not prefer dark mode', () => {
    storageGet.mockReturnValue(null);
    stubMatchMedia(false);

    expect(loadInitialTheme()).toBe('theme-warm-sand');
  });

  it('a saved theme still wins over OS dark-mode preference', () => {
    storageGet.mockImplementation((key) => (key === 'neatclock_theme' ? 'theme-blush-linen' : null));
    stubMatchMedia(true);

    expect(loadInitialTheme()).toBe('theme-blush-linen');
  });
});
