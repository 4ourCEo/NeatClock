// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useSchedulePersistence } from './useSchedulePersistence.js';

vi.mock('../lib/storage.js', () => ({
  persistState: vi.fn(() => true),
}));

import { persistState } from '../lib/storage.js';

const baseProps = {
  tasks: [{ id: 't1', name: 'Test', interval: 1, unit: 'months' }],
  customPresets: {},
  activePreset: "Homeowner's Sentinel",
  theme: 'theme-warm-sand',
  showExportPreview: false,
  startOffsetWeeks: 0,
  setNotification: vi.fn(),
};

describe('useSchedulePersistence', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('debounces task persistence by 300ms', () => {
    renderHook(() => useSchedulePersistence(baseProps));

    expect(persistState).not.toHaveBeenCalledWith(
      'neatclock_tasks',
      expect.any(String),
      expect.any(Function),
    );

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(persistState).toHaveBeenCalledWith(
      'neatclock_tasks',
      JSON.stringify(baseProps.tasks),
      expect.any(Function),
    );
  });

  it('flushes pending tasks on visibilitychange when hidden', () => {
    const visibilityListeners = new Map();
    vi.spyOn(document, 'addEventListener').mockImplementation((type, handler) => {
      if (type === 'visibilitychange') {
        visibilityListeners.set(type, handler);
      }
    });
    vi.spyOn(document, 'removeEventListener').mockImplementation(() => {});

    const updatedTasks = [{ id: 't2', name: 'Fresh', interval: 2, unit: 'weeks' }];
    const { rerender } = renderHook((props) => useSchedulePersistence(props), {
      initialProps: baseProps,
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });
    vi.clearAllMocks();

    rerender({ ...baseProps, tasks: updatedTasks });

    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      value: 'hidden',
    });

    act(() => {
      visibilityListeners.get('visibilitychange')?.();
    });

    expect(persistState).toHaveBeenCalledWith(
      'neatclock_tasks',
      JSON.stringify(updatedTasks),
      expect.any(Function),
    );
  });

  it('skips visibility flush when debounced save already completed', () => {
    const visibilityListeners = new Map();
    vi.spyOn(document, 'addEventListener').mockImplementation((type, handler) => {
      if (type === 'visibilitychange') {
        visibilityListeners.set(type, handler);
      }
    });
    vi.spyOn(document, 'removeEventListener').mockImplementation(() => {});

    const updatedTasks = [{ id: 't2', name: 'Fresh', interval: 2, unit: 'weeks' }];
    const { rerender } = renderHook((props) => useSchedulePersistence(props), {
      initialProps: baseProps,
    });

    rerender({ ...baseProps, tasks: updatedTasks });

    act(() => {
      vi.advanceTimersByTime(300);
    });
    vi.clearAllMocks();

    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      value: 'hidden',
    });

    act(() => {
      visibilityListeners.get('visibilitychange')?.();
    });

    expect(persistState).not.toHaveBeenCalledWith(
      'neatclock_tasks',
      expect.any(String),
      expect.any(Function),
    );
  });

  it('flushes pending tasks on beforeunload', () => {
    const beforeUnloadListeners = new Map();
    vi.spyOn(window, 'addEventListener').mockImplementation((type, handler) => {
      if (type === 'beforeunload') {
        beforeUnloadListeners.set(type, handler);
      }
    });
    vi.spyOn(window, 'removeEventListener').mockImplementation(() => {});

    const updatedTasks = [{ id: 't3', name: 'Unload', interval: 1, unit: 'years' }];
    const { rerender } = renderHook((props) => useSchedulePersistence(props), {
      initialProps: baseProps,
    });

    act(() => {
      vi.advanceTimersByTime(300);
    });
    vi.clearAllMocks();

    rerender({ ...baseProps, tasks: updatedTasks });

    act(() => {
      beforeUnloadListeners.get('beforeunload')?.();
    });

    expect(persistState).toHaveBeenCalledWith(
      'neatclock_tasks',
      JSON.stringify(updatedTasks),
      expect.any(Function),
    );
  });
});
