import { afterEach, describe, expect, it, vi } from 'vitest';

describe('getAffiliateHint', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('returns base hint only if VITE_AMAZON_AFFILIATE_TAG is empty', async () => {
    vi.stubEnv('VITE_AMAZON_AFFILIATE_TAG', '');
    const { getAffiliateHint } = await import('./affiliateHints.js');
    expect(getAffiliateHint('HVAC Filter Replacement')).toBe('Tip: note your filter size before ordering.');
  });

  it('returns query link with tag when VITE_AMAZON_AFFILIATE_TAG is set', async () => {
    vi.stubEnv('VITE_AMAZON_AFFILIATE_TAG', 'my-tag-20');
    const { getAffiliateHint } = await import('./affiliateHints.js');
    const result = getAffiliateHint('HVAC Filter Replacement');
    expect(result).toContain('Tip: note your filter size before ordering.');
    expect(result).toContain('https://www.amazon.com/s?k=HVAC%20air%20filter&tag=my-tag-20');
  });

  it('supports case-insensitive partial match on task names', async () => {
    vi.stubEnv('VITE_AMAZON_AFFILIATE_TAG', 'my-tag-20');
    const { getAffiliateHint } = await import('./affiliateHints.js');
    const result = getAffiliateHint('Routine hvac filter replacement in basement');
    expect(result).toContain('Tip: note your filter size before ordering.');
    expect(result).toContain('https://www.amazon.com/s?k=HVAC%20air%20filter&tag=my-tag-20');
  });

  it('parses dimensions (e.g. 16x25x1) and prepends to search term', async () => {
    vi.stubEnv('VITE_AMAZON_AFFILIATE_TAG', 'my-tag-20');
    const { getAffiliateHint } = await import('./affiliateHints.js');
    const result = getAffiliateHint('HVAC Filter Replacement (16x25x1)');
    expect(result).toContain('https://www.amazon.com/s?k=16x25x1%20HVAC%20air%20filter&tag=my-tag-20');
  });

  it('parses oil viscosity (e.g. 5W-30) and prepends to search term', async () => {
    vi.stubEnv('VITE_AMAZON_AFFILIATE_TAG', 'my-tag-20');
    const { getAffiliateHint } = await import('./affiliateHints.js');
    const result = getAffiliateHint('Engine Oil Change (5W-30)');
    expect(result).toContain('https://www.amazon.com/s?k=5W-30%20motor%20oil&tag=my-tag-20');
  });
});
