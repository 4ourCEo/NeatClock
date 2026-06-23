import { describe, expect, it } from 'vitest';
import { ALLOWED_THEMES, resolveTheme, THEME_CLASSES } from './themes.js';

describe('resolveTheme', () => {
  it('accepts a valid saved theme', () => {
    expect(resolveTheme('theme-sage-garden')).toBe('theme-sage-garden');
    expect(resolveTheme('theme-obsidian', false)).toBe('theme-obsidian');
  });

  it('rejects invalid theme and falls back to warm sand', () => {
    expect(resolveTheme('evil-theme')).toBe('theme-warm-sand');
    expect(resolveTheme('theme-not-real')).toBe('theme-warm-sand');
    expect(resolveTheme('', false)).toBe('theme-warm-sand');
  });

  it('uses obsidian when legacy dark mode is enabled and saved theme is invalid', () => {
    expect(resolveTheme(null, true)).toBe('theme-obsidian');
    expect(resolveTheme('evil-theme', true)).toBe('theme-obsidian');
  });

  it('prefers valid saved theme over legacy dark flag', () => {
    expect(resolveTheme('theme-blush-linen', true)).toBe('theme-blush-linen');
  });
});

describe('THEME_CLASSES', () => {
  it('matches allowlist used by resolveTheme', () => {
    expect(THEME_CLASSES).toHaveLength(6);
    for (const theme of THEME_CLASSES) {
      expect(ALLOWED_THEMES.has(theme)).toBe(true);
    }
  });
});
