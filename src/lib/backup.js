import { normalizeTasks, resolveActivePreset } from './tasks.js';

export const BACKUP_VERSION = 1;

const CUSTOM_PRESET_NAME_MAX = 100;
const CUSTOM_PRESET_MAX_COUNT = 50;
const DANGEROUS_PRESET_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

export function normalizeCustomPresets(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return {};
  }

  const result = {};
  let count = 0;

  for (const key of Object.keys(raw)) {
    if (count >= CUSTOM_PRESET_MAX_COUNT) break;
    if (DANGEROUS_PRESET_KEYS.has(key)) continue;

    const name = typeof key === 'string' ? key.trim() : '';
    if (!name) continue;

    const presetName = name.slice(0, CUSTOM_PRESET_NAME_MAX);
    result[presetName] = normalizeTasks(raw[key]);
    count += 1;
  }

  return result;
}

export function createBackupPayload(state) {
  return {
    version: BACKUP_VERSION,
    app: 'NeatClock',
    exportedAt: new Date().toISOString(),
    tasks: state.tasks,
    activePreset: state.activePreset,
    customPresets: state.customPresets,
    preferences: {
      theme: state.theme,
      showExportPreview: state.showExportPreview,
      startOffsetWeeks: state.startOffsetWeeks,
    },
  };
}

export function validateBackup(data) {
  if (!data || typeof data !== 'object') {
    return { ok: false, error: 'File is not a valid NeatClock backup.' };
  }
  if (data.app !== 'NeatClock') {
    return { ok: false, error: 'This file is not a NeatClock backup.' };
  }
  if (!Array.isArray(data.tasks)) {
    return { ok: false, error: 'Backup is missing task list.' };
  }
  if (typeof data.activePreset !== 'string') {
    return { ok: false, error: 'Backup is missing active preset.' };
  }
  const tasks = normalizeTasks(data.tasks);
  const customPresets = normalizeCustomPresets(data.customPresets);
  const activePreset = resolveActivePreset(data.activePreset, customPresets);

  return {
    ok: true,
    data: {
      ...data,
      tasks,
      customPresets,
      activePreset,
    },
  };
}
