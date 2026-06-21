import { isMonetizationPreview, shouldShowMonetization } from '../lib/preview.js';

/**
 * Renders children when a feature flag is on (or ?preview=monetization for owner staging).
 * When off: renders nothing — no "coming soon" noise for visitors.
 */
export default function FeatureGate({ enabled, children }) {
  if (shouldShowMonetization(enabled)) {
    return children;
  }
  return null;
}

/** Dev-only banner when previewing monetization UI via URL param */
export function MonetizationPreviewBanner() {
  if (!isMonetizationPreview()) return null;

  return (
    <div
      className="no-print mb-4 mx-auto max-w-5xl rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-center text-xs text-theme-text"
      role="status"
    >
      Preview mode — monetization UI visible to you only. Remove <code className="text-[11px]">?preview=monetization</code> before sharing.
    </div>
  );
}
