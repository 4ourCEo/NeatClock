// @vitest-environment jsdom
import { renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useExportPreview } from './useExportPreview.js';

function makeTask(id, name, interval, unit) {
  return { id, name, interval, unit };
}

describe('useExportPreview', () => {
  it('returns preview items sorted by first occurrence date ascending', () => {
    const tasks = [
      makeTask('a', 'Yearly audit', 1, 'years'),
      makeTask('b', 'Weekly wipe', 1, 'weeks'),
      makeTask('c', 'Monthly books', 1, 'months'),
    ];

    const { result } = renderHook(({ list }) => useExportPreview(list), {
      initialProps: { list: tasks },
    });

    const preview = result.current;
    expect(preview).toHaveLength(3);

    for (let i = 1; i < preview.length; i += 1) {
      expect(preview[i - 1].firstDate.getTime()).toBeLessThanOrEqual(
        preview[i].firstDate.getTime()
      );
    }

    expect(preview[0].task.name).toBe('Weekly wipe');
    expect(preview[1].task.name).toBe('Monthly books');
    expect(preview[2].task.name).toBe('Yearly audit');
  });

  it('caps preview at 10 occurrences', () => {
    const tasks = Array.from({ length: 15 }, (_, i) =>
      makeTask(`t-${i}`, `Task ${i}`, 1 + i, 'weeks')
    );

    const { result } = renderHook(({ list }) => useExportPreview(list), {
      initialProps: { list: tasks },
    });

    expect(result.current).toHaveLength(10);
  });

  it('memoizes preview until tasks reference changes', () => {
    const tasks = [makeTask('one', 'Only task', 2, 'months')];

    const { result, rerender } = renderHook(({ list }) => useExportPreview(list), {
      initialProps: { list: tasks },
    });

    const firstPreview = result.current;
    rerender({ list: tasks });
    expect(result.current).toBe(firstPreview);

    const nextTasks = [...tasks, makeTask('two', 'Second', 1, 'weeks')];
    rerender({ list: nextTasks });
    expect(result.current).not.toBe(firstPreview);
    expect(result.current).toHaveLength(2);
  });

  it('includes formatted fields for each occurrence', () => {
    const tasks = [makeTask('fmt', 'Format check', 4, 'weeks')];

    const { result } = renderHook(() => useExportPreview(tasks));
    const item = result.current[0];

    expect(item.task).toEqual(tasks[0]);
    expect(item.firstDate).toBeInstanceOf(Date);
    expect(typeof item.daysUntil).toBe('number');
    expect(item.formattedDate).toMatch(/\w{3}/);
  });
});
