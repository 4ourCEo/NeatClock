import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { calculateFirstOccurrence, isRhythmHighlighted } from './schedulePreview.js';

describe('isRhythmHighlighted', () => {
  it('highlights January only for yearly tasks', () => {
    const task = { interval: 1, unit: 'years' };
    expect(isRhythmHighlighted(task, 1)).toBe(true);
    expect(isRhythmHighlighted(task, 2)).toBe(false);
    expect(isRhythmHighlighted(task, 12)).toBe(false);
  });

  it('highlights months for a weekly task using a 4-week-per-month approximation', () => {
    // interval 4 weeks -> every month (Math.round(4/4) = 1)
    const task = { interval: 4, unit: 'weeks' };
    expect(isRhythmHighlighted(task, 1)).toBe(true);
    expect(isRhythmHighlighted(task, 2)).toBe(true);
  });

  it('highlights every other month for a biweekly-ish task (8 weeks)', () => {
    const task = { interval: 8, unit: 'weeks' };
    expect(isRhythmHighlighted(task, 2)).toBe(true);
    expect(isRhythmHighlighted(task, 1)).toBe(false);
  });

  it('highlights months divisible by the interval for monthly tasks', () => {
    const task = { interval: 3, unit: 'months' };
    expect(isRhythmHighlighted(task, 3)).toBe(true);
    expect(isRhythmHighlighted(task, 6)).toBe(true);
    expect(isRhythmHighlighted(task, 4)).toBe(false);
  });

  it('defaults interval to 1 when interval is not parseable', () => {
    const task = { interval: 'not-a-number', unit: 'months' };
    expect(isRhythmHighlighted(task, 1)).toBe(true);
    expect(isRhythmHighlighted(task, 2)).toBe(true);
  });
});

describe('calculateFirstOccurrence', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 15, 9, 30));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('adds months for a monthly task', () => {
    const result = calculateFirstOccurrence({ interval: 3, unit: 'months' });
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(3); // April (0-indexed)
    expect(result.getDate()).toBe(15);
  });

  it('adds weeks for a weekly task', () => {
    const result = calculateFirstOccurrence({ interval: 2, unit: 'weeks' });
    expect(result.getFullYear()).toBe(2026);
    expect(result.getMonth()).toBe(0);
    expect(result.getDate()).toBe(29);
  });

  it('adds years for a yearly task', () => {
    const result = calculateFirstOccurrence({ interval: 1, unit: 'years' });
    expect(result.getFullYear()).toBe(2027);
    expect(result.getMonth()).toBe(0);
    expect(result.getDate()).toBe(15);
  });

  it('normalizes the time to local noon', () => {
    const result = calculateFirstOccurrence({ interval: 1, unit: 'months' });
    expect(result.getHours()).toBe(12);
    expect(result.getMinutes()).toBe(0);
    expect(result.getSeconds()).toBe(0);
  });

  it('defaults interval to 1 when not parseable', () => {
    const result = calculateFirstOccurrence({ interval: 'x', unit: 'months' });
    expect(result.getMonth()).toBe(1); // February
  });
});
