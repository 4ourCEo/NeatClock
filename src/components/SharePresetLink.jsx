import { Link2 } from 'lucide-react';
import { copyPresetShareLink, presetShareSlug } from '../lib/shareLinks.js';
import { trackEvent } from '../lib/analytics.js';

export default function SharePresetLink({ activePreset, onCopied }) {
  const slug = presetShareSlug(activePreset);
  if (!slug) return null;

  const handleCopy = async () => {
    try {
      await copyPresetShareLink(activePreset, { medium: 'share', campaign: slug });
      trackEvent('share_link_copy', { preset: slug });
      onCopied?.(`Link copied — share your ${activePreset} schedule`);
    } catch {
      onCopied?.('Could not copy link. Select the URL in your browser bar instead.');
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 text-xs text-theme-text-muted hover:text-theme-accent transition-colors cursor-pointer py-1"
    >
      <Link2 className="w-3.5 h-3.5" />
      Copy share link
    </button>
  );
}
