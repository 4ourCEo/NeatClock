import { afterEach, describe, expect, it, vi } from 'vitest';
import { trackEvent } from './analytics.js';

describe('trackEvent', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('does nothing when window.goatcounter is not available', () => {
    vi.stubGlobal('window', {});
    expect(() => trackEvent('ics_export')).not.toThrow();
  });

  it('does nothing when window.goatcounter.count is not a function', () => {
    vi.stubGlobal('window', { goatcounter: {} });
    expect(() => trackEvent('ics_export')).not.toThrow();
  });

  it('calls goatcounter.count with path and event:true when no props', () => {
    const count = vi.fn();
    vi.stubGlobal('window', { goatcounter: { count } });
    trackEvent('ics_export');
    expect(count).toHaveBeenCalledWith({ path: 'ics_export', event: true });
  });

  it('calls goatcounter.count with path and event:true when props object is empty', () => {
    const count = vi.fn();
    vi.stubGlobal('window', { goatcounter: { count } });
    trackEvent('ics_export', {});
    expect(count).toHaveBeenCalledWith({ path: 'ics_export', event: true });
  });

  it('calls goatcounter.count with props encoded in title when props are given', () => {
    const count = vi.fn();
    vi.stubGlobal('window', { goatcounter: { count } });
    trackEvent('ics_export', { preset: 'Homeowner' });
    expect(count).toHaveBeenCalledWith({
      path: 'ics_export',
      event: true,
      title: 'preset:Homeowner'
    });
  });

  it('encodes multiple props into title with space separation', () => {
    const count = vi.fn();
    vi.stubGlobal('window', { goatcounter: { count } });
    trackEvent('landing_cta', { campaign: 'home_maintenance', source: 'seo' });
    expect(count).toHaveBeenCalledWith({
      path: 'landing_cta',
      event: true,
      title: 'campaign:home_maintenance source:seo'
    });
  });
});
