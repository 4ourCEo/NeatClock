import { useEffect, useCallback } from 'react';
import { persistState } from '../lib/storage.js';
import { THEME_CLASSES } from '../lib/themes.js';

export const STORAGE_SAVE_MESSAGE = 'Could not save your schedule in this browser. Export a backup JSON.';

export function useSchedulePersistence({
  tasks,
  customPresets,
  activePreset,
  theme,
  showExportPreview,
  startOffsetWeeks,
  setNotification,
}) {
  const scheduleStorageFailureNotice = useCallback(() => {
    queueMicrotask(() => setNotification(STORAGE_SAVE_MESSAGE));
  }, [setNotification]);

  useEffect(() => {
    persistState('neatclock_start_offset', String(startOffsetWeeks), scheduleStorageFailureNotice);
  }, [startOffsetWeeks, scheduleStorageFailureNotice]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      persistState('neatclock_tasks', JSON.stringify(tasks), scheduleStorageFailureNotice);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [tasks, scheduleStorageFailureNotice]);

  useEffect(() => {
    persistState('neatclock_show_export_preview', String(showExportPreview), scheduleStorageFailureNotice);
  }, [showExportPreview, scheduleStorageFailureNotice]);

  useEffect(() => {
    persistState('neatclock_active_preset', activePreset, scheduleStorageFailureNotice);
  }, [activePreset, scheduleStorageFailureNotice]);

  useEffect(() => {
    persistState('neatclock_custom_presets', JSON.stringify(customPresets), scheduleStorageFailureNotice);
  }, [customPresets, scheduleStorageFailureNotice]);

  useEffect(() => {
    document.documentElement.classList.remove(...THEME_CLASSES);
    document.body.classList.remove(...THEME_CLASSES);
    document.documentElement.classList.add(theme);
    document.body.classList.add(theme);
    persistState('neatclock_theme', theme, scheduleStorageFailureNotice);
  }, [theme, scheduleStorageFailureNotice]);
}
