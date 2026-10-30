import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Check, Copy, Download, ExternalLink, QrCode, Sparkles } from 'lucide-react';
import QRCode from 'qrcode';
import { BUSINESS_INDUSTRIES, buildBusinessShareUrl, createBusinessIdentityId, normalizeBusinessBrand } from '../lib/businessCalendar.js';
import { PRESETS } from '../config/presets.js';
import {
  createBusinessCheckout,
  getBusinessCheckoutConfig,
  readPendingBusinessCheckout,
  readSavedBusinessEntitlement,
  saveBusinessEntitlement,
  savePendingBusinessCheckout,
  clearPendingBusinessCheckout,
  verifyBusinessEntitlement,
  requestBusinessRecovery,
  readRecoveryAccessToken,
  recoverBusinessPurchases,
} from '../lib/businessPurchase.js';
import { trackEvent } from '../lib/analytics.js';

const DRAFT_STORAGE_KEY = 'neatclock_business_draft_v1';
const DEFAULT_BRAND = { brandName: '', brandLogo: '', brandPhone: '', brandEmail: '', brandWeb: '', brandColor: 'e07a5f' };
const DRAFT_SAVE_ERROR = 'This browser could not save the business profile. Keep this page open; reloading may lose these details and create a different calendar link.';

function saveDraft(industry, brand, businessId) {
  try {
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({ industry, brand, businessId }));
    return '';
  } catch {
    return DRAFT_SAVE_ERROR;
  }
}

function readDraft() {
  let saved;
  try {
    saved = JSON.parse(localStorage.getItem(DRAFT_STORAGE_KEY) || '{}');
  } catch {
    const draft = { industry: 'hvac', brand: DEFAULT_BRAND, businessId: createBusinessIdentityId() };
    return { ...draft, saveError: saveDraft(draft.industry, draft.brand, draft.businessId) || DRAFT_SAVE_ERROR };
  }

  const source = saved && typeof saved === 'object' ? saved : {};
  const industry = ['hvac', 'plumbing'].includes(source.industry) ? source.industry : 'hvac';
  const brand = { ...DEFAULT_BRAND, ...source.brand };
  const hasSavedIdentity = typeof source.businessId === 'string' && /^[0-9a-f-]{16,64}$/i.test(source.businessId);
  const businessId = hasSavedIdentity
    ? source.businessId
    : createBusinessIdentityId();
  const saveError = hasSavedIdentity ? '' : saveDraft(industry, brand, businessId);
  return { industry, brand, businessId, saveError };
}

function formatPrice(price) {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: price.currency.toUpperCase() })
    .format(price.amountMinor / 100);
}

