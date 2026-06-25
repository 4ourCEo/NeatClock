import { storageGet } from '../lib/storage.js';
import { normalizeCustomPresets } from '../lib/backup.js';
import {
  normalizeTasks,
  resolveActivePreset,
} from '../lib/tasks.js';
import { resolveTheme } from '../lib/themes.js';
import { PRESETS } from '../config/presets.js';
import { getDeepLinkBootstrap } from '../lib/deepLink.js';

export function loadInitialTasks() {
  const deepLink = getDeepLinkBootstrap();
  if (deepLink) {
    return [...PRESETS[deepLink.presetName]];
  }

  const saved = storageGet('neatclock_tasks');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return normalizeTasks(parsed);
      }
    } catch (e) {
      console.error('Failed to parse saved tasks', e);
    }
  }
  return [...PRESETS["Homeowner's Sentinel"]];
}

export function loadInitialCustomPresets() {
  const saved = storageGet('neatclock_custom_presets');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return normalizeCustomPresets(parsed);
      }
    } catch (e) {
      console.error('Failed to parse custom presets', e);
    }
  }
  return {};
}

export function loadInitialActivePreset() {
  const deepLink = getDeepLinkBootstrap();
  if (deepLink) {
    return deepLink.presetName;
  }

  let custom = {};
  const savedCustom = storageGet('neatclock_custom_presets');
  if (savedCustom) {
    try {
      const parsed = JSON.parse(savedCustom);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        custom = normalizeCustomPresets(parsed);
      }
    } catch {
      // ignore corrupt custom presets during preset resolution
    }
  }
  const savedPreset = storageGet('neatclock_active_preset');
  return resolveActivePreset(savedPreset || "Homeowner's Sentinel", custom);
}

export function loadInitialTheme() {
  const savedTheme = storageGet('neatclock_theme');
  const legacyDark = storageGet('neatclock_dark_mode') === 'true';
  return resolveTheme(savedTheme, legacyDark);
}

export function loadInitialShowExportPreview() {
  const saved = storageGet('neatclock_show_export_preview');
  if (saved !== null) return saved === 'true';
  const legacy = storageGet('neatclock_show_agenda');
  return legacy === 'true';
}

export function loadInitialStartOffsetWeeks() {
  const saved = storageGet('neatclock_start_offset');
  const parsed = saved ? parseInt(saved, 10) : 0;
  return Number.isNaN(parsed) ? 0 : Math.min(12, Math.max(0, parsed));
}

/** Loads persisted schedule preferences from localStorage (lazy-init friendly). */
export function useScheduleBootstrap() {
  return {
    initialTasks: loadInitialTasks,
    initialCustomPresets: loadInitialCustomPresets,
    initialActivePreset: loadInitialActivePreset,
    initialTheme: loadInitialTheme,
    initialShowExportPreview: loadInitialShowExportPreview,
    initialStartOffsetWeeks: loadInitialStartOffsetWeeks,
  };
}
