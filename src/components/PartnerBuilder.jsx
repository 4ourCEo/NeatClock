import { useState } from 'react';
import { Copy, ExternalLink, Sparkles, Check, ArrowLeft } from 'lucide-react';

export default function PartnerBuilder() {
  const [brandName, setBrandName] = useState('');
  const [brandLogo, setBrandLogo] = useState('');
  const [brandPhone, setBrandPhone] = useState('');
  const [brandEmail, setBrandEmail] = useState('');
  const [brandWeb, setBrandWeb] = useState('');
  const [brandColor, setBrandColor] = useState('e07a5f'); // Default theme accent
  const [copied, setCopied] = useState(false);

  const getGeneratedUrl = () => {
    if (typeof window === 'undefined') return '';
    const base = window.location.origin;
    const params = new URLSearchParams();
    
    if (brandName.trim()) params.set('brandName', brandName.trim());
    if (brandLogo.trim()) params.set('brandLogo', brandLogo.trim());
    if (brandPhone.trim()) params.set('brandPhone', brandPhone.trim());
    if (brandEmail.trim()) params.set('brandEmail', brandEmail.trim());
    if (brandWeb.trim()) params.set('brandWeb', brandWeb.trim());
    if (brandColor.trim() && brandColor !== 'e07a5f') params.set('brandColor', brandColor.trim().replace('#', ''));

    // Force default preset to let partners seed their templates
    params.set('preset', 'home');

    return params.toString() ? `${base}/?${params.toString()}` : base;
  };

  const generatedUrl = getGeneratedUrl();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8 bg-theme-card/30 border border-theme-border/60 rounded-2xl shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <a 
          href="/" 
          className="inline-flex items-center gap-1.5 text-xs text-theme-text-muted hover:text-theme-text transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Generator
        </a>
        <span className="flex items-center gap-1 text-xs font-semibold text-theme-accent uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          Partner Dashboard
        </span>
      </div>

      <div className="text-center sm:text-left mb-8">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-theme-text mb-2">
          Co-Brand neatclock.pro
        </h1>
        <p className="text-sm text-theme-text-muted max-w-xl leading-relaxed">
          Create a personalized, co-branded calendar tool to share with your clients. Perfect for real estate agents gifting upkeep guides or auto mechanics sharing checkup lists.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {/* Form Fields */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-theme-text-muted mb-1">
              Business Name *
            </label>
            <input 
              type="text" 
              placeholder="e.g. Gilbert Real Estate" 
              value={brandName} 
              onChange={(e) => setBrandName(e.target.value)}
              className="w-full text-sm bg-theme-bg/50 border border-theme-border rounded-lg p-2.5 text-theme-text focus:outline-none focus:border-theme-accent transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-theme-text-muted mb-1">
              Logo Image URL (Optional)
            </label>
            <input 
              type="url" 
              placeholder="e.g. https://domain.com/logo.png" 
              value={brandLogo} 
              onChange={(e) => setBrandLogo(e.target.value)}
              className="w-full text-sm bg-theme-bg/50 border border-theme-border rounded-lg p-2.5 text-theme-text focus:outline-none focus:border-theme-accent transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-theme-text-muted mb-1">
                Phone (Optional)
              </label>
              <input 
                type="text" 
                placeholder="123-456-7890" 
                value={brandPhone} 
                onChange={(e) => setBrandPhone(e.target.value)}
                className="w-full text-sm bg-theme-bg/50 border border-theme-border rounded-lg p-2.5 text-theme-text focus:outline-none focus:border-theme-accent transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-theme-text-muted mb-1">
                Website (Optional)
              </label>
              <input 
                type="text" 
                placeholder="gilbert.com" 
                value={brandWeb} 
                onChange={(e) => setBrandWeb(e.target.value)}
                className="w-full text-sm bg-theme-bg/50 border border-theme-border rounded-lg p-2.5 text-theme-text focus:outline-none focus:border-theme-accent transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-theme-text-muted mb-1">
                Email (Optional)
              </label>
              <input 
                type="email" 
                placeholder="contact@gilbert.com" 
                value={brandEmail} 
                onChange={(e) => setBrandEmail(e.target.value)}
                className="w-full text-sm bg-theme-bg/50 border border-theme-border rounded-lg p-2.5 text-theme-text focus:outline-none focus:border-theme-accent transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-theme-text-muted mb-1">
                Brand Accent Color
              </label>
              <div className="flex gap-2">
                <input 
                  type="color" 
                  value={brandColor.startsWith('#') ? brandColor : `#${brandColor}`} 
                  onChange={(e) => setBrandColor(e.target.value.replace('#', ''))}
                  className="w-10 h-10 border border-theme-border rounded-lg cursor-pointer bg-transparent"
                />
                <input 
                  type="text" 
                  value={brandColor} 
                  onChange={(e) => setBrandColor(e.target.value)}
                  className="w-full text-sm bg-theme-bg/50 border border-theme-border rounded-lg p-2.5 text-theme-text uppercase focus:outline-none focus:border-theme-accent transition-colors"
                  maxLength={6}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Live Preview & URL Link Output */}
        <div className="flex flex-col justify-between p-5 bg-theme-bg/40 border border-theme-border rounded-xl">
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-theme-text-muted">
              Live Preview
            </h3>
            <div className="p-4 border border-theme-border/60 bg-theme-card/50 rounded-lg min-h-[90px] flex items-center justify-center">
              {brandName.trim() ? (
                <div className="w-full">
                  {/* Inline implementation of BrandBanner structure utilizing the local inputs */}
                  <div 
                    className="w-full pb-2 border-b flex flex-col sm:flex-row items-center justify-between gap-3 text-[10px] text-theme-text-muted"
                    style={{ borderBottomColor: `#${brandColor}` }}
                  >
                    <div className="flex items-center gap-2">
                      {brandLogo.trim() ? (
                        <img src={brandLogo} alt="" className="h-8 w-auto object-contain rounded" onError={(e) => { e.target.style.display = 'none'; }} />
                      ) : (
                        <div className="w-1.5 h-6 rounded-full" style={{ backgroundColor: `#${brandColor}` }} />
                      )}
                      <div className="text-left">
                        <p className="text-[8px] uppercase tracking-wider opacity-60">Brought to you by</p>
                        <h4 className="text-xs font-bold text-theme-text">{brandName}</h4>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {brandPhone && <span>{brandPhone}</span>}
                      {brandWeb && <span className="underline">{brandWeb}</span>}
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-theme-text-muted italic">
                  Enter a Business Name to view preview
                </p>
              )}
            </div>
          </div>

          <div className="space-y-3 mt-6">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-theme-text-muted mb-1.5">
                Your Co-Branded URL
              </h3>
              <textarea 
                readOnly
                value={generatedUrl}
                className="w-full text-xs bg-theme-bg/80 border border-theme-border rounded-lg p-2.5 text-theme-text-muted resize-none focus:outline-none min-h-[60px]"
                rows={2}
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCopy}
                disabled={!brandName.trim()}
                className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2.5 rounded-lg border border-theme-border bg-theme-card hover:bg-theme-bg/80 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-theme-accent" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy Share Link
                  </>
                )}
              </button>
              
              <a
                href={generatedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2.5 rounded-lg bg-theme-accent text-white hover:bg-theme-accent-hover transition-all text-center ${!brandName.trim() ? 'opacity-40 pointer-events-none' : ''}`}
              >
                Test Scheduler
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
