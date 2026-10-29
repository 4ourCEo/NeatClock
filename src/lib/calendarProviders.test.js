import { beforeEach, describe, expect, it, vi } from 'vitest';
import { downloadText } from './download.js';
import { downloadAppleTaskIcs, getGoogleCalLink, getOutlookCalLink } from './calendarProviders.js';

vi.mock('./download.js', () => ({ downloadText: vi.fn() }));

describe('calendarProviders', () => {
  const task = { id: 't1', name: 'Oil Change', interval: 6, unit: 'months' };

  beforeEach(() => vi.clearAllMocks());

  it('builds Google Calendar template link', () => {
    expect(getGoogleCalLink(task)).toContain('calendar.google.com');
    expect(new URL(getGoogleCalLink(task)).searchParams.get('text')).toBe('Oil Change');
    expect(getGoogleCalLink({ ...task, unit: 'weeks' })).toContain('WEEKLY');
  });

  it('builds Outlook compose link', () => {
    expect(getOutlookCalLink(task)).toContain('outlook.live.com');
    expect(getOutlookCalLink({ ...task, unit: 'years' })).toContain('YEARLY');
  });

  it('includes business identity in Google and Outlook event details', () => {
    const search = '?preset=hvac-business&brandName=North+Heating&brandPhone=555-0100&brandEmail=service%40north.example&brandWeb=https%3A%2F%2Fnorth.example%2F';
    const google = new URL(getGoogleCalLink(task, search));
    const outlook = new URL(getOutlookCalLink(task, search));
    expect(google.searchParams.get('details')).toContain('Customer care calendar from North Heating');
    expect(outlook.searchParams.get('body')).toContain('Call 555-0100');
    expect(outlook.searchParams.get('body')).toContain('service@north.example');
  });

  it('includes business identity in a single-task Apple calendar export', () => {
    const search = '?preset=hvac-business&brandName=North+Heating&brandPhone=555-0100';
    downloadAppleTaskIcs(task, search);
    expect(downloadText.mock.calls[0][0]).toContain('North Heating Customer Care');
    expect(downloadText.mock.calls[0][0]).toContain('Call 555-0100');
  });
});
