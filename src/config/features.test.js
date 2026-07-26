import { afterEach, describe, expect, it, vi } from 'vitest';

describe('features', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('defaults every flag to false when its env var is explicitly unset', async () => {
    vi.stubEnv('VITE_FEATURE_NEATCLOCK_PRINTS', '');
    vi.stubEnv('VITE_FEATURE_LOCKSCREEN_GOODIES', '');
    vi.stubEnv('VITE_FEATURE_PREMIUM_THEMES', '');
    vi.stubEnv('VITE_FEATURE_SPONSOR_FOOTER', '');
    vi.stubEnv('VITE_FEATURE_AFFILIATE_LINKS', '');
    const { features } = await import('./features.js');
    expect(features).toEqual({
      neatclockPrints: false,
      lockscreenGoodies: false,
      premiumThemes: false,
      sponsorFooter: false,
      affiliateLinks: false,
    });
  });

  it('enables a flag only when its env var is exactly "true"', async () => {
    vi.stubEnv('VITE_FEATURE_NEATCLOCK_PRINTS', 'true');
    vi.stubEnv('VITE_FEATURE_PREMIUM_THEMES', '1');
    const { features } = await import('./features.js');
    expect(features.neatclockPrints).toBe(true);
    expect(features.premiumThemes).toBe(false);
  });

  it('sponsorConfig falls back to defaults when env vars are unset', async () => {
    const { sponsorConfig } = await import('./features.js');
    expect(sponsorConfig).toEqual({
      name: 'Minimalist Notebook Co.',
      tagline: 'analogue tools for organized minds',
      url: '#',
    });
  });

  it('sponsorConfig reads overrides from env vars', async () => {
    vi.stubEnv('VITE_SPONSOR_NAME', 'Acme Co.');
    const { sponsorConfig } = await import('./features.js');
    expect(sponsorConfig.name).toBe('Acme Co.');
  });

  it('printsConfig and lockscreenConfig fall back to defaults', async () => {
    const { printsConfig, lockscreenConfig } = await import('./features.js');
    expect(printsConfig.shopUrl).toBe('#');
    expect(lockscreenConfig.downloadUrl).toBe('/wallpapers/neatclock-lockscreen.svg');
  });
});
