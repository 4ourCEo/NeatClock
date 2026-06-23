// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PRESETS } from '../config/presets.js';
import { TASK_NAME_MAX } from '../lib/tasks.js';
import { useScheduleState } from './useScheduleState.js';

vi.mock('../lib/storage.js', () => ({
  storageGet: vi.fn(() => null),
  storageSet: vi.fn(),
}));

import { storageGet } from '../lib/storage.js';

describe('useScheduleState', () => {
  const showNotification = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    storageGet.mockReturnValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes with default preset tasks when storage is empty', () => {
    const { result } = renderHook(() => useScheduleState({ showNotification }));

    expect(result.current.tasks).toEqual(PRESETS["Homeowner's Sentinel"]);
    expect(result.current.activePreset).toBe("Homeowner's Sentinel");
    expect(result.current.theme).toBe('theme-warm-sand');
  });

  it('handleAddTask appends a new task and notifies', () => {
    const { result } = renderHook(() => useScheduleState({ showNotification }));
    const initialCount = result.current.tasks.length;

    act(() => {
      result.current.handleAddTask();
    });

    expect(result.current.tasks).toHaveLength(initialCount + 1);
    expect(result.current.tasks.at(-1).name).toBe('New Custom Task');
    expect(showNotification).toHaveBeenCalledWith('Added new task');
  });

  it('handleUpdateTaskName truncates names to TASK_NAME_MAX', () => {
    const { result } = renderHook(() => useScheduleState({ showNotification }));
    const targetId = result.current.tasks[0].id;
    const longName = 'x'.repeat(TASK_NAME_MAX + 50);

    act(() => {
      result.current.handleUpdateTaskName(targetId, longName);
    });

    const updated = result.current.tasks.find((t) => t.id === targetId);
    expect(updated.name).toHaveLength(TASK_NAME_MAX);
    expect(updated.name).toBe(longName.slice(0, TASK_NAME_MAX));
  });

  it('moveTask reorders tasks without changing length', () => {
    const { result } = renderHook(() => useScheduleState({ showNotification }));
    const firstId = result.current.tasks[0].id;
    const secondId = result.current.tasks[1].id;

    act(() => {
      result.current.moveTask(0, 1);
    });

    expect(result.current.tasks[0].id).toBe(secondId);
    expect(result.current.tasks[1].id).toBe(firstId);
    expect(result.current.tasks).toHaveLength(PRESETS["Homeowner's Sentinel"].length);
  });

  it('handleDeleteTask removes the matching task', () => {
    const { result } = renderHook(() => useScheduleState({ showNotification }));
    const targetId = result.current.tasks[0].id;
    const remaining = result.current.tasks.length - 1;

    act(() => {
      result.current.handleDeleteTask(targetId);
    });

    expect(result.current.tasks).toHaveLength(remaining);
    expect(result.current.tasks.some((t) => t.id === targetId)).toBe(false);
  });

  it('parsedNl reflects natural-language input', () => {
    const { result } = renderHook(() => useScheduleState({ showNotification }));

    act(() => {
      result.current.setNlInput('Change oil every 3 months');
    });

    expect(result.current.parsedNl).toEqual({
      name: 'Change oil',
      interval: 3,
      unit: 'months',
    });
  });
});
