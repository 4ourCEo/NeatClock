import { describe, expect, it } from 'vitest';
import {
  clampInterval,
  normalizeTask,
  normalizeUnit,
  parseNaturalLanguage,
  resolveActivePreset,
} from './tasks.js';

describe('clampInterval', () => {
  it('clamps to 1–120', () => {
    expect(clampInterval(0)).toBe(1);
    expect(clampInterval(999)).toBe(120);
    expect(clampInterval('abc')).toBe(1);
    expect(clampInterval(6)).toBe(6);
  });
});

describe('normalizeUnit', () => {
  it('accepts valid units only', () => {
    expect(normalizeUnit('weeks')).toBe('weeks');
    expect(normalizeUnit('bogus')).toBe('months');
  });
});

describe('normalizeTask', () => {
  it('repairs partial tasks', () => {
    const task = normalizeTask({ name: 'Oil change', interval: 0, unit: 'invalid' });
    expect(task.interval).toBe(1);
    expect(task.unit).toBe('months');
    expect(task.id).toBeTruthy();
  });

  it('rejects non-objects', () => {
    expect(normalizeTask(null)).toBeNull();
  });

  it('truncates very long names', () => {
    const longName = 'x'.repeat(300);
    expect(normalizeTask({ name: longName }).name.length).toBe(200);
  });
});

describe('resolveActivePreset', () => {
  it('maps legacy ids', () => {
    expect(resolveActivePreset('home-sentinel', {})).toBe("Homeowner's Sentinel");
  });

  it('falls back when preset missing', () => {
    expect(resolveActivePreset('Deleted Preset', {})).toBe("Homeowner's Sentinel");
    expect(resolveActivePreset('My Custom', { 'My Custom': [] })).toBe('My Custom');
  });
});

describe('parseNaturalLanguage', () => {
  it('parses every N months', () => {
    expect(parseNaturalLanguage('Oil change every 6 months')).toEqual({
      name: 'Oil change',
      interval: 6,
      unit: 'months',
    });
  });

  it('defaults bare text to monthly', () => {
    expect(parseNaturalLanguage('Quarterly taxes')).toMatchObject({
      name: 'Quarterly taxes',
      interval: 1,
      unit: 'months',
    });
  });

  it('returns null for empty input', () => {
    expect(parseNaturalLanguage('   ')).toBeNull();
  });
});
