import {
  interestFormEndpoint,
  isInterestEndpointConfigured,
} from '../config/interestEndpoint.js';
import { storageGet, storageSet, storageRemove } from './storage.js';

export function isInterestFormConfigured() {
  return isInterestEndpointConfigured();
}

export async function submitInterestForm(payload) {
  if (!isInterestFormConfigured()) {
    throw new Error(
      'Feedback collection is not live yet. The free export tool still works — check back soon.',
    );
  }

  const response = await fetch(interestFormEndpoint, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...payload,
      _subject: payload._subject || 'NeatClock — product interest',
      _template: 'table',
      _captcha: 'false',
    }),
  });

  if (!response.ok) {
    throw new Error('Could not send feedback. Please try again.');
  }

  return response.json();
}

const DISMISS_KEY = 'neatclock_interest_export_dismissed';

export function isExportInterestDismissed() {
  return storageGet(DISMISS_KEY) === 'true';
}

export function dismissExportInterest() {
  storageSet(DISMISS_KEY, 'true');
}

export function resetExportInterestDismissal() {
  storageRemove(DISMISS_KEY);
}
