import { useState, useMemo } from 'react';
import { PRESETS } from '../config/presets.js';
import {
  clampInterval,
  createTaskId,
  normalizeUnit,
  parseNaturalLanguage,
  TASK_NAME_MAX,
} from '../lib/tasks.js';
import {
  loadInitialTasks,
  loadInitialCustomPresets,
  loadInitialActivePreset,
  loadInitialTheme,
  loadInitialShowExportPreview,
  loadInitialStartOffsetWeeks,
} from './useScheduleBootstrap.js';

export function useScheduleState({ showNotification }) {
  const [tasks, setTasks] = useState(loadInitialTasks);
  const [customPresets, setCustomPresets] = useState(loadInitialCustomPresets);
  const [activePreset, setActivePreset] = useState(loadInitialActivePreset);
  const [theme, setTheme] = useState(loadInitialTheme);
  const [showExportPreview, setShowExportPreview] = useState(loadInitialShowExportPreview);
  const [startOffsetWeeks, setStartOffsetWeeks] = useState(loadInitialStartOffsetWeeks);

  const [confirmModal, setConfirmModal] = useState(null);
  const [presetModalOpen, setPresetModalOpen] = useState(false);
  const [presetNameInput, setPresetNameInput] = useState('');
  const [presetNameError, setPresetNameError] = useState('');

  const [nlInput, setNlInput] = useState('');
  const parsedNl = useMemo(() => parseNaturalLanguage(nlInput), [nlInput]);

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

  const handlePresetSelect = (presetName, isCustom = false) => {
    const presetTasks = isCustom ? customPresets[presetName] : PRESETS[presetName];
    if (!presetTasks) return;

    const currentClean = tasks.map(t => ({ name: t.name, interval: t.interval, unit: t.unit }));
    const presetClean = presetTasks.map(t => ({ name: t.name, interval: t.interval, unit: t.unit }));

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
      },
    });
  };

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
      [cleanName]: tasks.map(t => ({ ...t })),
    };
    setCustomPresets(updated);
    setActivePreset(cleanName);
    setPresetModalOpen(false);
    showNotification(`Saved "${cleanName}" preset`);
  };

  const handleDeletePreset = (presetName, e) => {
    e.stopPropagation();
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
      },
    });
  };

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

  const handleToggleTaskChecked = (id) => {
    setTasks(tasks.map(task =>
      task.id === id ? { ...task, checked: !task.checked } : task
    ));
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
      },
    });
  };

  const handlePresetNameChange = (value) => {
    setPresetNameInput(value);
    setPresetNameError('');
  };

  return {
    tasks,
    setTasks,
    customPresets,
    setCustomPresets,
    activePreset,
    setActivePreset,
    theme,
    setTheme,
    showExportPreview,
    setShowExportPreview,
    startOffsetWeeks,
    setStartOffsetWeeks,
    confirmModal,
    setConfirmModal,
    presetModalOpen,
    setPresetModalOpen,
    presetNameInput,
    presetNameError,
    nlInput,
    setNlInput,
    parsedNl,
    handleAddNlTask,
    moveTask,
    handlePresetSelect,
    handleSavePreset,
    submitSavePreset,
    handleDeletePreset,
    handleAddTask,
    handleDeleteTask,
    handleToggleTaskChecked,
    handleUpdateTaskName,
    handleUpdateTaskInterval,
    handleUpdateTaskUnit,
    handleReset,
    handlePresetNameChange,
  };
}
