import { interestFormEndpoint } from '../config/monetization.js';

export async function submitInterestForm(payload) {
  if (!interestFormEndpoint) {
    throw new Error('Interest form is not configured.');
  }

  const response = await fetch(interestFormEndpoint, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...payload,
      _subject: 'NeatClock — product interest',
    }),
  });

  if (!response.ok) {
    throw new Error('Could not send feedback. Please try again.');
  }

  return response.json();
}

const DISMISS_KEY = 'neatclock_interest_export_dismissed';

export function isExportInterestDismissed() {
  try {
    return localStorage.getItem(DISMISS_KEY) === 'true';
  } catch {
    return false;
  }
}

export function dismissExportInterest() {
  try {
    localStorage.setItem(DISMISS_KEY, 'true');
  } catch {
    // ignore quota errors
  }
}

export function resetExportInterestDismissal() {
  try {
    localStorage.removeItem(DISMISS_KEY);
  } catch {
    // ignore
  }
}
