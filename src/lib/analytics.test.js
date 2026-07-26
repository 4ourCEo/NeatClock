import { afterEach, describe, expect, it, vi } from 'vitest';
import { trackEvent } from './analytics.js';

describe('trackEvent', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('does nothing when window.plausible is not a function', () => {
    vi.stubGlobal('window', {});
    expect(() => trackEvent('export_ics')).not.toThrow();
  });

  it('calls plausible without props when none are given', () => {
    const plausible = vi.fn();
    vi.stubGlobal('window', { plausible });
    trackEvent('export_ics');
    expect(plausible).toHaveBeenCalledWith('export_ics');
  });

  it('calls plausible without props when props object is empty', () => {
    const plausible = vi.fn();
    vi.stubGlobal('window', { plausible });
    trackEvent('export_ics', {});
    expect(plausible).toHaveBeenCalledWith('export_ics');
  });

  it('calls plausible with wrapped props when props are given', () => {
    const plausible = vi.fn();
    vi.stubGlobal('window', { plausible });
    trackEvent('export_ics', { preset: 'Homeowner' });
    expect(plausible).toHaveBeenCalledWith('export_ics', { props: { preset: 'Homeowner' } });
  });
});