export default function PartnerBuilder() {
  const [draft] = useState(readDraft);
  const [industry, setIndustry] = useState(draft.industry);
  const [brand, setBrand] = useState(draft.brand);
  const [businessId, setBusinessId] = useState(draft.businessId);
  const [checkoutConfig, setCheckoutConfig] = useState(null);
  const [checkoutError, setCheckoutError] = useState('');
  const [draftSaveError, setDraftSaveError] = useState(draft.saveError || '');
  const [purchaseState, setPurchaseState] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('purchase') === 'cancelled') return 'cancelled';
    return params.has('session_id') || readPendingBusinessCheckout() || readSavedBusinessEntitlement() ? 'verifying' : 'idle';
  });
  const [entitlement, setEntitlement] = useState(null);
  const [qrResult, setQrResult] = useState({ url: '', dataUrl: '', error: false });
  const [copied, setCopied] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState('');
  const [recoveryState, setRecoveryState] = useState('idle');

  const generatedUrl = useMemo(() => {
    if (!brand.brandName.trim()) return '';
    try {
      return buildBusinessShareUrl({ origin: window.location.origin, industry, brand, businessId });
    } catch {
      return '';
    }
  }, [brand, businessId, industry]);
  const preset = BUSINESS_INDUSTRIES[industry].preset;
  const tasks = PRESETS[preset];
  const deliveryUrl = entitlement?.claims?.artifactUrl || generatedUrl;
  const qrDataUrl = qrResult.url === deliveryUrl ? qrResult.dataUrl : '';
  const qrError = qrResult.url === deliveryUrl && qrResult.error;
  const entitled = purchaseState === 'verified' && Boolean(entitlement?.token);

  const verifyPurchase = useCallback(async (sessionId, orderProof) => {
    if (!sessionId || !orderProof) return;
    setPurchaseState('verifying');
    setCheckoutError('');
    try {
      const result = await verifyBusinessEntitlement(sessionId, orderProof);
      const saved = saveBusinessEntitlement(result, orderProof);
      clearPendingBusinessCheckout();
      setEntitlement(saved);
      setPurchaseState('verified');
      trackEvent('business_calendar_payment_verified', { industry: result.entitlement.claims.industry });
      trackEvent('business_calendar_fulfillment_completed', { product: result.product.productId });
      const url = new URL(window.location.href);
      url.searchParams.delete('purchase');
      url.searchParams.delete('session_id');
      window.history.replaceState({}, '', url);
    } catch {
      setPurchaseState('failed');
      setCheckoutError('Payment verification is temporarily unavailable or incomplete. No license was issued. Retry verification; your Checkout session is saved.');
    }
  }, []);

  useEffect(() => {
    let active = true;
    getBusinessCheckoutConfig().then((config) => {
      if (active) setCheckoutConfig(config);
    }).catch(() => {
      if (active) setCheckoutConfig({ available: false });
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    if (new URLSearchParams(window.location.search).get('purchase') === 'cancelled') {
      clearPendingBusinessCheckout();
      return () => { active = false; };
    }
    const pending = readPendingBusinessCheckout();
    const saved = readSavedBusinessEntitlement();
    const sessionId = new URLSearchParams(window.location.search).get('session_id') || pending?.checkoutSessionId || saved?.checkoutSessionId;
    const orderProof = pending?.orderProof || saved?.orderProof;
    if (!sessionId || !orderProof) return () => { active = false; };
    Promise.resolve().then(() => { if (active) return verifyPurchase(sessionId, orderProof); });
    return () => { active = false; };
  }, [verifyPurchase]);

  useEffect(() => {
    let active = true;
    if (!deliveryUrl) return () => { active = false; };
    QRCode.toDataURL(deliveryUrl, { width: 360, margin: 2, errorCorrectionLevel: 'M' })
      .then((dataUrl) => { if (active) setQrResult({ url: deliveryUrl, dataUrl, error: false }); })
      .catch(() => { if (active) setQrResult({ url: deliveryUrl, dataUrl: '', error: true }); });
    return () => { active = false; };
  }, [deliveryUrl]);

  useEffect(() => {
    const accessToken = readRecoveryAccessToken();
    if (!accessToken) return;
    Promise.resolve().then(() => setRecoveryState('verifying'));
    recoverBusinessPurchases(accessToken).then(([result]) => {
      setEntitlement(saveBusinessEntitlement(result));
      setPurchaseState('verified');
      setRecoveryState('verified');
      window.history.replaceState({}, '', `${window.location.pathname}?page=partner`);
    }).catch(() => setRecoveryState('failed'));
  }, []);

  const persistDraft = useCallback((nextIndustry, nextBrand, nextBusinessId) => {
    setDraftSaveError(saveDraft(nextIndustry, nextBrand, nextBusinessId));
  }, []);

  const updateBrand = (key) => (event) => {
    const nextBrand = { ...brand, [key]: event.target.value };
    setBrand(nextBrand);
    persistDraft(industry, nextBrand, businessId);
  };

  const updateIndustry = (event) => {
    const nextIndustry = event.target.value;
    setIndustry(nextIndustry);
    persistDraft(nextIndustry, brand, businessId);
  };

  const updateBrandColor = (event) => {
    const nextBrand = { ...brand, brandColor: event.target.value.slice(1) };
    setBrand(nextBrand);
    persistDraft(industry, nextBrand, businessId);
  };

  const startNewBusinessProfile = () => {
    try {
      const nextBusinessId = createBusinessIdentityId();
      setBusinessId(nextBusinessId);
      setBrand(DEFAULT_BRAND);
      setIndustry('hvac');
      setQrResult({ url: '', dataUrl: '', error: false });
      setCheckoutError('');
      persistDraft('hvac', DEFAULT_BRAND, nextBusinessId);
    } catch (error) {
      setCheckoutError(error.message);
    }
  };

  const handleCopy = async () => {
    if (!generatedUrl) return;
    try {
      await navigator.clipboard.writeText(generatedUrl);
      setCopied(true);
      trackEvent('business_calendar_share_link_copied', { industry });
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCheckoutError('Copy was unavailable. Select the share link and copy it manually.');
    }
  };

  const handleCheckout = async () => {
    setCheckoutError('');
    setPurchaseState('starting');
    trackEvent('business_calendar_checkout_initiated', { industry });
    try {
      const result = await createBusinessCheckout({ industry, artifactUrl: generatedUrl, businessId });
      savePendingBusinessCheckout(result.checkout);
      window.location.assign(result.checkoutUrl);
    } catch {
      setPurchaseState('idle');
      setCheckoutError('Checkout is not configured for this Preview yet. The calendar and share link still work.');
    }
  };

  const handleRecovery = async (event) => {
    event.preventDefault();
    setRecoveryState('sending');
    try { await requestBusinessRecovery(recoveryEmail); setRecoveryState('sent'); }
    catch { setRecoveryState('failed'); }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-8 bg-theme-card/30 border border-theme-border/60 rounded-2xl shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <a href="/" className="inline-flex items-center gap-1.5 text-xs text-theme-text-muted hover:text-theme-text transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Generator
        </a>
        <span className="flex items-center gap-1 text-xs font-semibold text-theme-accent uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" /> NeatClock Business
        </span>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-theme-text mb-2">A branded maintenance calendar for your customers</h1>
        <p className="text-sm text-theme-text-muted max-w-2xl leading-relaxed">
          Choose an HVAC or plumbing schedule, add your business details, then share a ready-to-use customer calendar link or QR code.
        </p>
        <button type="button" onClick={startNewBusinessProfile} className="mt-3 text-xs font-bold text-theme-accent underline underline-offset-2">
          Start a different business profile
        </button>
        <p className="mt-1 text-xs text-theme-text-muted">This profile keeps its calendar event IDs when you edit its details. Start a different profile to give another business separate event IDs.</p>
        {draftSaveError && <p role="status" className="mt-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-theme-text">{draftSaveError}</p>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="space-y-4" aria-label="Business calendar setup">
          <div>
            <label htmlFor="business-industry" className="block text-xs font-bold uppercase tracking-wider text-theme-text-muted mb-1">Industry preset</label>
            <select id="business-industry" value={industry} onChange={updateIndustry} className="w-full text-sm bg-theme-bg/50 border border-theme-border rounded-lg p-2.5 text-theme-text">
              {Object.entries(BUSINESS_INDUSTRIES).map(([key, value]) => <option key={key} value={key}>{value.label}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="business-name" className="block text-xs font-bold uppercase tracking-wider text-theme-text-muted mb-1">Business name *</label>
            <input id="business-name" value={brand.brandName} onChange={updateBrand('brandName')} maxLength={60} placeholder="e.g. Northside Heating & Air" className="w-full text-sm bg-theme-bg/50 border border-theme-border rounded-lg p-2.5 text-theme-text" />
          </div>
          <div>
            <label htmlFor="business-logo" className="block text-xs font-bold uppercase tracking-wider text-theme-text-muted mb-1">Logo URL (optional)</label>
            <input id="business-logo" type="url" value={brand.brandLogo} onChange={updateBrand('brandLogo')} maxLength={250} placeholder="https://example.com/logo.png" className="w-full text-sm bg-theme-bg/50 border border-theme-border rounded-lg p-2.5 text-theme-text" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="business-phone" className="block text-xs font-bold uppercase tracking-wider text-theme-text-muted mb-1">Phone (optional)</label>
              <input id="business-phone" type="tel" value={brand.brandPhone} onChange={updateBrand('brandPhone')} maxLength={24} placeholder="555-0100" className="w-full text-sm bg-theme-bg/50 border border-theme-border rounded-lg p-2.5 text-theme-text" />
            </div>
            <div>
              <label htmlFor="business-email" className="block text-xs font-bold uppercase tracking-wider text-theme-text-muted mb-1">Email (optional)</label>
              <input id="business-email" type="email" value={brand.brandEmail} onChange={updateBrand('brandEmail')} maxLength={80} placeholder="service@example.com" className="w-full text-sm bg-theme-bg/50 border border-theme-border rounded-lg p-2.5 text-theme-text" />
            </div>
          </div>
          <div className="grid grid-cols-[1fr_auto] gap-4 items-end">
            <div>
              <label htmlFor="business-website" className="block text-xs font-bold uppercase tracking-wider text-theme-text-muted mb-1">Website (optional)</label>
              <input id="business-website" type="url" value={brand.brandWeb} onChange={updateBrand('brandWeb')} maxLength={120} placeholder="example.com" className="w-full text-sm bg-theme-bg/50 border border-theme-border rounded-lg p-2.5 text-theme-text" />
            </div>
            <div>
              <label htmlFor="business-color" className="block text-xs font-bold uppercase tracking-wider text-theme-text-muted mb-1">Brand color</label>
              <input id="business-color" aria-label="Brand color" type="color" value={`#${normalizeBusinessBrand(brand).brandColor}`} onChange={updateBrandColor} className="w-12 h-10 border border-theme-border rounded-lg cursor-pointer bg-transparent" />
            </div>
          </div>
          <div className="rounded-xl border border-theme-border/70 bg-theme-bg/30 p-4">
            <h2 className="font-serif font-bold text-theme-text mb-2">{BUSINESS_INDUSTRIES[industry].label} customer schedule</h2>
            <ul className="space-y-1 text-sm text-theme-text-muted">
              {tasks.map((task) => <li key={task.id}>• {task.name} — every {task.interval} {task.unit}</li>)}
            </ul>
          </div>
        </section>

        <section className="rounded-xl border border-theme-border bg-theme-bg/30 p-5 flex flex-col gap-4" aria-label="Share and purchase">
          <div className="rounded-lg border border-theme-border/60 bg-theme-card/50 min-h-24 p-4 flex items-center justify-center">
            {brand.brandName.trim() ? (
              <div className="w-full flex items-center gap-3 border-b pb-3" style={{ borderColor: `#${normalizeBusinessBrand(brand).brandColor}` }}>
                {brand.brandLogo && <img src={normalizeBusinessBrand(brand).brandLogo} alt={`${brand.brandName} logo`} className="h-10 max-w-24 object-contain" />}
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-theme-text-muted">Customer calendar from</p>
                  <h2 className="font-serif font-bold text-theme-text">{normalizeBusinessBrand(brand).brandName}</h2>
                  {brand.brandPhone && <p className="text-xs text-theme-text-muted">{normalizeBusinessBrand(brand).brandPhone}</p>}
                </div>
              </div>
            ) : <p className="text-sm text-theme-text-muted italic">Add your business name to preview the branding.</p>}
          </div>

          <div>
            <label htmlFor="business-share-link" className="block text-xs font-bold uppercase tracking-wider text-theme-text-muted mb-1.5">Customer share link</label>
            <textarea id="business-share-link" readOnly value={generatedUrl} placeholder="Your branded calendar link appears here" className="w-full text-xs bg-theme-bg/80 border border-theme-border rounded-lg p-2.5 text-theme-text-muted resize-y min-h-[76px]" rows={3} />
            <div className="flex flex-wrap gap-2 mt-2">
              <button type="button" onClick={handleCopy} disabled={!generatedUrl} className="inline-flex items-center justify-center gap-1.5 text-xs font-bold py-2.5 px-4 rounded-lg border border-theme-border bg-theme-card hover:bg-theme-bg/80 disabled:opacity-40 disabled:cursor-not-allowed">
                {copied ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy link</>}
              </button>
              <a href={generatedUrl || undefined} target="_blank" rel="noopener noreferrer" aria-disabled={!generatedUrl} className="inline-flex items-center justify-center gap-1.5 text-xs font-bold py-2.5 px-4 rounded-lg bg-theme-accent text-white hover:bg-theme-accent-hover aria-disabled:opacity-40 aria-disabled:pointer-events-none">
                Test calendar <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 rounded-lg border border-theme-border/60 bg-theme-card/40 p-4">
            {qrDataUrl ? <img src={qrDataUrl} alt="QR code for customer calendar" className="w-36 h-36 rounded bg-white p-2" /> : <div className="w-36 h-36 rounded border border-dashed border-theme-border flex items-center justify-center text-theme-text-muted"><QrCode aria-hidden="true" /></div>}
            <div className="flex-1">
              <h2 className="font-serif font-bold text-theme-text">Calendar QR code</h2>
              <p className="text-xs text-theme-text-muted mt-1 mb-3">Scan to open this {BUSINESS_INDUSTRIES[industry].label.toLowerCase()} calendar on a phone.</p>
              {entitled && qrDataUrl ? (
                <a href={qrDataUrl} download="neatclock-business-calendar-qr.png" className="inline-flex items-center gap-1.5 text-xs font-bold py-2 px-3 rounded-lg bg-theme-accent text-white"><Download className="w-3.5 h-3.5" /> Download QR PNG</a>
              ) : (
                <button type="button" disabled={!generatedUrl || !qrDataUrl || !checkoutConfig?.available || purchaseState === 'starting' || purchaseState === 'verifying'} onClick={handleCheckout} className="text-xs font-bold py-2 px-3 rounded-lg border border-theme-border bg-theme-card text-theme-text disabled:opacity-40 disabled:cursor-not-allowed">
                  {purchaseState === 'starting' ? 'Opening secure checkout…' : checkoutConfig?.available ? `Purchase QR license · ${formatPrice(checkoutConfig.price)}` : 'QR download checkout unavailable'}
                </button>
              )}
              {entitled && <p className="text-xs text-green-700 mt-2" role="status">Payment verified. QR download is ready.</p>}
              {qrError && <p className="text-xs text-red-700 mt-2" role="alert">This share link could not be encoded. Shorten the branding details before purchase.</p>}
              {checkoutConfig && !checkoutConfig.available && <p className="text-xs text-theme-text-muted mt-2">Preview purchase settings are not configured. Calendar, share link, and QR preview remain available.</p>}
            </div>
          </div>

          {checkoutError && purchaseState !== 'failed' && <p role="alert" className="text-sm text-red-700">{checkoutError}</p>}
          {purchaseState === 'cancelled' && <p role="status" className="text-sm text-theme-text-muted">Checkout was cancelled. No payment was taken.</p>}
          {purchaseState === 'failed' && <p role="alert" className="text-sm text-red-700">{checkoutError}</p>}
          {purchaseState === 'failed' && (readPendingBusinessCheckout() || readSavedBusinessEntitlement()) && <button type="button" onClick={() => { const pending = readPendingBusinessCheckout(); const saved = readSavedBusinessEntitlement(); return verifyPurchase(new URLSearchParams(window.location.search).get('session_id') || pending?.checkoutSessionId || saved?.checkoutSessionId, pending?.orderProof || saved?.orderProof); }} className="self-start text-xs font-bold underline">Retry payment verification</button>}
          <form onSubmit={handleRecovery} className="rounded-lg border border-theme-border/60 p-3 space-y-2" aria-label="Recover a purchase">
            <label htmlFor="purchase-recovery-email" className="block text-xs font-bold">Recover a paid QR license on this device</label>
            <div className="flex gap-2">
              <input id="purchase-recovery-email" type="email" required maxLength={254} value={recoveryEmail} onChange={(event) => setRecoveryEmail(event.target.value)} placeholder="Purchaser email" className="min-w-0 flex-1 text-sm bg-theme-bg/50 border border-theme-border rounded-lg p-2.5" />
              <button type="submit" disabled={recoveryState === 'sending'} className="text-xs font-bold px-3 rounded-lg border border-theme-border">{recoveryState === 'sending' ? 'Sending…' : 'Email recovery link'}</button>
            </div>
            {recoveryState === 'sent' && <p role="status" className="text-xs text-theme-text-muted">If a matching purchase exists, a short-lived sign-in link will arrive shortly. You can retry after one minute.</p>}
            {recoveryState === 'failed' && <p role="alert" className="text-xs text-red-700">Recovery could not be completed. Check the address or request a fresh link.</p>}
          </form>
          <p className="text-[11px] leading-relaxed text-theme-text-muted">Your customers can add the calendar to Google, Apple, or Outlook. Schedule choices are a general reminder template, not a substitute for manufacturer instructions or a technician’s advice.</p>
        </section>
      </div>
    </div>
  );
}
