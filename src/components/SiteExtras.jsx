import { ExternalLink, Image, Printer, Sparkles } from 'lucide-react';
import FeatureGate from './FeatureGate.jsx';
import { features, lockscreenConfig, printsConfig, sponsorConfig } from '../config/features.js';
import {
  getPrintProductForPreset,
  printProducts,
} from '../config/monetization.js';
import { isMonetizationPreview, shouldShowMonetization } from '../lib/preview.js';
import { InterestFooterSection } from './InterestInvite.jsx';
import SeoFooterLinks from './SeoFooterLinks.jsx';

function ProductCard({ product, compact = false }) {
  const href = product.url || printsConfig.shopUrl;
  const isReady = href && href !== '#';

  if (!isReady) {
    if (!isMonetizationPreview()) return null;
    return (
      <div className={`rounded-lg border border-dashed border-theme-border/60 bg-theme-bg/20 ${compact ? 'p-3' : 'p-4'}`}>
        <p className="text-xs font-medium text-theme-text">{product.name}</p>
        <p className="text-[10px] text-theme-text-muted mt-1">Add shop URL in deploy env vars</p>
      </div>
    );
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`block rounded-lg border border-theme-border bg-theme-bg/30 hover:border-theme-accent hover:bg-theme-bg/50 transition-all cursor-pointer group ${compact ? 'p-3' : 'p-4'}`}
    >
      <div className="flex justify-between items-start gap-2">
        <p className="text-xs font-semibold text-theme-text group-hover:text-theme-accent transition-colors">{product.name}</p>
        <span className="text-xs font-bold text-theme-accent shrink-0">{product.price}</span>
      </div>
      {!compact && (
        <p className="text-[10px] text-theme-text-muted mt-1.5 leading-relaxed">{product.description}</p>
      )}
      <span className="inline-flex items-center gap-1 text-[10px] text-theme-accent mt-2 font-medium">
        Get print pack <ExternalLink className="w-3 h-3" />
      </span>
    </a>
  );
}

function hasExportExtras() {
  return shouldShowMonetization(features.neatclockPrints) || shouldShowMonetization(features.lockscreenGoodies);
}

export function ExportExtras({ onPrint, activePreset }) {
  if (!hasExportExtras()) return null;

  const matchedProduct = getPrintProductForPreset(activePreset);

  return (
    <div className="mt-6 pt-6 border-t border-theme-border/60 space-y-5">
      <FeatureGate enabled={features.neatclockPrints}>
        <div className="space-y-3">
          <p className="text-xs font-medium text-theme-text">
            {matchedProduct.ctaHeadline ?? 'Want a print-ready version of this schedule?'}
          </p>
          <p className="text-[11px] text-theme-text-muted leading-relaxed">
            {matchedProduct.description}
          </p>
          <ProductCard product={matchedProduct} />
          <details className="text-xs">
            <summary className="cursor-pointer text-theme-text-muted hover:text-theme-text transition-colors py-1">
              View all print packs
            </summary>
            <div className="mt-2 space-y-2 max-h-40 overflow-y-auto">
              {printProducts.map((p) => (
                <ProductCard key={p.id} product={p} compact />
              ))}
            </div>
          </details>
          <button
            type="button"
            onClick={onPrint}
            className="text-xs text-theme-text-muted hover:text-theme-text transition-colors cursor-pointer py-1"
          >
            Or use the free print checklist →
          </button>
        </div>
      </FeatureGate>

      <FeatureGate enabled={features.lockscreenGoodies}>
        <a
          href={lockscreenConfig.downloadUrl}
          download={lockscreenConfig.downloadUrl.startsWith('/') ? 'neatclock-lockscreen.svg' : undefined}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-xs font-medium text-theme-accent hover:text-theme-accent-hover transition-colors cursor-pointer py-1"
        >
          <Image className="w-3.5 h-3.5" />
          Download free lockscreen wallpaper
          <ExternalLink className="w-3 h-3 opacity-60" />
        </a>
      </FeatureGate>
    </div>
  );
}

export function PremiumThemesBanner() {
  return (
    <FeatureGate enabled={features.premiumThemes}>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-2 text-xs text-theme-text-muted">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-theme-accent" />
          Premium themes unlocked
        </span>
      </div>
    </FeatureGate>
  );
}

export function PremiumThemeLock() {
  if (features.premiumThemes) return null;
  return null;
}

/** @deprecated unused */
export function InterestFeedback() {
  return null;
}

export function SiteFooter({ onOpenInterest }) {
  return (
    <footer className="no-print mt-10 text-center space-y-5 pb-6">
      <FeatureGate enabled={features.sponsorFooter}>
        <p className="text-xs text-theme-text-muted">
          Sponsored this week by{' '}
          <a
            href={sponsorConfig.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-theme-text hover:text-theme-accent transition-colors underline-offset-2 hover:underline"
          >
            {sponsorConfig.name}
          </a>
          {' '}— {sponsorConfig.tagline}
        </p>
      </FeatureGate>

      <InterestFooterSection onOpen={onOpenInterest} />

      <SeoFooterLinks />

      <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 select-none bg-emerald-500/5 dark:bg-emerald-500/10 py-1.5 px-3 rounded-full border border-emerald-500/20 max-w-max mx-auto">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"></span>
        <span>Private & Serverless — Your schedule never leaves your device.</span>
      </div>

      <p className="text-[11px] text-theme-text-muted/80 max-w-md mx-auto leading-relaxed pt-1">
        Free on the web. Your schedule stays on this device — no account required.
        {' '}
        <a
          href="/llms.txt"
          className="underline underline-offset-2 hover:text-theme-text transition-colors"
          rel="help"
        >
          For AI assistants
        </a>
        {' · '}
        <a
          href="/?page=partner"
          className="underline underline-offset-2 hover:text-theme-text transition-colors"
        >
          Co-Brand Scheduler
        </a>
      </p>
    </footer>
  );
}

export function PrintsFooterCta({ activePreset }) {
  if (!features.neatclockPrints) return null;

  const product = getPrintProductForPreset(activePreset);

  return (
    <div className="surface-panel p-5 text-center no-print mt-6">
      <p className="text-xs font-medium text-theme-text flex items-center justify-center gap-1.5">
        <Printer className="w-3.5 h-3.5 text-theme-accent" />
        {product.ctaHeadline ?? 'Want a print-ready version?'}
      </p>
      <p className="text-[10px] text-theme-text-muted mt-1.5 mb-4">{product.name} — {product.price}</p>
      <ProductCard product={product} compact />
    </div>
  );
}
