import { useState, useMemo, useRef } from 'react';
import { Plus, Download, Printer, Sparkles, X, Calendar, Upload } from 'lucide-react';
import { buildIcsContent } from './lib/buildIcs.js';
import { createBackupPayload, normalizeCustomPresets, validateBackup } from './lib/backup.js';
import { downloadText } from './lib/download.js';
import { storageGet } from './lib/storage.js';
import {
  clampInterval,
  createTaskId,
  normalizeTasks,
  normalizeUnit,
  parseNaturalLanguage,
  resolveActivePreset,
  TASK_NAME_MAX,
} from './lib/tasks.js';
import { ALLOWED_THEMES, resolveTheme } from './lib/themes.js';
import { calculateFirstOccurrence } from './lib/schedulePreview.js';
import { features } from './config/features.js';
import { PRESETS, presetCardLabel } from './config/presets.js';
import { ExportExtras, PrintsFooterCta, SiteFooter } from './components/SiteExtras.jsx';
import { MonetizationPreviewBanner } from './components/FeatureGate.jsx';
import InterestModal from './components/InterestModal.jsx';
import { InterestExportSection } from './components/InterestInvite.jsx';
import AppHeader from './components/AppHeader.jsx';
import TaskTable from './components/TaskTable.jsx';
import { useNotifications } from './hooks/useNotifications.js';
import { useSchedulePersistence } from './hooks/useSchedulePersistence.js';

const MAX_BACKUP_BYTES = 512 * 1024;

