import { useRef } from 'react';
import { buildIcsContent } from '../lib/buildIcs.js';
import { createBackupPayload, validateBackup } from '../lib/backup.js';
import { downloadText } from '../lib/download.js';
import { ALLOWED_THEMES } from '../lib/themes.js';
import { features } from '../config/features.js';
import { trackEvent } from '../lib/analytics.js';

export const MAX_BACKUP_BYTES = 512 * 1024;

export function useExportActions({
  tasks,
  activePreset,
  customPresets,
  theme,
  showExportPreview,
  startOffsetWeeks,
  setTasks,
  setActivePreset,
  setCustomPresets,
  setTheme,
  setShowExportPreview,
  setStartOffsetWeeks,
  setConfirmModal,
  setExportSuccessOpen,
  showNotification,
}) {
  const importInputRef = useRef(null);

  const handleExportICS = () => {
    if (tasks.length === 0) {
      showNotification('Please add at least one task to export.');
      return;
    }

    const icsContent = buildIcsContent(tasks, {
      startOffsetWeeks,
      includeAffiliateHints: features.affiliateLinks,
    });

    if (!icsContent) {
      showNotification('Could not build calendar file.');
      return;
    }

    downloadText(icsContent, 'neatclock-schedule.ics', 'text/calendar;charset=utf-8');
    trackEvent('ics_export', { preset: activePreset, tasks: tasks.length });
    setExportSuccessOpen(true);
    showNotification('Downloaded neatclock-schedule.ics');
  };

  const handleExportBackup = () => {
    const payload = createBackupPayload({
      tasks,
      activePreset,
      customPresets,
      theme,
      showExportPreview,
      startOffsetWeeks,
    });
    downloadText(JSON.stringify(payload, null, 2), 'neatclock-backup.json', 'application/json');
    trackEvent('backup_export', { preset: activePreset });
    showNotification('Downloaded schedule backup');
  };

  const handleImportBackupClick = () => {
    importInputRef.current?.click();
  };

  const handleImportBackupFile = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (file.size > MAX_BACKUP_BYTES) {
      showNotification('Backup file is too large.');
      return;
    }

    const reader = new FileReader();
    reader.onerror = () => {
      showNotification('Could not read backup file.');
    };
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result));
        const result = validateBackup(parsed);
        if (!result.ok) {
          showNotification(result.error);
          return;
        }

        const { data } = result;
        setConfirmModal({
          title: 'Restore backup?',
          message: 'This replaces your current schedule, custom presets, and preferences with the backup file.',
          onConfirm: () => {
            setTasks(data.tasks);
            setActivePreset(data.activePreset);
            setCustomPresets(data.customPresets);
            if (ALLOWED_THEMES.has(data.preferences?.theme)) {
              setTheme(data.preferences.theme);
            }
            if (typeof data.preferences?.showExportPreview === 'boolean') {
              setShowExportPreview(data.preferences.showExportPreview);
            }
            if (typeof data.preferences?.startOffsetWeeks === 'number') {
              const offset = data.preferences.startOffsetWeeks;
              setStartOffsetWeeks(Number.isNaN(offset) ? 0 : Math.min(12, Math.max(0, offset)));
            }
            showNotification('Schedule restored from backup');
            setConfirmModal(null);
          },
        });
      } catch {
        showNotification('Could not read backup file.');
      }
    };
    reader.readAsText(file);
  };

  const handlePrint = () => {
    window.print();
  };

  return {
    importInputRef,
    handleExportICS,
    handleExportBackup,
    handleImportBackupClick,
    handleImportBackupFile,
    handlePrint,
  };
}
