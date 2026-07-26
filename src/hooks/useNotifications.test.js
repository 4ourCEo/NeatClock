// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useNotifications } from './useNotifications.js';

describe('useNotifications', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts with no notification', () => {
    const { result } = renderHook(() => useNotifications());
    expect(result.current.notification).toBeNull();
  });

  it('shows a message and auto-clears it after 3 seconds', () => {
    const { result } = renderHook(() => useNotifications());

    act(() => {
      result.current.showNotification('Exported!');
    });
    expect(result.current.notification).toBe('Exported!');

    act(() => {
      vi.advanceTimersByTime(2999);
    });
    expect(result.current.notification).toBe('Exported!');

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(result.current.notification).toBeNull();
  });

  it('restarts the timer when a new notification arrives before the old one clears', () => {
    const { result } = renderHook(() => useNotifications());

    act(() => {
      result.current.showNotification('First');
    });
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    act(() => {
      result.current.showNotification('Second');
    });

    // 2000ms after the second call the first timer would have fired if not cleared
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.notification).toBe('Second');

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(result.current.notification).toBeNull();
  });

  it('clears the pending timeout on unmount', () => {
    const clearSpy = vi.spyOn(window, 'clearTimeout');
    const { result, unmount } = renderHook(() => useNotifications());

    act(() => {
      result.current.showNotification('Bye');
    });
    unmount();

    expect(clearSpy).toHaveBeenCalled();
  });
});
