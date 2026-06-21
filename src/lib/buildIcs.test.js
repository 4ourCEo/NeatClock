import { describe, expect, it } from 'vitest';
import { buildIcsContent, escapeIcalText, formatIcalDate } from './buildIcs.js';

describe('buildIcsContent', () => {
  it('returns null for empty task list', () => {
    expect(buildIcsContent([])).toBeNull();
  });

  it('uses all-day VALUE=DATE for DTSTART', () => {
    const content = buildIcsContent([
      { id: 't1', name: 'Test Task', interval: 3, unit: 'months' },
    ]);
    expect(content).toContain('DTSTART;VALUE=DATE:');
    expect(content).not.toContain('T090000Z');
  });

  it('escapes special characters in summaries', () => {
    const content = buildIcsContent([
      { id: 't1', name: 'Oil; change, now', interval: 1, unit: 'months' },
    ]);
    expect(content).toContain('Oil\\; change\\, now');
  });

  it('includes affiliate hints when enabled', () => {
    const content = buildIcsContent(
      [{ id: 't1', name: 'HVAC Filter Replacement', interval: 3, unit: 'months' }],
      { includeAffiliateHints: true },
    );
    expect(content).toContain('filter size');
  });
});

describe('escapeIcalText', () => {
  it('escapes semicolons and commas', () => {
    expect(escapeIcalText('a;b,c')).toBe('a\\;b\\,c');
  });
});

describe('formatIcalDate', () => {
  it('formats as YYYYMMDD', () => {
    expect(formatIcalDate(new Date(2026, 5, 19))).toBe('20260619');
  });
});
