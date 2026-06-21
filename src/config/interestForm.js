/** Interest / greenlight form — matches fields sent to Formspree or Tally */
export const PRESET_OPTIONS = [
  { id: 'homeowner', label: "Homeowner's Sentinel", value: "Homeowner's Sentinel" },
  { id: 'gearhead', label: 'Preventive Gearhead', value: 'Preventive Gearhead' },
  { id: 'cfo', label: 'Automated CFO', value: 'Automated CFO' },
  { id: 'custom', label: 'My own custom list', value: 'Custom' },
];

export const INTEREST_OPTIONS = [
  {
    id: 'prints',
    label: 'Styled print packs',
    description: 'Matching PDF checklists & posters (~$5)',
  },
  {
    id: 'lockscreen',
    label: 'Lockscreen wallpapers',
    description: 'Calm backgrounds for your phone',
  },
  {
    id: 'themes',
    label: 'Extra color themes',
    description: 'Premium palettes beyond the four free themes',
  },
  {
    id: 'free-enough',
    label: 'Nothing extra',
    description: 'The free export & print view is enough for me',
  },
];

export const PURCHASE_OPTIONS = [
  { id: 'yes', label: 'Yes, likely', value: 'yes' },
  { id: 'maybe', label: 'Maybe, depends on design', value: 'maybe' },
  { id: 'no', label: 'No — free only', value: 'no' },
];

export function buildInitialInterestState(activePreset) {
  const presetMatch = PRESET_OPTIONS.find((p) => p.value === activePreset);
  return {
    preset: presetMatch ? presetMatch.value : 'Custom',
    interests: [],
    purchaseIntent: '',
    email: '',
  };
}

export function validateInterestForm(state) {
  if (!state.preset) return 'Pick the schedule type you use most.';
  if (state.interests.length === 0) return 'Pick at least one option — including “Nothing extra” if that fits.';
  if (!state.purchaseIntent) return 'Let us know if a ~$5 print pack is something you’d consider.';
  if (state.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)) {
    return 'Enter a valid email or leave it blank.';
  }
  return null;
}
