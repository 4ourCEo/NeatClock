import { useState } from 'react';
import { Check, Loader2, Sparkles, X } from 'lucide-react';
import {
  buildInitialInterestState,
  INTEREST_OPTIONS,
  PRESET_OPTIONS,
  PURCHASE_OPTIONS,
  validateInterestForm,
} from '../config/interestForm.js';
import { submitInterestForm } from '../lib/submitInterest.js';

function SelectCard({ selected, onClick, title, description, compact = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`w-full text-left rounded-xl border transition-all duration-200 cursor-pointer ${
        compact ? 'p-3' : 'p-4'
      } ${
        selected
          ? 'border-theme-accent bg-theme-highlight/35 ring-1 ring-theme-accent/25 shadow-sm'
          : 'border-theme-border bg-theme-card/40 hover:border-theme-text-muted hover:bg-theme-card/70'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={`font-medium text-theme-text ${compact ? 'text-xs' : 'text-sm'}`}>{title}</p>
          {description && (
            <p className="text-[11px] text-theme-text-muted mt-1 leading-relaxed">{description}</p>
          )}
        </div>
        <span
          className={`shrink-0 w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
            selected ? 'border-theme-accent bg-theme-accent text-white' : 'border-theme-border'
          }`}
          aria-hidden="true"
        >
          {selected && <Check className="w-3 h-3" strokeWidth={3} />}
        </span>
      </div>
    </button>
  );
}

export default function InterestModal({ onClose, activePreset, source = 'footer', onSuccess }) {
  const [form, setForm] = useState(() => buildInitialInterestState(activePreset));
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const toggleInterest = (id) => {
    setForm((prev) => {
      if (id === 'free-enough') {
        return { ...prev, interests: prev.interests.includes(id) ? [] : [id] };
      }
      const withoutFree = prev.interests.filter((i) => i !== 'free-enough');
      const next = withoutFree.includes(id)
        ? withoutFree.filter((i) => i !== id)
        : [...withoutFree, id];
      return { ...prev, interests: next };
    });
    setError('');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationError = validateInterestForm(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await submitInterestForm({
        preset: form.preset,
        interests: form.interests.join(', '),
        purchase_intent: form.purchaseIntent,
        email: form.email || '(not provided)',
        source,
      });
      setDone(true);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="modal-overlay no-print z-[60]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="interest-modal-title"
    >
      <div className="modal-backdrop" aria-hidden="true" />
      <div className="modal-panel-wrap">
      <div className="modal-panel modal-panel-lg md:p-8 max-h-[90vh] overflow-y-auto relative transition-all duration-300 animate-slide-up">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-theme-text-muted hover:text-theme-text p-1.5 rounded-lg hover:bg-theme-bg/50 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {done ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-full bg-theme-highlight flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6 text-theme-accent" />
            </div>
            <h2 id="interest-modal-title" className="font-serif text-xl font-semibold text-theme-text mb-2">
              Thank you
            </h2>
            <p className="text-sm text-theme-text-muted leading-relaxed max-w-xs mx-auto">
              Your feedback helps us know when to launch extras — without changing the free tool you use today.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="btn-primary mt-6 px-6 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-colors"
            >
              Back to NeatClock
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <header>
              <p className="text-[10px] uppercase tracking-widest font-semibold text-theme-accent mb-2">
                Shape what&apos;s next
              </p>
              <h2 id="interest-modal-title" className="font-serif text-xl md:text-2xl font-semibold text-theme-text pr-8">
                What would help after export?
              </h2>
              <p className="text-sm text-theme-text-muted mt-2 leading-relaxed">
                NeatClock stays free. This takes half a minute and tells us what&apos;s worth building.
              </p>
            </header>

            <fieldset className="space-y-3">
              <legend className="text-xs font-semibold uppercase tracking-wider text-theme-text-muted mb-3">
                1 — Which schedule do you use most?
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PRESET_OPTIONS.map((option) => (
                  <SelectCard
                    key={option.id}
                    compact
                    selected={form.preset === option.value}
                    onClick={() => {
                      setForm((prev) => ({ ...prev, preset: option.value }));
                      setError('');
                    }}
                    title={option.label}
                  />
                ))}
              </div>
            </fieldset>

            <fieldset className="space-y-3">
              <legend className="text-xs font-semibold uppercase tracking-wider text-theme-text-muted mb-3">
                2 — After exporting, what would be useful?
              </legend>
              <div className="space-y-2">
                {INTEREST_OPTIONS.map((option) => (
                  <SelectCard
                    key={option.id}
                    selected={form.interests.includes(option.id)}
                    onClick={() => toggleInterest(option.id)}
                    title={option.label}
                    description={option.description}
                  />
                ))}
              </div>
            </fieldset>

            <fieldset className="space-y-3">
              <legend className="text-xs font-semibold uppercase tracking-wider text-theme-text-muted mb-3">
                3 — Would you pay ~$5 for a styled print pack?
              </legend>
              <div className="flex flex-wrap gap-2">
                {PURCHASE_OPTIONS.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => {
                      setForm((prev) => ({ ...prev, purchaseIntent: option.value }));
                      setError('');
                    }}
                    className={`px-4 py-2 rounded-full text-xs font-medium border transition-all cursor-pointer ${
                      form.purchaseIntent === option.value
                        ? 'border-theme-accent bg-theme-highlight/50 text-theme-text'
                        : 'border-theme-border text-theme-text-muted hover:border-theme-text-muted'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="space-y-2">
              <label htmlFor="interest-email" className="text-xs font-semibold uppercase tracking-wider text-theme-text-muted">
                4 — Email (optional)
              </label>
              <input
                id="interest-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="Notify me when print packs launch"
                className="w-full px-4 py-3 rounded-xl border border-theme-border bg-theme-card/30 focus:bg-theme-card focus:border-theme-accent focus:ring-1 focus:ring-theme-accent text-sm text-theme-text placeholder-theme-text-muted/50 transition-all"
                autoComplete="email"
              />
            </div>

            {error && (
              <p className="text-xs text-red-500 font-medium" role="alert">
                {error}
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary flex-1 px-5 py-3 rounded-lg disabled:opacity-60 text-sm font-medium cursor-pointer transition-colors flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending…
                  </>
                ) : (
                  'Send feedback'
                )}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-3 rounded-lg border border-theme-border text-sm font-medium text-theme-text-muted hover:text-theme-text hover:bg-theme-bg/40 cursor-pointer transition-colors"
              >
                Not now
              </button>
            </div>
          </form>
        )}
      </div>
      </div>
    </div>
  );
}
