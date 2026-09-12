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

  it('labels every generated Amazon link as an affiliate link, in-line with the URL', async () => {
    vi.stubEnv('VITE_AMAZON_AFFILIATE_TAG', 'my-tag-20');
    const { AFFILIATE_DISCLOSURE_LABEL, getAffiliateHint } = await import('./affiliateHints.js');
    const result = getAffiliateHint('HVAC Filter Replacement');
    expect(result.endsWith(AFFILIATE_DISCLOSURE_LABEL)).toBe(true);
  });

  it('does not label hints that carry no Amazon link (no matching searchMap entry)', async () => {
    vi.stubEnv('VITE_AMAZON_AFFILIATE_TAG', 'my-tag-20');
    const { AFFILIATE_DISCLOSURE_LABEL, getAffiliateHint } = await import('./affiliateHints.js');
    const result = getAffiliateHint('Quarterly Estimated Taxes');
    expect(result).not.toContain(AFFILIATE_DISCLOSURE_LABEL);
    expect(result).not.toContain('amazon.com');
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

  it('returns smoke detector hint with tip only when no affiliate tag', async () => {
    vi.stubEnv('VITE_AMAZON_AFFILIATE_TAG', '');
    const { getAffiliateHint } = await import('./affiliateHints.js');
    expect(getAffiliateHint('Smoke Detector Battery Check')).toBe(
      'Tip: test monthly, replace batteries annually, replace units every 10 years.'
    );
  });

  it('returns smoke detector hint with Amazon link when affiliate tag is set', async () => {
    vi.stubEnv('VITE_AMAZON_AFFILIATE_TAG', 'my-tag-20');
    const { getAffiliateHint } = await import('./affiliateHints.js');
    const result = getAffiliateHint('Smoke Detector Battery Check');
    expect(result).toContain('Tip: test monthly, replace batteries annually, replace units every 10 years.');
    expect(result).toContain('https://www.amazon.com/s?k=smoke%20detector%2010%20year%20battery&tag=my-tag-20');
  });

  it('returns tire rotation hint with tip only when no affiliate tag', async () => {
    vi.stubEnv('VITE_AMAZON_AFFILIATE_TAG', '');
    const { getAffiliateHint } = await import('./affiliateHints.js');
    expect(getAffiliateHint('Tire Rotation and Alignment')).toBe(
      'Tip: rotate every 5,000–8,000 miles to extend tire life.'
    );
  });

  it('returns tire rotation hint with Amazon link when affiliate tag is set', async () => {
    vi.stubEnv('VITE_AMAZON_AFFILIATE_TAG', 'my-tag-20');
    const { getAffiliateHint } = await import('./affiliateHints.js');
    const result = getAffiliateHint('Tire Rotation and Alignment');
    expect(result).toContain('Tip: rotate every 5,000–8,000 miles to extend tire life.');
    expect(result).toContain('https://www.amazon.com/s?k=tire%20jack%20car&tag=my-tag-20');
  });

  it('returns gutter cleaning hint with tip only when no affiliate tag', async () => {
    vi.stubEnv('VITE_AMAZON_AFFILIATE_TAG', '');
    const { getAffiliateHint } = await import('./affiliateHints.js');
    expect(getAffiliateHint('Gutter Cleaning')).toBe(
      'Tip: clean gutters twice yearly (spring and fall) to prevent water damage.'
    );
  });

  it('returns gutter cleaning hint with Amazon link when affiliate tag is set', async () => {
    vi.stubEnv('VITE_AMAZON_AFFILIATE_TAG', 'my-tag-20');
    const { getAffiliateHint } = await import('./affiliateHints.js');
    const result = getAffiliateHint('Gutter Cleaning');
    expect(result).toContain('Tip: clean gutters twice yearly (spring and fall) to prevent water damage.');
    expect(result).toContain('https://www.amazon.com/s?k=gutter%20cleaning%20tool&tag=my-tag-20');
  });
});
