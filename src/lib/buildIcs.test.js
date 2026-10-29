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

  it('includes business identity and contact details in branded calendar exports', () => {
    const content = buildIcsContent(
      [{ id: 't1', name: 'Replace filter', interval: 3, unit: 'months' }],
      { businessBrand: { brandName: 'North Heating', brandPhone: '555-0100', brandEmail: 'service@example.com', brandWeb: 'https://north.example' } },
    );
    expect(content).toContain('X-WR-CALNAME:North Heating Customer Care');
    expect(content).toContain('Customer care calendar from North Heating. Call 555-0100. Email service@example.com. Website https://north.example.');
  });

  it('uses distinct stable event UIDs for separate business calendars', () => {
    const tasks = [{ id: 'hvac-1', name: 'Replace filter', interval: 3, unit: 'months' }];
    const brand = { brandName: 'North Heating' };
    const first = buildIcsContent(tasks, { businessBrand: brand, businessId: 'b8a1c7d2-4f65-4cc3-a239-01c0ef89a112' });
    const sameBusiness = buildIcsContent(tasks, { businessBrand: brand, businessId: 'b8a1c7d2-4f65-4cc3-a239-01c0ef89a112' });
    const second = buildIcsContent(tasks, { businessBrand: { brandName: 'South Heating' }, businessId: 'a7d1c4e2-5b69-4bd3-91d0-02e1af78b221' });
    expect(first.match(/UID:[^\r\n]+/)[0]).toBe('UID:task-b8a1c7d2-4f65-4cc3-a239-01c0ef89a112-hvac-1@neatclock.pro');
    expect(sameBusiness.match(/UID:[^\r\n]+/)[0]).toBe(first.match(/UID:[^\r\n]+/)[0]);
    expect(second.match(/UID:[^\r\n]+/)[0]).not.toBe(first.match(/UID:[^\r\n]+/)[0]);
  });

  it('generates non-colliding UIDs when legacy branded exports have no explicit business ID', () => {
    const tasks = [{ id: 'hvac-1', name: 'Replace filter', interval: 3, unit: 'months' }];
    const first = buildIcsContent(tasks, { businessBrand: { brandName: 'North Heating' } });
    const sameBusiness = buildIcsContent(tasks, { businessBrand: { brandName: 'North Heating' } });
    const second = buildIcsContent(tasks, { businessBrand: { brandName: 'South Heating' } });
    const firstUid = first.match(/UID:[^\r\n]+/)[0];
    expect(firstUid).toMatch(/^UID:task-[0-9a-f]{32}-hvac-1@neatclock\.pro$/);
    expect(sameBusiness.match(/UID:[^\r\n]+/)[0]).toBe(firstUid);
    expect(second.match(/UID:[^\r\n]+/)[0]).not.toBe(firstUid);
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
