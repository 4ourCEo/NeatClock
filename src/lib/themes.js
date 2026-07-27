export const THEME_CLASSES = [
  'theme-warm-sand',
  'theme-sage-garden',
  'theme-obsidian',
  'theme-forest-moss',
  'theme-ink-stone',
  'theme-blush-linen',
];

export const ALLOWED_THEMES = new Set(THEME_CLASSES);

/**
 * @param {string|null} saved - Theme explicitly chosen (or previously persisted) by the user; always wins.
 * @param {boolean} legacyDark - Pre-theme-picker dark-mode flag from earlier app versions.
 * @param {boolean} prefersDarkOS - OS-level `prefers-color-scheme: dark`; only consulted for first-time
 *   visitors who have never saved a theme or set the legacy flag.
 */
export function resolveTheme(saved, legacyDark = false, prefersDarkOS = false) {
  if (saved && ALLOWED_THEMES.has(saved)) return saved;
  if (legacyDark || prefersDarkOS) return 'theme-obsidian';
  return 'theme-warm-sand';
}
