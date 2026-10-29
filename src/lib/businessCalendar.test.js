import { describe, expect, it } from 'vitest';
import { PRESETS } from '../config/presets.js';
import { BUSINESS_INDUSTRIES, buildBusinessShareUrl, businessBrandFromSearch, normalizeBusinessBrand } from './businessCalendar.js';

describe('NeatClock Business calendars', () => {
  it('provides distinct HVAC and plumbing schedules', () => {
    expect(PRESETS[BUSINESS_INDUSTRIES.hvac.preset].map((task) => task.name)).toContain('Replace HVAC air filter');
    expect(PRESETS[BUSINESS_INDUSTRIES.plumbing.preset].map((task) => task.name)).toContain('Flush water heater');
    expect(PRESETS[BUSINESS_INDUSTRIES.hvac.preset]).not.toEqual(PRESETS[BUSINESS_INDUSTRIES.plumbing.preset]);
  });

  it('creates an encoded customer link with business branding and industry preset', () => {
    const link = new URL(buildBusinessShareUrl({
      origin: 'https://preview.example',
      industry: 'plumbing',
      brand: { brandName: 'North & Main Plumbing', brandPhone: '555-0100', brandColor: '#234567' },
    }));
    expect(link.searchParams.get('preset')).toBe('plumbing-business');
    expect(link.searchParams.has('fresh')).toBe(false);
    expect(link.searchParams.get('brandName')).toBe('North & Main Plumbing');
    expect(link.searchParams.get('brandPhone')).toBe('555-0100');
    expect(link.searchParams.get('brandColor')).toBe('234567');
  });

  it('rejects unknown industries and safely drops invalid public contact URLs', () => {
    expect(() => buildBusinessShareUrl({ origin: 'https://preview.example', industry: 'electric', brand: { brandName: 'Test' } })).toThrow('Choose HVAC or plumbing');
    expect(normalizeBusinessBrand({ brandName: 'Test', brandLogo: 'javascript:alert(1)', brandEmail: 'not-an-email' })).toMatchObject({ brandLogo: '', brandEmail: '' });
  });

  it('keeps maximum accepted branding short enough for a QR code', async () => {
    const { default: QRCode } = await import('qrcode');
    const brand = normalizeBusinessBrand({
      brandName: 'N'.repeat(60), brandLogo: `https://x.example/${'l'.repeat(230)}`,
      brandPhone: '5'.repeat(24), brandEmail: `${'e'.repeat(65)}@example.com`,
      brandWeb: `https://x.example/${'w'.repeat(100)}`,
    });
    const url = buildBusinessShareUrl({ origin: 'https://neatclock.pro', industry: 'hvac', brand });
    await expect(QRCode.toDataURL(url, { errorCorrectionLevel: 'M' })).resolves.toMatch(/^data:image\/png/);
  });

  it('reads business branding for calendar export only from a business share link', () => {
    expect(businessBrandFromSearch('?preset=hvac-business&brandName=North+Heating&brandPhone=555-0100')).toMatchObject({ brandName: 'North Heating', brandPhone: '555-0100' });
    expect(businessBrandFromSearch('?preset=gearhead&brandName=North+Heating')).toBeNull();
  });
});
