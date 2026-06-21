import { normalizeTasks, resolveActivePreset } from './tasks.js';

export const BACKUP_VERSION = 1;

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
  if (!data.customPresets || typeof data.customPresets !== 'object' || Array.isArray(data.customPresets)) {
    return { ok: false, error: 'Backup is missing custom presets.' };
  }

  const tasks = normalizeTasks(data.tasks);
  const activePreset = resolveActivePreset(data.activePreset, data.customPresets);

  return {
    ok: true,
    data: {
      ...data,
      tasks,
      activePreset,
    },
  };
}
