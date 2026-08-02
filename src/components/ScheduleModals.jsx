import { useEffect, useRef } from 'react';
import { Printer } from 'lucide-react';
import { ExportExtras } from './SiteExtras.jsx';
import { InterestExportSection } from './InterestInvite.jsx';
import { features } from '../config/features.js';
import { interestFormEnabled } from '../config/monetization.js';
import { shouldShowMonetization } from '../lib/preview.js';
import { buildPresetShareUrl } from '../lib/shareLinks.js';
import { trackEvent } from '../lib/analytics.js';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

export default function ScheduleModals({
  confirmModal,
  onCloseConfirm,
  presetModalOpen,
  presetNameInput,
  presetNameError,
  onPresetNameChange,
  onClosePresetModal,
  onSubmitSavePreset,
  exportSuccessOpen,
  onCloseExportSuccess,
  onExportSuccessPrint,
  onScrollToPresets,
  activePreset,
  onOpenInterest,
}) {
  const shareUrl = buildPresetShareUrl(activePreset, { medium: 'qr_sync', campaign: 'export_success' });
  const qrTrackedRef = useRef(false);

  useEffect(() => {
    if (!exportSuccessOpen) {
      qrTrackedRef.current = false;
      return;
    }
    if (qrTrackedRef.current) return;
    qrTrackedRef.current = true;
    trackEvent('qr_sync_shown', { preset: activePreset });
  }, [exportSuccessOpen, activePreset]);

  return (
    <>
      <Dialog
        open={Boolean(confirmModal)}
        onOpenChange={(open) => {
          if (!open) onCloseConfirm();
        }}
      >
        <DialogContent showCloseButton={false} className="md:p-8">
          <DialogHeader>
            <DialogTitle>{confirmModal?.title}</DialogTitle>
            <DialogDescription>{confirmModal?.message}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3">
            <Button type="button" variant="outline" size="sm" onClick={onCloseConfirm}>
              Cancel
            </Button>
            <Button type="button" size="sm" onClick={confirmModal?.onConfirm}>
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={presetModalOpen}
        onOpenChange={(open) => {
          if (!open) onClosePresetModal();
        }}
      >
        <DialogContent showCloseButton={false} className="md:p-8">
          <DialogHeader>
            <DialogTitle>Save Current Preset</DialogTitle>
            <DialogDescription>
              Enter a unique name for your custom recurring task list preset:
            </DialogDescription>
          </DialogHeader>
          <div>
            <Input
              id="input-preset-name"
              type="text"
              value={presetNameInput}
              onChange={(e) => onPresetNameChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onSubmitSavePreset();
              }}
              placeholder="e.g. Monthly Cleaning, Auto Maintenance"
              autoFocus
              aria-invalid={Boolean(presetNameError)}
            />
            {presetNameError && (
              <p className="text-destructive text-xs mt-1.5 font-medium">{presetNameError}</p>
            )}
          </div>
          <DialogFooter className="gap-3">
            <Button type="button" variant="outline" size="sm" onClick={onClosePresetModal}>
              Cancel
            </Button>
            <Button type="button" size="sm" onClick={onSubmitSavePreset}>
              Save Preset
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={exportSuccessOpen}
        onOpenChange={(open) => {
          if (!open) onCloseExportSuccess();
        }}
      >
        <DialogContent showCloseButton={false} size="lg" className="md:p-8">
          <DialogHeader>
            <DialogTitle>Calendar downloaded</DialogTitle>
            <DialogDescription>
              Your <strong className="text-foreground">neatclock-schedule.ics</strong> file is ready.
            </DialogDescription>
          </DialogHeader>
          <p className="text-xs text-muted-foreground leading-relaxed space-y-1">
            <span className="block">
              <strong className="text-foreground">Google:</strong> calendar.google.com → Settings → Import
            </span>
            <span className="block">
              <strong className="text-foreground">Apple:</strong> Calendar app → File → Import
            </span>
            <span className="block">
              <strong className="text-foreground">Outlook:</strong> Add calendar → Upload from file
            </span>
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-auto py-3 rounded-lg"
              onClick={onExportSuccessPrint}
            >
              <Printer className="w-4 h-4" />
              Print Checklist
            </Button>
            <Button
              type="button"
              className="flex-1 h-auto py-3 rounded-lg"
              onClick={onScrollToPresets}
            >
              Try Another Preset
            </Button>
          </div>

          <div className="hidden md:flex flex-col items-center p-4 border border-border/30 bg-background/40 rounded-xl">
            <p className="text-xs font-semibold text-foreground mb-1">📱 Sync to Mobile</p>
            <p className="text-[10px] text-muted-foreground text-center mb-3">
              Scan to load this schedule on your phone and add it directly to your mobile calendar.
            </p>
            <div className="bg-white p-2 rounded-lg shadow-[0_1px_3px_rgba(0,0,0,0.05)] select-none">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(shareUrl)}`}
                alt="Sync QR Code"
                className="w-28 h-28 object-contain"
                width="112"
                height="112"
                loading="lazy"
              />
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            className="w-full text-xs text-muted-foreground"
            onClick={onCloseExportSuccess}
          >
            Keep editing this schedule
          </Button>
          <ExportExtras
            activePreset={activePreset}
            onPrint={onExportSuccessPrint}
          />
          {interestFormEnabled && !shouldShowMonetization(features.neatclockPrints) && (
            <InterestExportSection onOpen={onOpenInterest} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
