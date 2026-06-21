import { MessageCircle, Sparkles, X } from 'lucide-react';
import { interestFormEnabled } from '../config/monetization.js';
import { dismissExportInterest, isExportInterestDismissed } from '../lib/submitInterest.js';
import { useState } from 'react';

/**
 * Invites feedback — styled like preset cards, not a bare link.
 * variant: 'footer' (full card) | 'export' (compact, dismissible)
 */
export function InterestInvite({ variant = 'footer', onOpen }) {
  const [hidden, setHidden] = useState(() => variant === 'export' && isExportInterestDismissed());

  if (!interestFormEnabled || hidden) return null;

  const handleDismiss = () => {
    if (variant === 'export') {
      dismissExportInterest();
    }
    setHidden(true);
  };

  if (variant === 'export') {
    return (
      <div className="mt-6 pt-6 border-t border-theme-border/60 relative">
        <button
          type="button"
          onClick={handleDismiss}
          className="absolute top-6 right-0 text-theme-text-muted hover:text-theme-text p-1 rounded-md transition-colors cursor-pointer"
          aria-label="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
        <div className="flex gap-3 pr-6">
          <div className="w-9 h-9 rounded-full bg-theme-highlight/60 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4 text-theme-accent" />
          </div>
          <div className="min-w-0">
            <p className="font-serif text-sm font-semibold text-theme-text leading-snug">
              Quick question while you&apos;re here
            </p>
            <p className="text-xs text-theme-text-muted mt-1 leading-relaxed">
              Would styled print templates help after export? Half a minute — helps us know what to build.
            </p>
            <div className="flex flex-wrap gap-3 mt-4">
              <button
                type="button"
                onClick={onOpen}
                className="px-4 py-2 rounded-lg bg-theme-accent hover:bg-theme-accent-hover text-white text-xs font-medium cursor-pointer transition-colors"
              >
                Share feedback
              </button>
              <button
                type="button"
                onClick={handleDismiss}
                className="px-4 py-2 rounded-lg text-xs font-medium text-theme-text-muted hover:text-theme-text cursor-pointer transition-colors"
              >
                Not now
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="surface-panel p-5 md:p-6 text-left max-w-lg mx-auto">
      <div className="flex gap-4">
        <div className="w-10 h-10 rounded-xl bg-theme-highlight/50 border border-theme-border/50 flex items-center justify-center shrink-0">
          <MessageCircle className="w-5 h-5 text-theme-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] uppercase tracking-widest font-semibold text-theme-accent mb-1">
            Your turn
          </p>
          <h3 className="font-serif text-base font-semibold text-theme-text">
            Help shape what we build next
          </h3>
          <p className="text-xs text-theme-text-muted mt-2 leading-relaxed">
            NeatClock stays free forever. Tell us which extras — print packs, wallpapers, themes — would
            actually help after you export. We launch when enough people ask.
          </p>
          <button
            type="button"
            onClick={onOpen}
            className="mt-4 px-5 py-2.5 rounded-lg bg-theme-accent hover:bg-theme-accent-hover text-white text-xs font-medium cursor-pointer transition-colors shadow-sm"
          >
            Share feedback — 30 sec
          </button>
        </div>
      </div>
    </div>
  );
}

export function InterestFooterSection({ onOpen }) {
  if (!interestFormEnabled) return null;
  return <InterestInvite variant="footer" onOpen={onOpen} />;
}

export function InterestExportSection({ onOpen }) {
  if (!interestFormEnabled) return null;
  return <InterestInvite variant="export" onOpen={onOpen} />;
}
