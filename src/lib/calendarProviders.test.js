import { describe, expect, it } from 'vitest';
import { getGoogleCalLink, getOutlookCalLink } from './calendarProviders.js';

describe('calendarProviders', () => {
  const task = { id: 't1', name: 'Oil Change', interval: 6, unit: 'months' };

  it('builds Google Calendar template link', () => {
    expect(getGoogleCalLink(task)).toContain('calendar.google.com');
    expect(getGoogleCalLink(task)).toContain('Oil%20Change');
    expect(getGoogleCalLink({ ...task, unit: 'weeks' })).toContain('WEEKLY');
  });

  it('builds Outlook compose link', () => {
    expect(getOutlookCalLink(task)).toContain('outlook.live.com');
    expect(getOutlookCalLink({ ...task, unit: 'years' })).toContain('YEARLY');
  });
});
