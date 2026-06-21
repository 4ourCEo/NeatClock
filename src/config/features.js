/**
 * Feature flags — build future capabilities now, launch by setting env vars to "true".
 * @see FEATURES.md and .env.example
 */
function envFlag(name) {
  return import.meta.env[name] === 'true';
}

export const features = {
  /** Premium PDF print templates ($3–5) */
  neatclockPrints: envFlag('VITE_FEATURE_NEATCLOCK_PRINTS'),
  /** Lockscreen wallpapers on export success */
  lockscreenGoodies: envFlag('VITE_FEATURE_LOCKSCREEN_GOODIES'),
  /** Paid / extra theme packs beyond the four free themes */
  premiumThemes: envFlag('VITE_FEATURE_PREMIUM_THEMES'),
  /** Text-only sponsor line in site footer */
  sponsorFooter: envFlag('VITE_FEATURE_SPONSOR_FOOTER'),
  /** Resource links appended to .ics event descriptions */
  affiliateLinks: envFlag('VITE_FEATURE_AFFILIATE_LINKS'),
};

export const sponsorConfig = {
  name: import.meta.env.VITE_SPONSOR_NAME || 'Minimalist Notebook Co.',
  tagline: import.meta.env.VITE_SPONSOR_TAGLINE || 'analogue tools for organized minds',
  url: import.meta.env.VITE_SPONSOR_URL || '#',
};

export const printsConfig = {
  shopUrl: import.meta.env.VITE_PRINTS_SHOP_URL || '#',
};

export const lockscreenConfig = {
  downloadUrl: import.meta.env.VITE_LOCKSCREEN_URL || '/wallpapers/neatclock-lockscreen.svg',
};
