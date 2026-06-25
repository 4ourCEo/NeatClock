import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PRESETS } from '../config/presets.js';
import { buildIcsContent } from './buildIcs.js';

const FIXED_NOW = new Date('2026-06-24T12:00:00.000Z');

function expectedCalendarHeader() {
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//NeatClock//NONSGML v1.0//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ].join('\r\n');
}

describe('buildIcsContent golden vectors', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(FIXED_NOW);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('matches golden output for homeowner preset sample tasks', () => {
    const tasks = PRESETS["Homeowner's Sentinel"].slice(0, 3);
    const content = buildIcsContent(tasks);

    expect(content).toMatchSnapshot();
    expect(content).toContain('DTSTART;VALUE=DATE:20260624');
    expect(content).toContain('DTSTAMP:20260624T120000Z');
    expect(content).toContain('RRULE:FREQ=MONTHLY;INTERVAL=3');
    expect(content).toContain('SUMMARY:HVAC Filter Replacement');
    expect(content).toContain('RRULE:FREQ=MONTHLY;INTERVAL=6');
    expect(content).toMatch(/^BEGIN:VCALENDAR\r\n/);
    expect(content).toMatch(/\r\nEND:VCALENDAR$/);
  });

  it('matches golden output with special characters in task names', () => {
    const content = buildIcsContent([
      { id: 'sc-1', name: 'Oil; change, now\n(line two)', interval: 1, unit: 'months' },
      { id: 'sc-2', name: 'Backslash \\ test', interval: 2, unit: 'weeks' },
    ]);

    expect(content).toMatchSnapshot();
    expect(content).toContain('SUMMARY:Oil\\; change\\, now\\n(line two)');
    expect(content).toContain('SUMMARY:Backslash \\\\ test');
    expect(content).toContain('RRULE:FREQ=WEEKLY;INTERVAL=2');
  });

  it('matches golden output for weekly, monthly, and yearly mix', () => {
    const content = buildIcsContent([
      { id: 'mix-1', name: 'Weekly standup', interval: 1, unit: 'weeks' },
      { id: 'mix-2', name: 'Monthly review', interval: 2, unit: 'months' },
      { id: 'mix-3', name: 'Annual audit', interval: 1, unit: 'years' },
    ]);

    expect(content).toMatchSnapshot();
    expect(content).toContain('RRULE:FREQ=WEEKLY;INTERVAL=1');
    expect(content).toContain('RRULE:FREQ=MONTHLY;INTERVAL=2');
    expect(content).toContain('RRULE:FREQ=YEARLY;INTERVAL=1');
    expect(content).toContain(`${expectedCalendarHeader()}\r\nBEGIN:VEVENT`);
  });

  it('applies startOffsetWeeks to DTSTART', () => {
    const content = buildIcsContent(
      [{ id: 'off-1', name: 'Offset task', interval: 1, unit: 'months' }],
      { startOffsetWeeks: 2 },
    );

    expect(content).toContain('DTSTART;VALUE=DATE:20260708');
  });
});
