/**
 * Monetization product catalog — URLs from env vars (Gumroad, Lemon Squeezy, etc.)
 * @see MONETIZATION.md
 */
import { features } from './features.js';
import { shouldShowMonetization } from '../lib/preview.js';
import {
  interestFormEndpoint,
  isInterestEndpointConfigured,
} from './interestEndpoint.js';

function env(name, fallback = '') {
  return import.meta.env[name] || fallback;
}

export { interestFormEndpoint };

export const shopUrl = env('VITE_PRINTS_SHOP_URL');
export const themePackUrl = env('VITE_THEME_PACK_URL', shopUrl);

/** Show native interest UI when prints aren't live and a form endpoint is configured */
export const interestFormEnabled =
  isInterestEndpointConfigured() && !features.neatclockPrints;

/** Preset-matched print packs ($3–5 each or bundle) */
export const printProducts = [
  {
    id: 'prints-homeowner',
    presetMatch: "Homeowner's Sentinel",
    name: 'Home Maintenance Print Pack',
    description: 'Checklist poster + fridge magnet layout for household upkeep.',
    ctaHeadline: 'Want a polished checklist for the home?',
    price: env('VITE_PRINTS_HOME_PRICE', '$5'),
    url: env('VITE_PRINTS_HOME_URL', shopUrl),
  },
  {
    id: 'prints-gearhead',
    presetMatch: 'Preventive Gearhead',
    name: 'Vehicle Care Print Pack',
    description: 'Garage-ready checklist with mileage notes column.',
    ctaHeadline: 'Want a garage-ready hardcopy?',
    price: env('VITE_PRINTS_CAR_PRICE', '$5'),
    url: env('VITE_PRINTS_CAR_URL', shopUrl),
  },
  {
    id: 'prints-cfo',
    presetMatch: 'Automated CFO',
    name: 'Freelancer Finance Print Pack',
    description: 'Quarterly tax + bookkeeping tracker for solopreneurs.',
    ctaHeadline: 'Want a clean print for your desk?',
    price: env('VITE_PRINTS_CFO_PRICE', '$5'),
    url: env('VITE_PRINTS_CFO_URL', shopUrl),
  },
  {
    id: 'prints-bundle',
    presetMatch: null,
    name: 'All Three Print Packs',
    description: 'Home + car + finance templates in one download.',
    price: env('VITE_PRINTS_BUNDLE_PRICE', '$12'),
    url: env('VITE_PRINTS_BUNDLE_URL', shopUrl),
    featured: true,
  },
];

export function getPrintProductForPreset(presetName) {
  return printProducts.find((p) => p.presetMatch === presetName) || printProducts[0];
}

/** Premium themes — unlocked when VITE_FEATURE_PREMIUM_THEMES=true */
export const premiumThemes = [
  {
    id: 'theme-ink-stone',
    name: 'Ink Stone',
    color: 'bg-[#5C6BC0]',
    ring: 'ring-[#5C6BC0]',
    premium: true,
  },
  {
    id: 'theme-blush-linen',
    name: 'Blush Linen',
    color: 'bg-[#C48B9F]',
    ring: 'ring-[#C48B9F]',
    premium: true,
  },
];

export const freeThemes = [
  { id: 'theme-warm-sand', name: 'Warm Sand', color: 'bg-[#E07A5F]', ring: 'ring-[#E07A5F]', premium: false },
  { id: 'theme-sage-garden', name: 'Sage Garden', color: 'bg-[#78907A]', ring: 'ring-[#78907A]', premium: false },
  { id: 'theme-obsidian', name: 'Obsidian Minimal', color: 'bg-[#FF8A65]', ring: 'ring-[#FF8A65]', premium: false },
  { id: 'theme-forest-moss', name: 'Forest Moss', color: 'bg-[#F4A261]', ring: 'ring-[#F4A261]', premium: false },
];

export function getAvailableThemes() {
  const themes = [...freeThemes];
  if (shouldShowMonetization(features.premiumThemes)) {
    themes.push(...premiumThemes);
  }
  return themes;
}

/** Bundled free lockscreen — served from /public */
export const freeLockscreenPath = '/wallpapers/neatclock-lockscreen.svg';

export const monetizationActive =
  features.neatclockPrints ||
  features.lockscreenGoodies ||
  features.premiumThemes ||
  features.sponsorFooter ||
  features.affiliateLinks;
