// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from 'vitest';
import { downloadBlob, downloadText, isMobileDevice } from './download.js';

const IOS_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15';
const ANDROID_UA = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36';
const DESKTOP_UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36';

function stubNavigator(overrides) {
  Object.defineProperty(window, 'navigator', {
    value: { maxTouchPoints: 0, ...overrides },
    configurable: true,
    writable: true,
  });
}

describe('isMobileDevice', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('is true for iOS user agents', () => {
    stubNavigator({ userAgent: IOS_UA });
    expect(isMobileDevice()).toBe(true);
  });

  it('is true for Android user agents', () => {
    stubNavigator({ userAgent: ANDROID_UA });
    expect(isMobileDevice()).toBe(true);
  });

  it('is false for a plain desktop Mac user agent', () => {
    stubNavigator({ userAgent: DESKTOP_UA, maxTouchPoints: 0 });
    expect(isMobileDevice()).toBe(false);
  });

  it('treats a touch-capable Mac (iPad in desktop mode) as mobile', () => {
    stubNavigator({ userAgent: DESKTOP_UA, maxTouchPoints: 5 });
    expect(isMobileDevice()).toBe(true);
  });
});

describe('downloadBlob / downloadText (desktop path)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('creates an anchor, clicks it with the given filename, and revokes the object URL shortly after', () => {
    stubNavigator({ userAgent: DESKTOP_UA, maxTouchPoints: 0 });
    vi.useFakeTimers();

    const createObjectURL = vi.fn(() => 'blob:fake-url');
    const revokeObjectURL = vi.fn();
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL });

    const clickSpy = vi.fn();
    const realCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag) => {
      const el = realCreateElement(tag);
      if (tag === 'a') el.click = clickSpy;
      return el;
    });

    downloadText('hello', 'schedule.ics', 'text/calendar');

    expect(createObjectURL).toHaveBeenCalled();
    expect(clickSpy).toHaveBeenCalled();
    expect(revokeObjectURL).not.toHaveBeenCalled();

    vi.advanceTimersByTime(100);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:fake-url');
  });
});

describe('downloadBlob (mobile fallback path)', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.useRealTimers();
  });

  it('navigates to the blob URL when Web Share API is unavailable', () => {
    stubNavigator({ userAgent: IOS_UA, maxTouchPoints: 5 });
    vi.useFakeTimers();

    const createObjectURL = vi.fn(() => 'blob:fake-url');
    const revokeObjectURL = vi.fn();
    vi.stubGlobal('URL', { createObjectURL, revokeObjectURL });

    delete window.location;
    window.location = { href: '' };

    downloadBlob(new Blob(['ics content']), 'schedule.ics');

    expect(window.location.href).toBe('blob:fake-url');
    vi.advanceTimersByTime(5000);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:fake-url');
  });
});
