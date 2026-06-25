import { PremiumThemesBanner } from './SiteExtras.jsx';
import { getAvailableThemes } from '../config/monetization.js';

const LOGO_DARK_THEMES = new Set(['theme-obsidian', 'theme-forest-moss', 'theme-ink-stone']);

export default function AppHeader({ theme, setTheme }) {
  return (
    <header className="no-print relative flex flex-col items-center justify-center mb-8 md:mb-10 border-b pb-6 md:pb-8 border-theme-border/60">
      <h1 className="mb-2 md:mb-3 flex justify-center">
        <img
          src={LOGO_DARK_THEMES.has(theme) ? '/logo-light.png' : '/logo.png'}
          alt="NeatClock"
          width={2003}
          height={299}
          className="h-10 sm:h-12 md:h-14 w-auto max-w-[min(100%,22rem)]"
          decoding="async"
        />
      </h1>
      <p className="font-serif italic text-base md:text-lg text-theme-text-muted text-center px-2 max-w-md">
        A minimalist, zero-friction recurring calendar generator.
      </p>

      {/* Theme picker — centered on mobile, top-right on desktop */}
      <div className="theme-picker no-print items-center surface-panel shadow-[var(--theme-shadow-sm)]">
        {getAvailableThemes().map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTheme(t.id)}
            className={`theme-swatch touch-target rounded-full cursor-pointer transition-all duration-300 ${t.color} hover:scale-110 ${
              theme === t.id ? `ring-2 ring-offset-2 ring-theme-text ${t.ring} scale-110 shadow-sm` : 'opacity-65 hover:opacity-100'
            }`}
            title={`Switch to ${t.name}${t.premium ? ' (premium)' : ''}`}
            aria-label={`Switch to ${t.name}`}
          />
        ))}
      </div>

      <PremiumThemesBanner />
    </header>
  );
}
