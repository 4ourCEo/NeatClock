import { Download, Printer, Upload } from 'lucide-react';

export default function ExportActions({
  printPreview,
  onExportBackup,
  onImportBackupClick,
  onPrint,
  onExportICS,
  startOffsetSlot,
}) {
  return (
    <footer className="footer-safe border-t border-theme-border/60 pt-8 md:pt-10 mt-8 md:mt-10 flex flex-col items-center gap-8 no-print w-full">
      {startOffsetSlot}

      {!printPreview && (
        <div className="flex flex-wrap gap-3 justify-center w-full max-w-sm">
          <button
            type="button"
            onClick={onExportBackup}
            className="flex-1 min-w-[140px] px-4 py-2.5 text-xs font-medium rounded-lg border cursor-pointer border-theme-border bg-theme-card hover:bg-theme-bg/60 text-theme-text transition-colors flex items-center justify-center gap-2 shadow-[var(--theme-shadow-sm)] hover:shadow-[var(--theme-shadow-md)]"
            title="Download a JSON backup of your schedule"
          >
            <Download className="w-3.5 h-3.5" />
            Backup
          </button>
          <button
            type="button"
            onClick={onImportBackupClick}
            className="flex-1 min-w-[140px] px-4 py-2.5 text-xs font-medium rounded-lg border cursor-pointer border-theme-border bg-theme-card hover:bg-theme-bg/60 text-theme-text transition-colors flex items-center justify-center gap-2 shadow-[var(--theme-shadow-sm)] hover:shadow-[var(--theme-shadow-md)]"
            title="Restore from a JSON backup file"
          >
            <Upload className="w-3.5 h-3.5" />
            Restore
          </button>
        </div>
      )}

      <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center w-full">
        <button
          id="btn-print"
          onClick={onPrint}
          className="px-6 py-3 border font-medium rounded-lg text-sm transition-all flex items-center justify-center gap-2 cursor-pointer border-theme-border bg-theme-card hover:bg-theme-bg/60 text-theme-text min-w-[180px] shadow-[var(--theme-shadow-sm)] hover:shadow-[var(--theme-shadow-md)]"
        >
          <Printer className="w-4 h-4" />
          Print Checklist
        </button>
        <button
          id="btn-export-ics"
          onClick={onExportICS}
          className="px-7 py-3 bg-theme-accent hover:bg-theme-accent-hover text-theme-accent-text font-medium rounded-lg text-sm transition-all flex items-center justify-center gap-2 cursor-pointer min-w-[220px] shadow-[var(--theme-shadow-md)] hover:shadow-[var(--theme-shadow-lg)]"
        >
          <Download className="w-4 h-4" />
          Generate & Export .ics
        </button>
      </div>
    </footer>
  );
}
