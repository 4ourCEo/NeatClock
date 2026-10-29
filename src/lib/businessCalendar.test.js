import { describe, expect, it } from 'vitest';
import { PRESETS } from '../config/presets.js';
import { BUSINESS_INDUSTRIES, buildBusinessShareUrl, businessBrandFromSearch, businessIdForSearch, businessIdFromSearch, createBusinessIdentityId, normalizeBusinessBrand } from './businessCalendar.js';

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
      businessId: 'b8a1c7d2-4f65-4cc3-a239-01c0ef89a112',
      brand: { brandName: 'North & Main Plumbing', brandPhone: '555-0100', brandColor: '#234567' },
    }));
    expect(link.searchParams.get('preset')).toBe('plumbing-business');
    expect(link.searchParams.get('business_id')).toBe('b8a1c7d2-4f65-4cc3-a239-01c0ef89a112');
    expect(link.searchParams.has('fresh')).toBe(false);
    expect(link.searchParams.get('brandName')).toBe('North & Main Plumbing');
    expect(link.searchParams.get('brandPhone')).toBe('555-0100');
    expect(link.searchParams.get('brandColor')).toBe('234567');
  });

  it('rejects unknown industries and safely drops invalid public contact URLs', () => {
    expect(() => buildBusinessShareUrl({ origin: 'https://preview.example', industry: 'electric', brand: { brandName: 'Test' }, businessId: 'b8a1c7d2-4f65-4cc3-a239-01c0ef89a112' })).toThrow('Choose HVAC or plumbing');
    expect(normalizeBusinessBrand({ brandName: 'Test', brandLogo: 'javascript:alert(1)', brandEmail: 'not-an-email' })).toMatchObject({ brandLogo: '', brandEmail: '' });
  });

  it('keeps maximum accepted branding short enough for a QR code', async () => {
    const { default: QRCode } = await import('qrcode');
    const brand = normalizeBusinessBrand({
      brandName: 'N'.repeat(60), brandLogo: `https://x.example/${'l'.repeat(230)}`,
      brandPhone: '5'.repeat(24), brandEmail: `${'e'.repeat(65)}@example.com`,
      brandWeb: `https://x.example/${'w'.repeat(100)}`,
    });
    const url = buildBusinessShareUrl({ origin: 'https://neatclock.pro', industry: 'hvac', brand, businessId: 'b8a1c7d2-4f65-4cc3-a239-01c0ef89a112' });
    await expect(QRCode.toDataURL(url, { errorCorrectionLevel: 'M' })).resolves.toMatch(/^data:image\/png/);
  });

  it('reads business branding for calendar export only from a business share link', () => {
    expect(businessBrandFromSearch('?preset=hvac-business&brandName=North+Heating&brandPhone=555-0100')).toMatchObject({ brandName: 'North Heating', brandPhone: '555-0100' });
    expect(businessBrandFromSearch('?preset=gearhead&brandName=North+Heating')).toBeNull();
    expect(businessIdFromSearch('?business_id=b8a1c7d2-4f65-4cc3-a239-01c0ef89a112')).toBe('b8a1c7d2-4f65-4cc3-a239-01c0ef89a112');
  });

  it('derives stable, distinct identities when business details change in the same browser', () => {
    const first = createBusinessIdentityId({ brandName: 'North Heating', brandPhone: '555-0100' }, 'hvac');
    const same = createBusinessIdentityId({ brandName: 'North Heating', brandPhone: '5550100' }, 'hvac');
    const second = createBusinessIdentityId({ brandName: 'South Heating', brandPhone: '555-0200' }, 'hvac');
    expect(first).toMatch(/^[0-9a-f]{32}$/);
    expect(same).toBe(first);
    expect(second).not.toBe(first);
  });

  it('assigns distinct deterministic identities to older share links without business_id', () => {
    const north = businessIdForSearch('?preset=hvac-business&brandName=North+Heating');
    const south = businessIdForSearch('?preset=hvac-business&brandName=South+Heating');
    expect(north).not.toBeNull();
    expect(south).not.toBe(north);
    expect(businessIdForSearch('?preset=hvac-business&brandName=North+Heating')).toBe(north);
  });
});
