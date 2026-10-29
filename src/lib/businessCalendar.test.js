import { describe, expect, it } from 'vitest';
import { PRESETS } from '../config/presets.js';
import { BUSINESS_INDUSTRIES, buildBusinessShareUrl, normalizeBusinessBrand } from './businessCalendar.js';

describe('NeatClock Business calendars', () => {
  it('provides distinct HVAC and plumbing schedules', () => {
    expect(PRESETS[BUSINESS_INDUSTRIES.hvac.preset].map((task) => task.name)).toContain('Replace HVAC air filter');
    expect(PRESETS[BUSINESS_INDUSTRIES.plumbing.preset].map((task) => task.name)).toContain('Flush water heater');
    expect(PRESETS[BUSINESS_INDUSTRIES.hvac.preset]).not.toEqual(PRESETS[BUSINESS_INDUSTRIES.plumbing.preset]);
  });

  it('creates an encoded, fresh customer link with business branding and industry preset', () => {
    const link = new URL(buildBusinessShareUrl({
      origin: 'https://preview.example',
      industry: 'plumbing',
      brand: { brandName: 'North & Main Plumbing', brandPhone: '555-0100', brandColor: '#234567' },
    }));
    expect(link.searchParams.get('preset')).toBe('plumbing-business');
    expect(link.searchParams.get('fresh')).toBe('1');
    expect(link.searchParams.get('brandName')).toBe('North & Main Plumbing');
    expect(link.searchParams.get('brandPhone')).toBe('555-0100');
    expect(link.searchParams.get('brandColor')).toBe('234567');
  });

  it('rejects unknown industries and safely drops invalid public contact URLs', () => {
    expect(() => buildBusinessShareUrl({ origin: 'https://preview.example', industry: 'electric', brand: { brandName: 'Test' } })).toThrow('Choose HVAC or plumbing');
    expect(normalizeBusinessBrand({ brandName: 'Test', brandLogo: 'javascript:alert(1)', brandEmail: 'not-an-email' })).toMatchObject({ brandLogo: '', brandEmail: '' });
  });
});
