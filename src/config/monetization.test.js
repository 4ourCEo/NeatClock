import { afterEach, describe, expect, it, vi } from 'vitest';

describe('monetization', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
    vi.doUnmock('./features.js');
    vi.doUnmock('../lib/preview.js');
    vi.doUnmock('./interestEndpoint.js');
  });

  it('getPrintProductForPreset matches by preset name', async () => {
    const { getPrintProductForPreset, printProducts } = await import('./monetization.js');
    expect(getPrintProductForPreset('Preventive Gearhead').id).toBe('prints-gearhead');
    expect(getPrintProductForPreset('Automated CFO').id).toBe('prints-cfo');
    expect(printProducts.map((p) => p.id)).toContain('prints-bundle');
  });

  it('print products have expected Gumroad URLs', async () => {
    vi.stubEnv('VITE_PRINTS_HOME_URL', 'https://gorillamotors.gumroad.com/l/oikeyi');
    vi.stubEnv('VITE_PRINTS_CAR_URL', 'https://gorillamotors.gumroad.com/l/undcqo');
    vi.stubEnv('VITE_PRINTS_CFO_URL', 'https://gorillamotors.gumroad.com/l/zdwmy');
    vi.stubEnv('VITE_PRINTS_BUNDLE_URL', 'https://gorillamotors.gumroad.com/l/qyyoe');
    const { printProducts } = await import('./monetization.js');
    
    const homeProduct = printProducts.find((p) => p.id === 'prints-homeowner');
    const carProduct = printProducts.find((p) => p.id === 'prints-gearhead');
    const cfoProduct = printProducts.find((p) => p.id === 'prints-cfo');
    const bundleProduct = printProducts.find((p) => p.id === 'prints-bundle');
    
    expect(homeProduct.url).toBe('https://gorillamotors.gumroad.com/l/oikeyi');
    expect(carProduct.url).toBe('https://gorillamotors.gumroad.com/l/undcqo');
    expect(cfoProduct.url).toBe('https://gorillamotors.gumroad.com/l/zdwmy');
    expect(bundleProduct.url).toBe('https://gorillamotors.gumroad.com/l/qyyoe');
  });

  it('getPrintProductForPreset falls back to the first product for an unknown preset', async () => {
    const { getPrintProductForPreset, printProducts } = await import('./monetization.js');
    expect(getPrintProductForPreset('Nonexistent')).toBe(printProducts[0]);
  });

  it('getAvailableThemes returns only free themes when premium is disabled and not previewing', async () => {
    vi.doMock('./features.js', () => ({ features: { premiumThemes: false } }));
    vi.doMock('../lib/preview.js', () => ({ shouldShowMonetization: (enabled) => enabled }));
    const { getAvailableThemes, freeThemes } = await import('./monetization.js');
    expect(getAvailableThemes()).toHaveLength(freeThemes.length);
  });

  it('getAvailableThemes includes premium themes when the flag is enabled', async () => {
    vi.doMock('./features.js', () => ({ features: { premiumThemes: true } }));
    vi.doMock('../lib/preview.js', () => ({ shouldShowMonetization: (enabled) => enabled }));
    const { getAvailableThemes, freeThemes, premiumThemes } = await import('./monetization.js');
    expect(getAvailableThemes()).toHaveLength(freeThemes.length + premiumThemes.length);
  });

  it('monetizationActive is false when every feature flag is off', async () => {
    vi.doMock('./features.js', () => ({
      features: {
        neatclockPrints: false,
        lockscreenGoodies: false,
        premiumThemes: false,
        sponsorFooter: false,
        affiliateLinks: false,
      },
    }));
    const { monetizationActive } = await import('./monetization.js');
    expect(monetizationActive).toBe(false);
  });

  it('monetizationActive is true when any single feature flag is on', async () => {
    vi.doMock('./features.js', () => ({
      features: {
        neatclockPrints: false,
        lockscreenGoodies: false,
        premiumThemes: false,
        sponsorFooter: true,
        affiliateLinks: false,
      },
    }));
    const { monetizationActive } = await import('./monetization.js');
    expect(monetizationActive).toBe(true);
  });

  it('interestFormEnabled is true only when the endpoint is configured (independent of prints flag)', async () => {
    vi.doMock('./features.js', () => ({ features: { neatclockPrints: false, productFeedback: undefined } }));
    vi.doMock('./interestEndpoint.js', () => ({
      interestFormEndpoint: 'https://formspree.io/f/abc',
      isInterestEndpointConfigured: () => true,
    }));
    const { interestFormEnabled } = await import('./monetization.js');
    expect(interestFormEnabled).toBe(true);
  });

  it('interestFormEnabled remains true when prints go live (feedback mode changes but form stays visible)', async () => {
    vi.doMock('./features.js', () => ({ features: { neatclockPrints: true, productFeedback: undefined } }));
    vi.doMock('./interestEndpoint.js', () => ({
      interestFormEndpoint: 'https://formspree.io/f/abc',
      isInterestEndpointConfigured: () => true,
    }));
    const { interestFormEnabled } = await import('./monetization.js');
    expect(interestFormEnabled).toBe(true);
  });

  it('interestFormEnabled respects explicit productFeedback=false even with endpoint configured', async () => {
    vi.doMock('./features.js', () => ({ features: { neatclockPrints: false, productFeedback: false } }));
    vi.doMock('./interestEndpoint.js', () => ({
      interestFormEndpoint: 'https://formspree.io/f/abc',
      isInterestEndpointConfigured: () => true,
    }));
    const { interestFormEnabled } = await import('./monetization.js');
    expect(interestFormEnabled).toBe(false);
  });

  it('getFeedbackMode returns pre_launch when prints are not live', async () => {
    vi.doMock('./features.js', () => ({ features: { neatclockPrints: false } }));
    const { getFeedbackMode } = await import('./monetization.js');
    expect(getFeedbackMode()).toBe('pre_launch');
  });

  it('getFeedbackMode returns post_launch when prints are live', async () => {
    vi.doMock('./features.js', () => ({ features: { neatclockPrints: true } }));
    const { getFeedbackMode } = await import('./monetization.js');
    expect(getFeedbackMode()).toBe('post_launch');
  });
});
