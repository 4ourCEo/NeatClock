import { Printer } from 'lucide-react';
import { ExportExtras } from './SiteExtras.jsx';
import { features } from '../config/features.js';
import { interestFormEnabled } from '../config/monetization.js';
import { shouldShowMonetization } from '../lib/preview.js';

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
  return (
    <>
      {confirmModal && (
        <div className="modal-overlay no-print" role="dialog" aria-modal="true" aria-labelledby="confirm-modal-title">
          <div className="modal-backdrop" aria-hidden="true" />
          <div className="modal-panel-wrap">
            <div className="modal-panel md:p-8 transition-all duration-300 animate-slide-up">
              <h3 id="confirm-modal-title" className="font-serif text-xl font-semibold mb-3 text-theme-text">
                {confirmModal.title}
              </h3>
              <p className="text-sm text-theme-text-muted mb-6 leading-relaxed">
                {confirmModal.message}
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={onCloseConfirm}
                  className="px-4 py-2 text-xs font-medium rounded border cursor-pointer border-theme-border bg-theme-card hover:bg-theme-bg/60 text-theme-text focus:outline-none transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmModal.onConfirm}
                  className="btn-primary px-4 py-2 text-xs font-medium rounded cursor-pointer shadow-sm focus:outline-none transition-colors inline-flex items-center justify-center"
                >
                  Confirm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {presetModalOpen && (
        <div className="modal-overlay no-print" role="dialog" aria-modal="true">
          <div className="modal-backdrop" aria-hidden="true" />
          <div className="modal-panel-wrap">
            <div className="modal-panel md:p-8 transition-all duration-300 animate-slide-up">
              <h3 className="font-serif text-xl font-semibold mb-3 text-theme-text">
                Save Current Preset
              </h3>
              <p className="text-xs text-theme-text-muted mb-4 leading-relaxed">
                Enter a unique name for your custom recurring task list preset:
              </p>
              <div className="mb-4">
                <input
                  id="input-preset-name"
                  type="text"
                  value={presetNameInput}
                  onChange={(e) => onPresetNameChange(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') onSubmitSavePreset();
                  }}
                  placeholder="e.g. Monthly Cleaning, Auto Maintenance"
                  className="w-full px-3 py-2 text-sm rounded border bg-transparent border-theme-border text-theme-text focus:outline-none focus:border-theme-accent transition-colors"
                  autoFocus
                />
                {presetNameError && (
                  <p className="text-red-500 text-xs mt-1.5 font-medium">{presetNameError}</p>
                )}
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={onClosePresetModal}
                  className="px-4 py-2 text-xs font-medium rounded border cursor-pointer border-theme-border bg-theme-card hover:bg-theme-bg/60 text-theme-text focus:outline-none transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={onSubmitSavePreset}
                  className="btn-primary px-4 py-2 text-xs font-medium rounded cursor-pointer shadow-sm focus:outline-none transition-colors inline-flex items-center justify-center"
                >
                  Save Preset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {exportSuccessOpen && (
        <div className="modal-overlay no-print" role="dialog" aria-modal="true">
          <div className="modal-backdrop" aria-hidden="true" />
          <div className="modal-panel-wrap">
            <div className="modal-panel modal-panel-lg md:p-8 transition-all duration-300 animate-slide-up">
              <h3 className="font-serif text-xl font-semibold mb-2 text-theme-text">
                Calendar downloaded
              </h3>
              <p className="text-sm text-theme-text-muted mb-3 leading-relaxed">
                Your <strong className="text-theme-text">neatclock-schedule.ics</strong> file is ready.
              </p>
              <p className="text-xs text-theme-text-muted mb-5 leading-relaxed">
                <strong className="text-theme-text">Import:</strong> Google Calendar → Settings → Import
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={onExportSuccessPrint}
                  className="flex-1 px-4 py-3 text-sm font-medium rounded-lg border cursor-pointer border-theme-border bg-theme-card hover:bg-theme-bg/60 text-theme-text transition-colors flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  Print Checklist
                </button>
                <button
                  type="button"
                  onClick={onScrollToPresets}
                  className="btn-primary flex flex-1 items-center justify-center px-4 py-3 text-sm font-medium rounded-lg cursor-pointer shadow-sm"
                >
                  Try Another Preset
                </button>
              </div>
              <button
                type="button"
                onClick={onCloseExportSuccess}
                className="w-full mt-3 px-4 py-2 text-xs font-medium text-theme-text-muted hover:text-theme-text cursor-pointer transition-colors"
              >
                Keep editing this schedule
              </button>
              <ExportExtras
                activePreset={activePreset}
                onPrint={onExportSuccessPrint}
              />
              {interestFormEnabled && !shouldShowMonetization(features.neatclockPrints) && (
                <p className="mt-5 pt-5 border-t border-theme-border/60 text-center">
                  <button
                    type="button"
                    onClick={onOpenInterest}
                    className="text-xs text-theme-text-muted hover:text-theme-accent transition-colors cursor-pointer"
                  >
                    Want a print version?
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
