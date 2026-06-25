import { storageGet } from './storage.js';

/** URL slug → built-in preset name (see README). */
export const PRESET_DEEP_LINKS = {
  home: "Homeowner's Sentinel",
  gearhead: 'Preventive Gearhead',
  cfo: 'Automated CFO',
};

export function getDeepLinkSearch() {
  if (typeof window === 'undefined') return '';
  return window.location.search;
}

export function parseDeepLinkParams(search = getDeepLinkSearch()) {
  const params = new URLSearchParams(search);
  const presetParam = params.get('preset');
  if (!presetParam) return null;

  const presetName = PRESET_DEEP_LINKS[presetParam.toLowerCase()];
  if (!presetName) return null;

  return {
    presetParam: presetParam.toLowerCase(),
    presetName,
    fresh: params.get('fresh') === '1',
  };
}

export function hasSavedTasks() {
  const saved = storageGet('neatclock_tasks');
  if (!saved) return false;

  try {
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) && parsed.length > 0;
  } catch {
    return false;
  }
}

export function shouldApplyDeepLink(context = parseDeepLinkParams()) {
  if (!context) return false;
  return context.fresh || !hasSavedTasks();
}

export function getDeepLinkBootstrap() {
  const context = parseDeepLinkParams();
  if (!shouldApplyDeepLink(context)) return null;
  return context;
}
