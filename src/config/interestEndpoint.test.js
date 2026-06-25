import { afterEach, describe, expect, it, vi } from 'vitest';

describe('resolveInterestFormEndpoint', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it('uses explicit VITE_INTEREST_FORM_ENDPOINT', async () => {
    vi.stubEnv('VITE_INTEREST_FORM_ENDPOINT', 'https://formspree.io/f/abc123');
    vi.stubEnv('VITE_INTEREST_FORM_EMAIL', '');
    const { resolveInterestFormEndpoint } = await import('./interestEndpoint.js');
    expect(resolveInterestFormEndpoint()).toBe('https://formspree.io/f/abc123');
  });

  it('builds FormSubmit ajax URL from VITE_INTEREST_FORM_EMAIL', async () => {
    vi.stubEnv('VITE_INTEREST_FORM_ENDPOINT', '');
    vi.stubEnv('VITE_INTEREST_FORM_EMAIL', 'hello@neatclock.app');
    const { resolveInterestFormEndpoint } = await import('./interestEndpoint.js');
    expect(resolveInterestFormEndpoint()).toBe(
      'https://formsubmit.co/ajax/hello%40neatclock.app',
    );
  });

  it('prefers explicit endpoint over email', async () => {
    vi.stubEnv('VITE_INTEREST_FORM_ENDPOINT', 'https://formspree.io/f/xyz');
    vi.stubEnv('VITE_INTEREST_FORM_EMAIL', 'hello@neatclock.app');
    const { resolveInterestFormEndpoint } = await import('./interestEndpoint.js');
    expect(resolveInterestFormEndpoint()).toBe('https://formspree.io/f/xyz');
  });

  it('returns empty when unset', async () => {
    vi.stubEnv('VITE_INTEREST_FORM_ENDPOINT', '');
    vi.stubEnv('VITE_INTEREST_FORM_EMAIL', '');
    const { resolveInterestFormEndpoint } = await import('./interestEndpoint.js');
    expect(resolveInterestFormEndpoint()).toBe('');
  });
});
