import { afterEach, describe, expect, it, vi } from 'vitest';
import { isMonetizationPreview, shouldShowMonetization } from './preview.js';

describe('isMonetizationPreview', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('is false when window is undefined', () => {
    expect(isMonetizationPreview()).toBe(false);
  });

  it('is false when the preview query param is absent', () => {
    vi.stubGlobal('window', { location: { search: '' } });
    expect(isMonetizationPreview()).toBe(false);
  });

  it('is false when the preview query param has a different value', () => {
    vi.stubGlobal('window', { location: { search: '?preview=themes' } });
    expect(isMonetizationPreview()).toBe(false);
  });

  it('is true when ?preview=monetization is set', () => {
    vi.stubGlobal('window', { location: { search: '?preview=monetization' } });
    expect(isMonetizationPreview()).toBe(true);
  });
});

describe('shouldShowMonetization', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('is true when enabled flag is true, regardless of preview', () => {
    expect(shouldShowMonetization(true)).toBe(true);
  });

  it('is false when disabled and not previewing', () => {
    expect(shouldShowMonetization(false)).toBe(false);
  });

  it('is true when disabled but owner preview query param is set', () => {
    vi.stubGlobal('window', { location: { search: '?preview=monetization' } });
    expect(shouldShowMonetization(false)).toBe(true);
  });
});
