import { describe, expect, it } from 'vitest';
import { PRESET_CARD_LABELS, PRESETS, presetCardLabel } from './presets.js';

describe('PRESETS', () => {
  it('defines the three known preset schedules with 5 tasks each', () => {
    expect(Object.keys(PRESETS)).toEqual([
      "Homeowner's Sentinel",
      'Preventive Gearhead',
      'Automated CFO',
    ]);
    for (const tasks of Object.values(PRESETS)) {
      expect(tasks).toHaveLength(5);
      for (const task of tasks) {
        expect(task).toHaveProperty('id');
        expect(task).toHaveProperty('name');
        expect(task).toHaveProperty('interval');
        expect(task).toHaveProperty('unit');
      }
    }
  });

  it('gives every task a unique id', () => {
    const ids = Object.values(PRESETS).flat().map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('presetCardLabel', () => {
  it('shortens a preset with a defined card label', () => {
    expect(presetCardLabel("Homeowner's Sentinel")).toBe(
      PRESET_CARD_LABELS["Homeowner's Sentinel"],
    );
  });

  it('returns the preset name unchanged when no card label is defined', () => {
    expect(presetCardLabel('Preventive Gearhead')).toBe('Preventive Gearhead');
    expect(presetCardLabel('Custom')).toBe('Custom');
  });
});