function App() {
  // Main Tasks List State
  const [tasks, setTasks] = useState(() => {
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
  });

  // Active Preset Tracking
  const [customPresets, setCustomPresets] = useState(() => {
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
  });

  const [activePreset, setActivePreset] = useState(() => {
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
  });

  // UI Modes & Aesthetic Themes
  const [printPreview, setPrintPreview] = useState(false);
  const [theme, setTheme] = useState(() => {
    const savedTheme = storageGet('neatclock_theme');
    const legacyDark = storageGet('neatclock_dark_mode') === 'true';
    return resolveTheme(savedTheme, legacyDark);
  });
  const { notification, setNotification, showNotification } = useNotifications();
  const [confirmModal, setConfirmModal] = useState(null);
  const [presetModalOpen, setPresetModalOpen] = useState(false);
  const [presetNameInput, setPresetNameInput] = useState('');
  const [presetNameError, setPresetNameError] = useState('');
  const [exportSuccessOpen, setExportSuccessOpen] = useState(false);
  const [interestOpen, setInterestOpen] = useState(false);
  const [interestSource, setInterestSource] = useState('footer');
  const [showExportPreview, setShowExportPreview] = useState(() => {
    const saved = storageGet('neatclock_show_export_preview');
    if (saved !== null) return saved === 'true';
    const legacy = storageGet('neatclock_show_agenda');
    return legacy === 'true';
  });

  // Natural Language Creator State
  const [nlInput, setNlInput] = useState('');
  const parsedNl = useMemo(() => parseNaturalLanguage(nlInput), [nlInput]);

  // Seasonal Offset State
  const [startOffsetWeeks, setStartOffsetWeeks] = useState(() => {
    const saved = storageGet('neatclock_start_offset');
    const parsed = saved ? parseInt(saved, 10) : 0;
    return Number.isNaN(parsed) ? 0 : Math.min(12, Math.max(0, parsed));
  });

  const importInputRef = useRef(null);

  useSchedulePersistence({
    tasks,
    customPresets,
    activePreset,
    theme,
    showExportPreview,
    startOffsetWeeks,
    setNotification,
  });

  // Add Natural Language Task
  const handleAddNlTask = () => {
    if (!parsedNl) return;
    const newTask = {
      id: createTaskId(),
      name: parsedNl.name,
      interval: parsedNl.interval,
      unit: parsedNl.unit,
    };
    setTasks([...tasks, newTask]);
    setNlInput('');
    showNotification(`Added: "${newTask.name}"`);
  };

  const moveTask = (index, direction) => {
    const target = index + direction;
    if (target < 0 || target >= tasks.length) return;
    const updated = [...tasks];
    const [item] = updated.splice(index, 1);
    updated.splice(target, 0, item);
    setTasks(updated);
  };

  // Google Calendar Link generator
  const getGoogleCalLink = (task) => {
    let freq = 'MONTHLY';
    if (task.unit === 'weeks') freq = 'WEEKLY';
    if (task.unit === 'years') freq = 'YEARLY';
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(task.name)}&recur=RRULE:FREQ=${freq};INTERVAL=${task.interval}`;
  };

  // Outlook Calendar Link generator
  const getOutlookCalLink = (task) => {
    let freq = 'MONTHLY';
    if (task.unit === 'weeks') freq = 'WEEKLY';
    if (task.unit === 'years') freq = 'YEARLY';
    return `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(task.name)}&rrule=FREQ=${freq};INTERVAL=${task.interval}`;
  };

  // Preset Selection
  const handlePresetSelect = (presetName, isCustom = false) => {
    const presetTasks = isCustom ? customPresets[presetName] : PRESETS[presetName];
    if (!presetTasks) return;

    const currentClean = tasks.map(t => ({ name: t.name, interval: t.interval, unit: t.unit }));
    const presetClean = presetTasks.map(t => ({ name: t.name, interval: t.interval, unit: t.unit }));

    // Switch silently if identical to avoid modal friction
    if (JSON.stringify(currentClean) === JSON.stringify(presetClean)) {
      setActivePreset(presetName);
      return;
    }

    setConfirmModal({
      title: 'Overwrite current list?',
      message: `You are loading the "${presetName}" preset. This will replace your active schedule list.`,
      onConfirm: () => {
        setTasks(presetTasks.map(t => ({ ...t })));
        setActivePreset(presetName);
        showNotification(`Loaded ${presetName} preset`);
        setConfirmModal(null);
      }
    });
  };

  // Add Custom Preset template
  const handleSavePreset = () => {
    setPresetNameInput('');
    setPresetNameError('');
    setPresetModalOpen(true);
  };

  const submitSavePreset = () => {
    const cleanName = presetNameInput.trim();
    if (!cleanName) {
      setPresetNameError('Preset name cannot be empty.');
      return;
    }

    if (PRESETS[cleanName] || customPresets[cleanName]) {
      setPresetNameError('A preset with that name already exists. Please choose a unique name.');
      return;
    }

    const updated = {
      ...customPresets,
      [cleanName]: tasks.map(t => ({ ...t }))
    };
    setCustomPresets(updated);
    setActivePreset(cleanName);
    setPresetModalOpen(false);
    showNotification(`Saved "${cleanName}" preset`);
  };

  // Delete Custom Preset template
  const handleDeletePreset = (presetName, e) => {
    e.stopPropagation(); // Avoid triggering load
    setConfirmModal({
      title: 'Delete Preset?',
      message: `Are you sure you want to delete the custom preset "${presetName}"?`,
      onConfirm: () => {
        const updated = { ...customPresets };
        delete updated[presetName];
        setCustomPresets(updated);

        if (activePreset === presetName) {
          setTasks([...PRESETS["Homeowner's Sentinel"]]);
          setActivePreset("Homeowner's Sentinel");
        }
        showNotification(`Deleted preset "${presetName}"`);
        setConfirmModal(null);
      }
    });
  };

  // Task Mutations
  const handleAddTask = () => {
    const newTask = {
      id: createTaskId(),
      name: 'New Custom Task',
      interval: 3,
      unit: 'months',
    };
    setTasks([...tasks, newTask]);
    showNotification('Added new task');
  };

  const handleDeleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const handleUpdateTaskName = (id, newName) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, name: newName.slice(0, TASK_NAME_MAX) } : task
    ));
  };

  const handleUpdateTaskInterval = (id, newInterval) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, interval: clampInterval(newInterval) } : task
    ));
  };

  const handleUpdateTaskUnit = (id, newUnit) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, unit: normalizeUnit(newUnit) } : task
    ));
  };

  const handleReset = () => {
    setConfirmModal({
      title: 'Reset to defaults?',
      message: 'This will revert your active tasks to the default Homeowner\'s Sentinel list and clear all progress.',
      onConfirm: () => {
        setTasks(PRESETS["Homeowner's Sentinel"].map(t => ({ ...t })));
        setActivePreset("Homeowner's Sentinel");
        showNotification('Reset to defaults');
        setConfirmModal(null);
      }
    });
  };

  const exportPreview = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const occurrences = tasks.map(task => {
      const firstDate = calculateFirstOccurrence(task);
      const isValid = !isNaN(firstDate.getTime());

      const daysUntil = isValid
        ? Math.ceil((firstDate - today) / (1000 * 60 * 60 * 24))
        : 0;

      return {
        task,
        firstDate,
        daysUntil,
        formattedDate: isValid
          ? firstDate.toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
          : 'Invalid Date',
      };
    });

    occurrences.sort((a, b) => a.firstDate - b.firstDate);
    return occurrences.slice(0, 10);
  }, [tasks]);

  // .ics File Generator Engine (all-day dates — calendar-friendly)
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

  const scrollToPresets = () => {
    setExportSuccessOpen(false);
    document.getElementById('preset-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const openInterest = (source) => {
    setInterestSource(source);
    setInterestOpen(true);
  };

  return (
    <div className="app-canvas min-h-screen py-6 md:py-12 transition-colors duration-500 relative text-theme-text font-sans">
      <MonetizationPreviewBanner />

      {/* Organic Paper Grain Texture Overlay */}
      <div className="pointer-events-none fixed inset-0 opacity-[0.025] mix-blend-overlay z-50 bg-[url('data:image/svg+xml;utf8,<svg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22><filter id=%22noiseFilter%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/></filter><rect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/></svg>')]"></div>

      {/* Toast Notification */}
      {notification && (
        <div className="toast-fixed fixed bg-theme-text text-theme-bg px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 text-sm font-medium z-50 animate-toast-in no-print border border-theme-border/20 max-w-[calc(100vw-2rem)]">
          <Sparkles className="w-4 h-4 text-theme-accent animate-pulse" />
          {notification}
        </div>
      )}

      {/* Custom Confirmation Modal */}
      {confirmModal && (
        <div className="modal-overlay no-print" role="dialog" aria-modal="true" aria-labelledby="confirm-modal-title">
          <div className="modal-backdrop" aria-hidden="true" />
          <div className="modal-panel-wrap">
            <div className="modal-panel md:p-8 transition-all duration-300 animate-slide-up">
              <h3 id="confirm-modal-title" className="font-serif text-xl font-semibold mb-3 text-theme-text">
                {confirmModal.title}
              </h3>
              <p className="text-sm text-theme-text-muted mb-6 leading-relaxed">
                {confirmModal.message}
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setConfirmModal(null)}
                  className="px-4 py-2 text-xs font-medium rounded border cursor-pointer border-theme-border bg-theme-card hover:bg-theme-bg/60 text-theme-text focus:outline-none transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmModal.onConfirm}
                  className="btn-primary px-4 py-2 text-xs font-medium rounded cursor-pointer shadow-sm focus:outline-none transition-colors inline-flex items-center justify-center"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Preset Name Modal */}
      {presetModalOpen && (
        <div className="modal-overlay no-print" role="dialog" aria-modal="true">
          <div className="modal-backdrop" aria-hidden="true" />
          <div className="modal-panel-wrap">
            <div className="modal-panel md:p-8 transition-all duration-300 animate-slide-up">
            <h3 className="font-serif text-xl font-semibold mb-3 text-theme-text">
              Save Current Preset
            </h3>
            <p className="text-xs text-theme-text-muted mb-4 leading-relaxed">
              Enter a unique name for your custom recurring task list preset:
            </p>
            <div className="mb-4">
              <input
                id="input-preset-name"
                type="text"
                value={presetNameInput}
                onChange={(e) => {
                  setPresetNameInput(e.target.value);
                  setPresetNameError('');
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') submitSavePreset();
                }}
                placeholder="e.g. Monthly Cleaning, Auto Maintenance"
                className="w-full px-3 py-2 text-sm rounded border bg-transparent border-theme-border text-theme-text focus:outline-none focus:border-theme-accent transition-colors"
                autoFocus
              />
              {presetNameError && (
                <p className="text-red-500 text-xs mt-1.5 font-medium">{presetNameError}</p>
              )}
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setPresetModalOpen(false)}
                className="px-4 py-2 text-xs font-medium rounded border cursor-pointer border-theme-border bg-theme-card hover:bg-theme-bg/60 text-theme-text focus:outline-none transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitSavePreset}
                className="btn-primary px-4 py-2 text-xs font-medium rounded cursor-pointer shadow-sm focus:outline-none transition-colors inline-flex items-center justify-center"
              >
                Save Preset
              </button>
            </div>
            </div>
          </div>
        </div>
      )}

      {/* Export Success Modal */}
      {exportSuccessOpen && (
        <div className="modal-overlay no-print" role="dialog" aria-modal="true">
          <div className="modal-backdrop" aria-hidden="true" />
          <div className="modal-panel-wrap">
            <div className="modal-panel modal-panel-lg md:p-8 transition-all duration-300 animate-slide-up">
            <h3 className="font-serif text-xl font-semibold mb-2 text-theme-text">
              Calendar downloaded
            </h3>
            <p className="text-sm text-theme-text-muted mb-5 leading-relaxed">
              Your <strong className="text-theme-text">neatclock-schedule.ics</strong> file is ready. Import it into your calendar app:
            </p>
            <ul className="text-xs text-theme-text-muted space-y-2.5 mb-6 leading-relaxed">
              <li><strong className="text-theme-text">Google Calendar:</strong> Settings → Import &amp; export → Import</li>
              <li><strong className="text-theme-text">Apple Calendar:</strong> File → Import → select the .ics file</li>
              <li><strong className="text-theme-text">Outlook:</strong> Add calendar → Upload from file</li>
            </ul>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => {
                  setExportSuccessOpen(false);
                  handlePrint();
                }}
                className="flex-1 px-4 py-3 text-sm font-medium rounded-lg border cursor-pointer border-theme-border bg-theme-card hover:bg-theme-bg/60 text-theme-text transition-colors flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                Print Checklist
              </button>
              <button
                type="button"
                onClick={scrollToPresets}
                className="btn-primary flex flex-1 items-center justify-center px-4 py-3 text-sm font-medium rounded-lg cursor-pointer shadow-sm"
              >
                Try Another Preset
              </button>
            </div>
            <button
              type="button"
              onClick={() => setExportSuccessOpen(false)}
              className="w-full mt-3 px-4 py-2 text-xs font-medium text-theme-text-muted hover:text-theme-text cursor-pointer transition-colors"
            >
              Keep editing this schedule
            </button>
            <ExportExtras
              activePreset={activePreset}
              onPrint={() => { setExportSuccessOpen(false); handlePrint(); }}
            />
            <InterestExportSection onOpen={() => openInterest('export')} />
            </div>
          </div>
        </div>
      )}

      {interestOpen && (
        <InterestModal
          onClose={() => setInterestOpen(false)}
          activePreset={activePreset}
          source={interestSource}
        />
      )}

      <input
        ref={importInputRef}
        type="file"
        accept="application/json,.json"
        className="hidden"
        onChange={handleImportBackupFile}
        aria-hidden="true"
        tabIndex={-1}
      />

      {/* Main Page Layout Wrapper */}
      <main className={`mx-auto transition-all duration-500 print-area ${printPreview ? 'print-preview-mode print-paper-3d' : 'main-card max-w-5xl p-5 sm:p-8 md:p-12 rounded-2xl'}`}>

        <AppHeader theme={theme} setTheme={setTheme} />

        {/* Presets and Controls (no-print) */}
        <section className="no-print mb-8">
          <div className="flex flex-col gap-6">
            {/* Presets Row */}
            <div id="preset-section">
              <span className="block text-xs font-semibold uppercase tracking-wider text-theme-text-muted mb-3 text-center md:text-left">
                Select Schedule Preset
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {/* Default Presets */}
                {Object.entries(PRESETS).map(([presetName, presetTasks]) => {
                  const isActive = activePreset === presetName;
                  let Icon = Calendar; // Default

                  if (presetName.includes("Homeowner")) {
                    Icon = (props) => (
                      <svg className={props.className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    );
                  } else if (presetName.includes("Gearhead")) {
                    Icon = (props) => (
                      <svg className={props.className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    );
                  } else if (presetName.includes("CFO")) {
                    Icon = (props) => (
                      <svg className={props.className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M12 16v1M10 21h4a2 2 0 002-2V7a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    );
                  }

                  return (
                    <button
                      key={presetName}
                      id={`preset-${presetName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                      onClick={() => handlePresetSelect(presetName, false)}
                      className={`p-4 rounded-xl border text-left transition-all duration-300 cursor-pointer flex flex-col justify-between h-28 relative overflow-hidden group ${
                        isActive
                          ? 'bg-theme-accent/15 border-theme-accent text-theme-text shadow-[var(--theme-shadow-md)] ring-1 ring-theme-accent/40'
                          : 'bg-theme-card border-theme-border text-theme-text shadow-[var(--theme-shadow-sm)] hover:border-theme-text-muted hover:shadow-[var(--theme-shadow-md)]'
                      }`}
                    >
                      <div className="flex justify-between items-start w-full">
                        <Icon className={`w-6 h-6 transition-transform group-hover:scale-110 ${isActive ? 'text-theme-accent' : 'text-theme-text-muted'}`} />
                        <span className="text-[9px] uppercase font-bold tracking-widest opacity-60">Template</span>
                      </div>
                      <div>
                        <h3 className="font-serif text-sm font-semibold leading-snug mb-1 line-clamp-2">{presetCardLabel(presetName)}</h3>
                        <p className="text-[10px] text-theme-text-muted truncate">{presetTasks.length} tasks</p>
                      </div>
                      <div className="absolute -bottom-6 -right-6 w-12 h-12 rounded-full bg-theme-accent/5 filter blur-md group-hover:scale-150 transition-all duration-500" />
                    </button>
                  );
                })}

                {/* Custom Saved Presets */}
                {Object.keys(customPresets).map((presetName) => {
                  const isActive = activePreset === presetName;
                  const presetTasks = customPresets[presetName];
                  return (
                    <div
                      key={presetName}
                      className={`rounded-xl border text-left transition-all duration-300 flex flex-col justify-between h-28 relative overflow-hidden group ${
                        isActive
                          ? 'bg-theme-accent/15 border-theme-accent text-theme-text shadow-[var(--theme-shadow-md)] ring-1 ring-theme-accent/40'
                          : 'bg-theme-card border-theme-border text-theme-text shadow-[var(--theme-shadow-sm)] hover:border-theme-text-muted hover:shadow-[var(--theme-shadow-md)]'
                      }`}
                    >
                      <button
                        onClick={() => handlePresetSelect(presetName, true)}
                        className="p-4 w-full h-full flex flex-col justify-between text-left cursor-pointer focus:outline-none"
                      >
                        <div className="flex justify-between items-start w-full">
                          <svg className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-theme-accent' : 'text-theme-text-muted'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.24.588 1.81l-3.97 2.883a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.971-2.883a1 1 0 00-1.175 0l-3.97 2.883c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h4.907a1 1 0 00.95-.69l1.519-4.674z" />
                          </svg>
                          <span className="text-[9px] uppercase font-bold tracking-widest opacity-60">Custom</span>
                        </div>
                        <div>
                          <h3 className="font-serif text-sm font-semibold truncate leading-none mb-1">{presetName}</h3>
                          <p className="text-[10px] text-theme-text-muted truncate">{presetTasks.length} tasks</p>
                        </div>
                      </button>
                      <button
                        onClick={(e) => handleDeletePreset(presetName, e)}
                        className="absolute top-2.5 right-2.5 text-theme-text-muted hover:text-red-500 cursor-pointer focus:outline-none p-1 z-10 transition-colors"
                        title={`Delete custom preset ${presetName}`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                      <div className="absolute -bottom-6 -right-6 w-12 h-12 rounded-full bg-theme-accent/5 filter blur-md group-hover:scale-150 transition-all duration-500" />
                    </div>
                  );
                })}

                {/* Save Preset Card */}
                <button
                  onClick={handleSavePreset}
                  className="p-4 rounded-xl border border-dashed border-theme-accent/40 hover:border-theme-accent bg-theme-bg/10 hover:bg-theme-bg/30 text-theme-accent transition-all duration-300 cursor-pointer flex flex-col justify-center items-center h-28 text-center group focus:outline-none"
                  title="Save current tasks as preset template"
                >
                  <Plus className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform" />
                  <span className="font-serif text-sm font-semibold leading-none">Save Preset</span>
                </button>
              </div>
            </div>

            {/* View Mode Controls */}
            <div className="flex flex-wrap gap-x-5 gap-y-3 items-center justify-between border-t pt-5 border-theme-border/60">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xs font-semibold uppercase tracking-wider text-theme-text-muted">
                  Current View:
                </span>
                <span className="text-sm font-medium px-2.5 py-1 rounded bg-theme-accent/15 text-theme-text ring-1 ring-theme-accent/30">
                  {activePreset}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 sm:gap-4">
                <button
                  onClick={() => setShowExportPreview(!showExportPreview)}
                  className={`px-4 py-2 text-xs font-medium rounded-lg border flex items-center gap-2 transition-all cursor-pointer ${
                    showExportPreview
                      ? 'bg-theme-accent/15 border-theme-border text-theme-text font-semibold ring-1 ring-theme-accent/30'
                      : 'border-theme-border hover:bg-theme-bg/60 text-theme-text-muted bg-theme-card'
                  }`}
                  title="Preview when tasks would first appear if you export today"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  {showExportPreview ? 'Hide Preview' : 'Show Export Preview'}
                </button>
                <button
                  id="btn-print-preview-toggle"
                  onClick={() => setPrintPreview(!printPreview)}
                  className={`px-4 py-2 text-xs font-medium rounded-lg border flex items-center gap-2 transition-all cursor-pointer ${
                    printPreview
                      ? 'bg-theme-accent text-white border-theme-accent hover:bg-theme-accent-hover'
                      : 'border-theme-border hover:bg-theme-bg/60 text-theme-text-muted bg-theme-card'
                  }`}
                >
                  <Printer className="w-3.5 h-3.5" />
                  {printPreview ? 'Interactive View' : 'Printer Friendly View'}
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 text-xs font-medium rounded-lg border border-theme-border bg-theme-card text-theme-text-muted hover:bg-theme-bg/60 cursor-pointer transition-colors"
                  title="Reset schedule to defaults"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Responsive Workspace Grid */}
        <div className={`grid grid-cols-1 ${showExportPreview ? 'lg:grid-cols-3' : 'lg:grid-cols-1'} gap-8`}>

          {/* Task Sheet Table */}
          <section className={showExportPreview ? 'lg:col-span-2' : 'lg:col-span-1'}>

            {/* Natural Language Task Input (no-print) */}
            {!printPreview && (
              <div className="no-print mb-6">
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={nlInput}
                    onChange={(e) => setNlInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddNlTask();
                    }}
                    placeholder="Type to create task, e.g. Wash car every 2 weeks or Check batteries every year"
                    className="w-full pl-4 pr-16 py-3 rounded-xl border border-theme-border surface-well focus:bg-theme-card focus:outline-none focus:border-theme-accent focus:ring-1 focus:ring-theme-accent text-sm font-sans transition-all text-theme-text placeholder-theme-text-muted/60"
                  />
                  {parsedNl && (
                    <button
                      onClick={handleAddNlTask}
                      className="absolute right-2 bg-theme-accent hover:bg-theme-accent-hover text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-colors focus:outline-none cursor-pointer"
                    >
                      Add
                    </button>
                  )}
                </div>
                {parsedNl && (
                  <p className="text-xs text-theme-text-muted mt-2 pl-2 animate-fade-in flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-theme-accent animate-pulse" />
                    <span>Ready to add: <strong className="text-theme-text">"{parsedNl.name}"</strong> repeating every <strong className="text-theme-text">{parsedNl.interval} {parsedNl.unit}</strong></span>
                  </p>
                )}
              </div>
            )}

            {tasks.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-theme-border/60 rounded-xl bg-theme-card/30">
                <p className="text-theme-text-muted font-serif italic mb-3">Your schedule is currently empty.</p>
                <button
                  onClick={handleAddTask}
                  className="no-print bg-theme-card border border-theme-border hover:border-theme-accent text-theme-text px-4 py-2 rounded text-sm flex items-center gap-1.5 mx-auto cursor-pointer focus:outline-none transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add your first task
                </button>
              </div>
            ) : (
              <TaskTable
                tasks={tasks}
                setTasks={setTasks}
                printPreview={printPreview}
                onUpdateTaskName={handleUpdateTaskName}
                onUpdateTaskInterval={handleUpdateTaskInterval}
                onUpdateTaskUnit={handleUpdateTaskUnit}
                onDeleteTask={handleDeleteTask}
                onMoveTask={moveTask}
                getGoogleCalLink={getGoogleCalLink}
                getOutlookCalLink={getOutlookCalLink}
              />
            )}

            {/* Add custom task row (hidden in print preview/printing) */}
            {!printPreview && (
              <button
                id="btn-add-task"
                onClick={handleAddTask}
                className="no-print w-full py-3.5 border border-dashed rounded-xl transition-all flex items-center justify-center gap-2 text-sm font-medium mb-4 mt-4 cursor-pointer border-theme-border hover:border-theme-accent bg-theme-bg/10 hover:bg-theme-bg/25 text-theme-text-muted hover:text-theme-text focus:outline-none"
              >
                <Plus className="w-4 h-4" />
                Add Custom Task
              </button>
            )}
          </section>

          {/* Export Preview Sidebar */}
          {showExportPreview && (
            <aside className="lg:col-span-1 print-area">
              <div className="surface-panel p-6 transition-all duration-300">
                <h2 className="font-serif text-lg font-semibold tracking-tight border-b pb-3 mb-2 border-theme-border/60 text-theme-text">
                  Export Preview
                </h2>
                <p className="text-[11px] text-theme-text-muted mb-4 leading-relaxed">
                  If you export today, recurring events would first appear around these dates. This is a preview — not a to-do list.
                </p>

                {exportPreview.length === 0 ? (
                  <p className="text-xs text-theme-text-muted italic">Add tasks to see a preview.</p>
                ) : (
                  <div className="flex flex-col gap-4">
                    {exportPreview.map(({ task, formattedDate, daysUntil }, idx) => (
                      <div
                        key={`${task.id}-preview-${idx}`}
                        className="flex gap-3 items-start border-l-2 pl-3 py-1 animate-slide-up border-theme-accent/60"
                      >
                        <div className="flex-1 min-w-0">
                          <h3 className="font-serif text-sm font-medium truncate text-theme-text">
                            {task.name}
                          </h3>
                          <div className="flex flex-wrap gap-1.5 items-center mt-1 text-[11px] text-theme-text-muted">
                            <span>{formattedDate}</span>
                            <span className="opacity-40">•</span>
                            <span>
                              ~{daysUntil} day{daysUntil === 1 ? '' : 's'} from today
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </aside>
          )}

        </div>

        {/* Footer Actions (Export & Print trigger) */}
        <footer className="footer-safe border-t border-theme-border/60 pt-8 md:pt-10 mt-8 md:mt-10 flex flex-col items-center gap-8 no-print w-full">
          {/* Start Offset — centered */}
          {!printPreview && (
            <div className="surface-panel w-full max-w-md mx-auto px-6 py-5 text-center">
              <span className="font-semibold text-theme-text flex items-center justify-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-theme-accent" />
                Start Offset: {startOffsetWeeks === 0 ? 'Today' : `+${startOffsetWeeks} Week${startOffsetWeeks > 1 ? 's' : ''}`}
              </span>
              <input
                type="range"
                min="0"
                max="12"
                value={startOffsetWeeks}
                onChange={(e) => {
                  const parsed = parseInt(e.target.value, 10);
                  setStartOffsetWeeks(Number.isNaN(parsed) ? 0 : Math.min(12, Math.max(0, parsed)));
                }}
                className="offset-slider w-full max-w-xs mx-auto mt-4 block"
                aria-label="Weeks to offset calendar export start date"
              />
              <span className="text-[11px] text-theme-text-muted mt-3 block leading-relaxed max-w-xs mx-auto">
                Offsets the start date of all events in your exported calendar file.
              </span>
            </div>
          )}

          {!printPreview && (
            <div className="flex flex-wrap gap-3 justify-center w-full max-w-sm">
              <button
                type="button"
                onClick={handleExportBackup}
                className="flex-1 min-w-[140px] px-4 py-2.5 text-xs font-medium rounded-lg border cursor-pointer border-theme-border bg-theme-card hover:bg-theme-bg/60 text-theme-text transition-colors flex items-center justify-center gap-2 shadow-[var(--theme-shadow-sm)] hover:shadow-[var(--theme-shadow-md)]"
                title="Download a JSON backup of your schedule"
              >
                <Download className="w-3.5 h-3.5" />
                Backup
              </button>
              <button
                type="button"
                onClick={handleImportBackupClick}
                className="flex-1 min-w-[140px] px-4 py-2.5 text-xs font-medium rounded-lg border cursor-pointer border-theme-border bg-theme-card hover:bg-theme-bg/60 text-theme-text transition-colors flex items-center justify-center gap-2 shadow-[var(--theme-shadow-sm)] hover:shadow-[var(--theme-shadow-md)]"
                title="Restore from a JSON backup file"
              >
                <Upload className="w-3.5 h-3.5" />
                Restore
              </button>
            </div>
          )}

          <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center w-full">
            <button
              id="btn-print"
              onClick={handlePrint}
              className="px-6 py-3 border font-medium rounded-lg text-sm transition-all flex items-center justify-center gap-2 cursor-pointer border-theme-border bg-theme-card hover:bg-theme-bg/60 text-theme-text min-w-[180px] shadow-[var(--theme-shadow-sm)] hover:shadow-[var(--theme-shadow-md)]"
            >
              <Printer className="w-4 h-4" />
              Print Checklist
            </button>
            <button
              id="btn-export-ics"
              onClick={handleExportICS}
              className="px-7 py-3 bg-theme-accent hover:bg-theme-accent-hover text-white font-medium rounded-lg text-sm transition-all flex items-center justify-center gap-2 cursor-pointer min-w-[220px] shadow-[var(--theme-shadow-md)] hover:shadow-[var(--theme-shadow-lg)]"
            >
              <Download className="w-4 h-4" />
              Generate & Export .ics
            </button>
          </div>
        </footer>

        <PrintsFooterCta activePreset={activePreset} />
        <SiteFooter onOpenInterest={() => openInterest('footer')} />
      </main>
    </div>
  );
}

export default App;
