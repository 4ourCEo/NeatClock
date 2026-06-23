export const THEME_CLASSES = [
  'theme-warm-sand',
  'theme-sage-garden',
  'theme-obsidian',
  'theme-forest-moss',
  'theme-ink-stone',
  'theme-blush-linen',
];

export const ALLOWED_THEMES = new Set(THEME_CLASSES);

export function resolveTheme(saved, legacyDark = false) {
  if (saved && ALLOWED_THEMES.has(saved)) return saved;
  if (legacyDark) return 'theme-obsidian';
  return 'theme-warm-sand';
}
