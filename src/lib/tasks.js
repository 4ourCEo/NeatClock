export const TASK_UNITS = ['weeks', 'months', 'years'];
export const INTERVAL_MIN = 1;
export const INTERVAL_MAX = 120;
export const TASK_NAME_MAX = 200;

export const BUILTIN_PRESET_NAMES = [
  "Homeowner's Sentinel",
  'Preventive Gearhead',
  'Automated CFO',
];

const LEGACY_PRESET_IDS = {
  'home-sentinel': "Homeowner's Sentinel",
  gearhead: 'Preventive Gearhead',
  cfo: 'Automated CFO',
};

export function createTaskId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return `custom-${crypto.randomUUID()}`;
  }
  return `custom-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function clampInterval(value) {
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed)) return INTERVAL_MIN;
  return Math.min(INTERVAL_MAX, Math.max(INTERVAL_MIN, parsed));
}

export function normalizeUnit(unit) {
  return TASK_UNITS.includes(unit) ? unit : 'months';
}

export function normalizeTask(task) {
  if (!task || typeof task !== 'object') return null;

  const rawName = task.name != null ? String(task.name).trim() : '';
  return {
    id: task.id || createTaskId(),
    name: (rawName || 'New Custom Task').slice(0, TASK_NAME_MAX),
    interval: clampInterval(task.interval),
    unit: normalizeUnit(task.unit),
  };
}

export function normalizeTasks(tasks) {
  if (!Array.isArray(tasks)) return [];
  return tasks.map(normalizeTask).filter(Boolean);
}

export function resolveActivePreset(activePreset, customPresets = {}) {
  if (typeof activePreset !== 'string' || !activePreset.trim()) {
    return BUILTIN_PRESET_NAMES[0];
  }

  const fixed = LEGACY_PRESET_IDS[activePreset] || activePreset;

  if (BUILTIN_PRESET_NAMES.includes(fixed)) return fixed;
  if (customPresets && typeof customPresets === 'object' && fixed in customPresets) {
    return fixed;
  }

  return BUILTIN_PRESET_NAMES[0];
}

export function parseNaturalLanguage(input) {
  const clean = input.trim();
  if (!clean) return null;

  const regex = /(.*?)\s+(?:every|each)\s+(\d*)\s*(week|month|year)s?/i;
  const match = clean.match(regex);

  if (match) {
    const name = match[1].trim();
    const intervalVal = match[2].trim();
    const interval = intervalVal ? parseInt(intervalVal, 10) : 1;
    const unit = normalizeUnit(`${match[3].toLowerCase()}s`);

    return {
      name: (name || 'New Custom Task').slice(0, TASK_NAME_MAX),
      interval: clampInterval(interval),
      unit,
    };
  }

  return {
    name: clean.slice(0, TASK_NAME_MAX),
    interval: INTERVAL_MIN,
    unit: 'months',
  };
}
