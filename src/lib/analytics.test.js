import { afterEach, describe, expect, it, vi } from 'vitest';
import { trackEvent } from './analytics.js';

describe('trackEvent', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('does nothing when window.plausible is not a function', () => {
    vi.stubGlobal('window', {});
    expect(() => trackEvent('ics_export')).not.toThrow();
  });

  it('calls plausible without props when none are given', () => {
    const plausible = vi.fn();
    vi.stubGlobal('window', { plausible });
    trackEvent('ics_export');
    expect(plausible).toHaveBeenCalledWith('ics_export');
  });

  it('calls plausible without props when props object is empty', () => {
    const plausible = vi.fn();
    vi.stubGlobal('window', { plausible });
    trackEvent('ics_export', {});
    expect(plausible).toHaveBeenCalledWith('ics_export');
  });

  it('calls plausible with wrapped props when props are given', () => {
    const plausible = vi.fn();
    vi.stubGlobal('window', { plausible });
    trackEvent('ics_export', { preset: 'Homeowner' });
    expect(plausible).toHaveBeenCalledWith('ics_export', { props: { preset: 'Homeowner' } });
  });
});
