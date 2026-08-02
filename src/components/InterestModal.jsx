import { useState } from 'react';
import { Check, Loader2, Sparkles } from 'lucide-react';
import {
  buildInitialInterestState,
  INTEREST_OPTIONS,
  PRESET_OPTIONS,
  PURCHASE_OPTIONS,
  validateInterestForm,
} from '../config/interestForm.js';
import { submitInterestForm } from '../lib/submitInterest.js';
import { trackEvent } from '../lib/analytics.js';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

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
          ? 'border-primary bg-accent/35 ring-1 ring-primary/25 shadow-sm'
          : 'border-border bg-card/40 hover:border-muted-foreground hover:bg-card/70'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className={`font-medium text-foreground ${compact ? 'text-xs' : 'text-sm'}`}>{title}</p>
          {description && (
            <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">{description}</p>
          )}
        </div>
        <span
          className={`shrink-0 w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
            selected ? 'border-primary bg-primary text-primary-foreground' : 'border-border'
          }`}
          aria-hidden="true"
        >
          {selected && <Check className="w-3 h-3" strokeWidth={3} />}
        </span>
      </div>
    </button>
  );
}

export default function InterestModal({
  open = true,
  onClose,
  activePreset,
  source = 'footer',
  onSuccess,
}) {
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
      trackEvent('interest_submit', {
        source,
        preset: form.preset,
        interests: form.interests.join(','),
        purchase_intent: form.purchaseIntent,
      });
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClose();
      }}
    >
      <DialogContent size="lg" className="md:p-8 z-[60]" overlayClassName="z-[60]" showCloseButton>
        {done ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <DialogHeader className="items-center text-center">
              <DialogTitle>Thank you</DialogTitle>
              <DialogDescription className="max-w-xs mx-auto">
                Your feedback helps us know when to launch extras — without changing the free tool you use today.
              </DialogDescription>
            </DialogHeader>
            <Button type="button" onClick={onClose} className="mt-6">
              Back to NeatClock
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <DialogHeader>
              <p className="text-[10px] uppercase tracking-widest font-semibold text-primary mb-2">
                Shape what&apos;s next
              </p>
              <DialogTitle className="pr-8 md:text-2xl">
                What would help after export?
              </DialogTitle>
              <DialogDescription>
                NeatClock stays free. This takes half a minute and tells us what&apos;s worth building.
              </DialogDescription>
            </DialogHeader>

            <fieldset className="space-y-3">
              <legend className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
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
              <legend className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
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
              <legend className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
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
                        ? 'border-primary bg-accent/50 text-foreground'
                        : 'border-border text-muted-foreground hover:border-muted-foreground'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="space-y-2">
              <Label
                htmlFor="interest-email"
                className="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
              >
                4 — Email (optional)
              </Label>
              <Input
                id="interest-email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="Notify me when print packs launch"
                className="h-auto px-4 py-3 rounded-xl bg-card/30 focus:bg-card"
                autoComplete="email"
              />
            </div>

            {error && (
              <p className="text-xs text-destructive font-medium" role="alert">
                {error}
              </p>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button type="submit" disabled={submitting} className="flex-1 h-auto py-3">
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending…
                  </>
                ) : (
                  'Send feedback'
                )}
              </Button>
              <Button type="button" variant="outline" className="h-auto py-3" onClick={onClose}>
                Not now
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
