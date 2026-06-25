import { ExternalLink, Mail, Phone } from 'lucide-react';

function getBrandFromUrl() {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const name = params.get('brandName');
  
  if (!name) return null;

  return {
    name: name.trim(),
    logo: params.get('brandLogo')?.trim() || '',
    phone: params.get('brandPhone')?.trim() || '',
    email: params.get('brandEmail')?.trim() || '',
    web: params.get('brandWeb')?.trim() || '',
    color: params.get('brandColor')?.trim() || '',
  };
}

export default function BrandBanner({ showOnPrint = true }) {
  const brand = getBrandFromUrl();

  if (!brand) return null;

  // Ensure hex color starts with # if provided
  const customColor = brand.color 
    ? (brand.color.startsWith('#') ? brand.color : `#${brand.color}`) 
    : 'var(--theme-accent)';

  return (
    <div 
      className={`b2b-brand-banner w-full mb-6 pb-4 border-b border-theme-border/60 flex flex-col sm:flex-row items-center justify-between gap-4 ${!showOnPrint ? 'no-print' : ''}`}
      style={{ borderBottomColor: brand.color ? customColor : undefined }}
    >
      <div className="flex items-center gap-3">
        {brand.logo ? (
          <img 
            src={brand.logo} 
            alt={brand.name} 
            className="h-10 sm:h-12 w-auto object-contain rounded-md"
            onError={(e) => {
              // Graceful fallback if logo URL fails to load
              e.target.style.display = 'none';
            }}
          />
        ) : (
          <div 
            className="w-2 h-8 rounded-full" 
            style={{ backgroundColor: customColor }}
          />
        )}
        <div className="text-center sm:text-left">
          <p className="text-[10px] uppercase tracking-wider text-theme-text-muted font-sans font-semibold">
            Brought to you by
          </p>
          <h2 className="text-base sm:text-lg font-serif font-bold text-theme-text">
            {brand.name}
          </h2>
        </div>
      </div>

      <div className="flex flex-wrap justify-center sm:justify-end items-center gap-x-4 gap-y-2 text-xs text-theme-text-muted">
        {brand.phone && (
          <span className="flex items-center gap-1">
            <Phone className="w-3 h-3 text-theme-text-muted/70" />
            {brand.phone}
          </span>
        )}
        {brand.email && (
          <span className="flex items-center gap-1">
            <Mail className="w-3 h-3 text-theme-text-muted/70" />
            <a 
              href={`mailto:${brand.email}`}
              className="hover:text-theme-accent transition-colors"
            >
              {brand.email}
            </a>
          </span>
        )}
        {brand.web && (
          <span className="flex items-center gap-1">
            <a 
              href={brand.web.startsWith('http') ? brand.web : `https://${brand.web}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-0.5 font-medium hover:text-theme-accent transition-colors"
            >
              {brand.web.replace(/^https?:\/\/(www\.)?/, '')}
              <ExternalLink className="w-3 h-3 opacity-60" />
            </a>
          </span>
        )}
      </div>

      {/* Styled block only visible on print */}
      <div className="hidden print:block print:w-full print:border-t print:border-black print:mt-1 print:pt-1 print:text-xs">
        <p className="font-serif italic text-black">
          Compliments of {brand.name} 
          {brand.phone && ` | Phone: ${brand.phone}`}
          {brand.email && ` | Email: ${brand.email}`}
          {brand.web && ` | Website: ${brand.web}`}
        </p>
      </div>
    </div>
  );
}
