import { afterEach, describe, expect, it, vi } from 'vitest';
import { storageGet, storageRemove, storageSet, persistState } from './storage.js';

function createLocalStorageMock(initial = {}) {
  const store = { ...initial };
  return {
    getItem: vi.fn((key) => (key in store ? store[key] : null)),
    setItem: vi.fn((key, value) => {
      store[key] = String(value);
    }),
    removeItem: vi.fn((key) => {
      delete store[key];
    }),
    _store: store,
  };
}

describe('storage', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('storageSet returns false when setItem throws', () => {
    const localStorage = createLocalStorageMock();
    const quotaError = new DOMException('Quota exceeded', 'QuotaExceededError');
    localStorage.setItem.mockImplementation(() => {
      throw quotaError;
    });
    vi.stubGlobal('localStorage', localStorage);

    expect(storageSet('neatclock_tasks', '[]')).toBe(false);
  });

  it('storageGet returns fallback when getItem throws', () => {
    const localStorage = createLocalStorageMock();
    localStorage.getItem.mockImplementation(() => {
      throw new Error('SecurityError');
    });
    vi.stubGlobal('localStorage', localStorage);

    expect(storageGet('neatclock_theme', 'theme-warm-sand')).toBe('theme-warm-sand');
  });

  it('storageRemove returns false on error', () => {
    const localStorage = createLocalStorageMock({ 'neatclock_dark_mode': 'true' });
    localStorage.removeItem.mockImplementation(() => {
      throw new Error('remove failed');
    });
    vi.stubGlobal('localStorage', localStorage);

    expect(storageRemove('neatclock_dark_mode')).toBe(false);
  });

  it('storageGet returns stored value when available', () => {
    const localStorage = createLocalStorageMock({ neatclock_theme: 'theme-obsidian' });
    vi.stubGlobal('localStorage', localStorage);

    expect(storageGet('neatclock_theme')).toBe('theme-obsidian');
  });

  it('storageSet returns true on success', () => {
    const localStorage = createLocalStorageMock();
    vi.stubGlobal('localStorage', localStorage);

    expect(storageSet('neatclock_theme', 'theme-sage-garden')).toBe(true);
    expect(localStorage._store.neatclock_theme).toBe('theme-sage-garden');
  });

  it('persistState invokes onFailure when setItem throws', () => {
    const localStorage = createLocalStorageMock();
    localStorage.setItem.mockImplementation(() => {
      throw new DOMException('Quota exceeded', 'QuotaExceededError');
    });
    vi.stubGlobal('localStorage', localStorage);

    const onFailure = vi.fn();
    expect(persistState('neatclock_tasks', '[]', onFailure)).toBe(false);
    expect(onFailure).toHaveBeenCalledOnce();
  });
});
