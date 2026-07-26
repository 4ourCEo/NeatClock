import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('../config/interestEndpoint.js', () => ({
  interestFormEndpoint: 'https://formspree.io/f/abc123',
  isInterestEndpointConfigured: vi.fn(() => true),
}));
vi.mock('./storage.js', () => ({
  storageGet: vi.fn(),
  storageSet: vi.fn(),
  storageRemove: vi.fn(),
}));

import { isInterestEndpointConfigured } from '../config/interestEndpoint.js';
import { storageGet, storageRemove, storageSet } from './storage.js';
import {
  dismissExportInterest,
  isExportInterestDismissed,
  isInterestFormConfigured,
  resetExportInterestDismissal,
  submitInterestForm,
} from './submitInterest.js';

describe('isInterestFormConfigured', () => {
  it('delegates to isInterestEndpointConfigured', () => {
    isInterestEndpointConfigured.mockReturnValue(true);
    expect(isInterestFormConfigured()).toBe(true);
    isInterestEndpointConfigured.mockReturnValue(false);
    expect(isInterestFormConfigured()).toBe(false);
  });
});

describe('submitInterestForm', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    isInterestEndpointConfigured.mockReturnValue(true);
  });

  it('throws without hitting the network when not configured', async () => {
    isInterestEndpointConfigured.mockReturnValue(false);
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await expect(submitInterestForm({ email: 'a@b.com' })).rejects.toThrow(
      'Feedback collection is not live yet',
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('posts the payload with defaults and returns parsed JSON on success', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ ok: true }),
    });
    vi.stubGlobal('fetch', fetchMock);

    const result = await submitInterestForm({ email: 'a@b.com' });

    expect(fetchMock).toHaveBeenCalledWith(
      'https://formspree.io/f/abc123',
      expect.objectContaining({
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      }),
    );
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body).toMatchObject({
      email: 'a@b.com',
      _subject: 'NeatClock — product interest',
      _template: 'table',
      _captcha: 'false',
    });
    expect(result).toEqual({ ok: true });
  });

  it('preserves a caller-provided _subject', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });
    vi.stubGlobal('fetch', fetchMock);

    await submitInterestForm({ _subject: 'Custom subject' });
    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body._subject).toBe('Custom subject');
  });

  it('throws a friendly error when the response is not ok', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false });
    vi.stubGlobal('fetch', fetchMock);

    await expect(submitInterestForm({})).rejects.toThrow('Could not send feedback');
  });
});

describe('export interest dismissal', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('isExportInterestDismissed reads the dismissal flag from storage', () => {
    storageGet.mockReturnValue('true');
    expect(isExportInterestDismissed()).toBe(true);
    expect(storageGet).toHaveBeenCalledWith('neatclock_interest_export_dismissed');
  });

  it('isExportInterestDismissed is false for any other stored value', () => {
    storageGet.mockReturnValue(null);
    expect(isExportInterestDismissed()).toBe(false);
  });

  it('dismissExportInterest writes the dismissal flag', () => {
    dismissExportInterest();
    expect(storageSet).toHaveBeenCalledWith('neatclock_interest_export_dismissed', 'true');
  });

  it('resetExportInterestDismissal clears the dismissal flag', () => {
    resetExportInterestDismissal();
    expect(storageRemove).toHaveBeenCalledWith('neatclock_interest_export_dismissed');
  });
});
