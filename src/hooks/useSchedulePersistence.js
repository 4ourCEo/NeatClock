import { useEffect, useCallback, useRef } from 'react';
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
  const tasksRef = useRef(tasks);
  const pendingTasksSaveRef = useRef(false);

  useEffect(() => {
    tasksRef.current = tasks;
  }, [tasks]);

  const scheduleStorageFailureNotice = useCallback(() => {
    queueMicrotask(() => setNotification(STORAGE_SAVE_MESSAGE));
  }, [setNotification]);

  const flushTasks = useCallback(() => {
    persistState('neatclock_tasks', JSON.stringify(tasksRef.current), scheduleStorageFailureNotice);
    pendingTasksSaveRef.current = false;
  }, [scheduleStorageFailureNotice]);

  const flushTasksIfPending = useCallback(() => {
    if (pendingTasksSaveRef.current) {
      flushTasks();
    }
  }, [flushTasks]);

  useEffect(() => {
    persistState('neatclock_start_offset', String(startOffsetWeeks), scheduleStorageFailureNotice);
  }, [startOffsetWeeks, scheduleStorageFailureNotice]);

  useEffect(() => {
    pendingTasksSaveRef.current = true;
    const timeoutId = setTimeout(() => {
      flushTasks();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [tasks, flushTasks]);

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

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        flushTasksIfPending();
      }
    };

    const onBeforeUnload = () => {
      flushTasksIfPending();
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('beforeunload', onBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('beforeunload', onBeforeUnload);
    };
  }, [flushTasksIfPending]);
}
