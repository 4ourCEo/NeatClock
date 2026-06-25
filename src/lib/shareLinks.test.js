import { describe, expect, it } from 'vitest';
import { buildPresetShareUrl, presetShareSlug } from './shareLinks.js';

describe('shareLinks', () => {
  it('maps preset names to slugs', () => {
    expect(presetShareSlug("Homeowner's Sentinel")).toBe('home');
    expect(presetShareSlug('Preventive Gearhead')).toBe('gearhead');
  });

  it('builds share URL with UTM params', () => {
    const url = buildPresetShareUrl('Preventive Gearhead', {
      origin: 'https://neatclock.pro',
      medium: 'share',
      campaign: 'gearhead',
    });
    expect(url).toContain('preset=gearhead');
    expect(url).toContain('utm_source=neatclock');
    expect(url).toContain('utm_medium=share');
  });
});
