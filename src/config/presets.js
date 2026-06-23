export const PRESETS = {
  "Homeowner's Sentinel": [
    { id: 'hs-1', name: 'HVAC Filter Replacement', interval: 3, unit: 'months' },
    { id: 'hs-2', name: 'Smoke Detector Check', interval: 6, unit: 'months' },
    { id: 'hs-3', name: 'Gutter Clearance', interval: 6, unit: 'months' },
    { id: 'hs-4', name: 'Water Heater Flush', interval: 12, unit: 'months' },
    { id: 'hs-5', name: 'Dryer Vent Vacuuming', interval: 12, unit: 'months' },
  ],
  'Preventive Gearhead': [
    { id: 'pg-1', name: 'Engine Oil Change', interval: 6, unit: 'months' },
    { id: 'pg-2', name: 'Tire Rotation', interval: 6, unit: 'months' },
    { id: 'pg-3', name: 'Air Filter Check', interval: 12, unit: 'months' },
    { id: 'pg-4', name: 'Wiper Blades', interval: 12, unit: 'months' },
    { id: 'pg-5', name: 'Brake Fluid Inspection', interval: 12, unit: 'months' },
  ],
  'Automated CFO': [
    { id: 'cfo-1', name: 'Quarterly Estimated Taxes', interval: 3, unit: 'months' },
    { id: 'cfo-2', name: 'Monthly Bookkeeping', interval: 1, unit: 'months' },
    { id: 'cfo-3', name: 'Security Audit', interval: 6, unit: 'months' },
    { id: 'cfo-4', name: 'Subscription Review', interval: 6, unit: 'months' },
    { id: 'cfo-5', name: 'Domain Renewals', interval: 12, unit: 'months' },
  ],
};

/** Shorter card title only — storage / modals keep full preset names */
export const PRESET_CARD_LABELS = {
  "Homeowner's Sentinel": 'Home Sentinel',
};

export function presetCardLabel(presetName) {
  return PRESET_CARD_LABELS[presetName] ?? presetName;
}
