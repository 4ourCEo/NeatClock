// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('../lib/shareLinks.js', () => ({
  presetShareSlug: vi.fn(),
  copyPresetShareLink: vi.fn(),
}));
vi.mock('../lib/analytics.js', () => ({
  trackEvent: vi.fn(),
}));

import { trackEvent } from '../lib/analytics.js';
import { copyPresetShareLink, presetShareSlug } from '../lib/shareLinks.js';
import SharePresetLink from './SharePresetLink.jsx';

describe('SharePresetLink', () => {
  afterEach(() => {
    cleanup();
    vi.clearAllMocks();
  });

  it('renders nothing when the preset has no share slug', () => {
    presetShareSlug.mockReturnValue(null);
    const { container } = render(<SharePresetLink activePreset="Custom" />);
    expect(container.textContent).toBe('');
  });

  it('copies the share link and reports success', async () => {
    presetShareSlug.mockReturnValue('gearhead');
    copyPresetShareLink.mockResolvedValue('https://neatclock.pro/?preset=gearhead');
    const onCopied = vi.fn();

    render(<SharePresetLink activePreset="Preventive Gearhead" onCopied={onCopied} />);
    fireEvent.click(screen.getByRole('button', { name: /copy share link/i }));

    await vi.waitFor(() => expect(onCopied).toHaveBeenCalled());
    expect(copyPresetShareLink).toHaveBeenCalledWith('Preventive Gearhead', {
      medium: 'share',
      campaign: 'gearhead',
    });
    expect(trackEvent).toHaveBeenCalledWith('share_link_copy', { preset: 'gearhead' });
    expect(onCopied).toHaveBeenCalledWith(
      'Link copied — share your Preventive Gearhead schedule',
    );
  });

  it('reports a friendly error when copying fails', async () => {
    presetShareSlug.mockReturnValue('gearhead');
    copyPresetShareLink.mockRejectedValue(new Error('clipboard denied'));
    const onCopied = vi.fn();

    render(<SharePresetLink activePreset="Preventive Gearhead" onCopied={onCopied} />);
    fireEvent.click(screen.getByRole('button', { name: /copy share link/i }));

    await vi.waitFor(() => expect(onCopied).toHaveBeenCalled());
    expect(trackEvent).not.toHaveBeenCalled();
    expect(onCopied).toHaveBeenCalledWith(
      'Could not copy link. Select the URL in your browser bar instead.',
    );
  });
});
