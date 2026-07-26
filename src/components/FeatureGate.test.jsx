// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import FeatureGate, { MonetizationPreviewBanner } from './FeatureGate.jsx';

describe('FeatureGate', () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('renders children when enabled is true', () => {
    render(
      <FeatureGate enabled={true}>
        <span>Premium content</span>
      </FeatureGate>,
    );
    expect(screen.getByText('Premium content')).toBeTruthy();
  });

  it('renders nothing when enabled is false and not previewing', () => {
    vi.stubGlobal('window', { location: { search: '' } });
    const { container } = render(
      <FeatureGate enabled={false}>
        <span>Premium content</span>
      </FeatureGate>,
    );
    expect(container.textContent).toBe('');
  });

  it('renders children when disabled but owner preview param is set', () => {
    vi.stubGlobal('window', { location: { search: '?preview=monetization' } });
    render(
      <FeatureGate enabled={false}>
        <span>Premium content</span>
      </FeatureGate>,
    );
    expect(screen.getByText('Premium content')).toBeTruthy();
  });
});

describe('MonetizationPreviewBanner', () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('renders nothing without the preview query param', () => {
    vi.stubGlobal('window', { location: { search: '' } });
    const { container } = render(<MonetizationPreviewBanner />);
    expect(container.textContent).toBe('');
  });

  it('renders the banner when ?preview=monetization is set', () => {
    vi.stubGlobal('window', { location: { search: '?preview=monetization' } });
    render(<MonetizationPreviewBanner />);
    expect(screen.getByRole('status')).toBeTruthy();
  });
});
