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

/** Post-launch feedback: CTA feel */
export const CTA_FEEL_OPTIONS = [
  { id: 'helpful', label: 'Helpful', value: 'helpful' },
  { id: 'fine', label: 'Fine', value: 'fine' },
  { id: 'too-pushy', label: 'Too pushy', value: 'too_pushy' },
];

/** Post-launch feedback: Price reaction */
export const PRICE_FEEL_OPTIONS = [
  { id: 'fair', label: 'Fair', value: 'fair' },
  { id: 'high', label: 'Too high', value: 'high' },
  { id: 'low', label: 'Lower than expected', value: 'low' },
  { id: 'no-opinion', label: "Don't care / didn't check", value: 'no_opinion' },
];

/** Post-launch feedback: What to build next */
export const NEXT_INTEREST_OPTIONS = [
  {
    id: 'more-print-themes',
    label: 'More print themes',
    description: 'Different styles or layouts for the print packs',
  },
  {
    id: 'lockscreen',
    label: 'Lockscreen wallpapers',
    description: 'Calm backgrounds for your phone',
  },
  {
    id: 'themes',
    label: 'Extra color themes',
    description: 'Premium palettes beyond the free themes',
  },
  {
    id: 'free-enough',
    label: 'Nothing extra',
    description: 'Free export + prints are enough for me',
  },
];

export function buildInitialInterestState(activePreset, mode = 'pre_launch') {
  const presetMatch = PRESET_OPTIONS.find((p) => p.value === activePreset);
  
  if (mode === 'post_launch') {
    return {
      preset: presetMatch ? presetMatch.value : 'Custom',
      ctaFeel: '',
      priceFeel: '',
      nextInterest: [],
      note: '',
      email: '',
    };
  }
  
  // Pre-launch mode
  return {
    preset: presetMatch ? presetMatch.value : 'Custom',
    interests: [],
    purchaseIntent: '',
    email: '',
  };
}

export function validateInterestForm(state, mode = 'pre_launch') {
  if (!state.preset) return 'Pick the schedule type you use most.';
  
  if (mode === 'post_launch') {
    if (!state.ctaFeel) return 'Let us know how the print CTAs feel.';
    if (!state.priceFeel) return 'Share your reaction to the pricing.';
    if (state.nextInterest.length === 0) return 'Pick at least one option — including "Nothing extra" if that fits.';
    if (state.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)) {
      return 'Enter a valid email or leave it blank.';
    }
    return null;
  }
  
  // Pre-launch validation
  if (state.interests.length === 0) return 'Pick at least one option — including "Nothing extra" if that fits.';
  if (!state.purchaseIntent) return 'Let us know if a $5 print pack is something you\'d consider.';
  if (state.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(state.email)) {
    return 'Enter a valid email or leave it blank.';
  }
  return null;
}
