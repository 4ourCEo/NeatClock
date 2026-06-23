import { Plus, X, Calendar, Printer } from 'lucide-react';
import { PRESETS } from '../config/presets.js';

function PresetIcon({ presetName, className, isActive }) {
  const colorClass = isActive ? 'text-theme-accent' : 'text-theme-text-muted';

  if (presetName.includes('Homeowner')) {
    return (
      <svg className={`${className} ${colorClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    );
  }
  if (presetName.includes('Gearhead')) {
    return (
      <svg className={`${className} ${colorClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    );
  }
  if (presetName.includes('CFO')) {
    return (
      <svg className={`${className} ${colorClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M12 16v1M10 21h4a2 2 0 002-2V7a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    );
  }
  return <Calendar className={`${className} ${colorClass}`} />;
}

export default function PresetSelector({
  activePreset,
  customPresets,
  onSelectPreset,
  onSavePreset,
  onDeletePreset,
  presetCardLabel,
  showExportPreview,
  onToggleExportPreview,
  printPreview,
  onTogglePrintPreview,
  onReset,
}) {
  return (
    <div className="flex flex-col gap-6">
      <div id="preset-section">
        <span className="block text-xs font-semibold uppercase tracking-wider text-theme-text-muted mb-3 text-center md:text-left">
          Select Schedule Preset
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(PRESETS).map(([presetName, presetTasks]) => {
            const isActive = activePreset === presetName;
            return (
              <button
                key={presetName}
                id={`preset-${presetName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                onClick={() => onSelectPreset(presetName, false)}
                className={`p-4 rounded-xl border text-left transition-all duration-300 cursor-pointer flex flex-col justify-between h-28 relative overflow-hidden group ${
                  isActive
                    ? 'bg-theme-accent/15 border-theme-accent text-theme-text shadow-[var(--theme-shadow-md)] ring-1 ring-theme-accent/40'
                    : 'bg-theme-card border-theme-border text-theme-text shadow-[var(--theme-shadow-sm)] hover:border-theme-text-muted hover:shadow-[var(--theme-shadow-md)]'
                }`}
              >
                <div className="flex justify-between items-start w-full">
                  <PresetIcon
                    presetName={presetName}
                    className="w-6 h-6 transition-transform group-hover:scale-110"
                    isActive={isActive}
                  />
                  <span className="text-[9px] uppercase font-bold tracking-widest opacity-60">Template</span>
                </div>
                <div>
                  <h3 className="font-serif text-sm font-semibold leading-snug mb-1 line-clamp-2">{presetCardLabel(presetName)}</h3>
                  <p className="text-[10px] text-theme-text-muted truncate">{presetTasks.length} tasks</p>
                </div>
                <div className="absolute -bottom-6 -right-6 w-12 h-12 rounded-full bg-theme-accent/5 filter blur-md group-hover:scale-150 transition-all duration-500" />
              </button>
            );
          })}

          {Object.keys(customPresets).map((presetName) => {
            const isActive = activePreset === presetName;
            const presetTasks = customPresets[presetName];
            return (
              <div
                key={presetName}
                className={`rounded-xl border text-left transition-all duration-300 flex flex-col justify-between h-28 relative overflow-hidden group ${
                  isActive
                    ? 'bg-theme-accent/15 border-theme-accent text-theme-text shadow-[var(--theme-shadow-md)] ring-1 ring-theme-accent/40'
                    : 'bg-theme-card border-theme-border text-theme-text shadow-[var(--theme-shadow-sm)] hover:border-theme-text-muted hover:shadow-[var(--theme-shadow-md)]'
                }`}
              >
                <button
                  onClick={() => onSelectPreset(presetName, true)}
                  className="p-4 w-full h-full flex flex-col justify-between text-left cursor-pointer focus:outline-none"
                >
                  <div className="flex justify-between items-start w-full">
                    <svg className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-theme-accent' : 'text-theme-text-muted'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.907c.961 0 1.36 1.24.588 1.81l-3.97 2.883a1 1 0 00-.364 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.971-2.883a1 1 0 00-1.175 0l-3.97 2.883c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h4.907a1 1 0 00.95-.69l1.519-4.674z" />
                    </svg>
                    <span className="text-[9px] uppercase font-bold tracking-widest opacity-60">Custom</span>
                  </div>
                  <div>
                    <h3 className="font-serif text-sm font-semibold truncate leading-none mb-1">{presetName}</h3>
                    <p className="text-[10px] text-theme-text-muted truncate">{presetTasks.length} tasks</p>
                  </div>
                </button>
                <button
                  onClick={(e) => onDeletePreset(presetName, e)}
                  className="absolute top-2.5 right-2.5 text-theme-text-muted hover:text-red-500 cursor-pointer focus:outline-none p-1 z-10 transition-colors"
                  title={`Delete custom preset ${presetName}`}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <div className="absolute -bottom-6 -right-6 w-12 h-12 rounded-full bg-theme-accent/5 filter blur-md group-hover:scale-150 transition-all duration-500" />
              </div>
            );
          })}

          <button
            onClick={onSavePreset}
            className="p-4 rounded-xl border border-dashed border-theme-accent/40 hover:border-theme-accent bg-theme-bg/10 hover:bg-theme-bg/30 text-theme-accent transition-all duration-300 cursor-pointer flex flex-col justify-center items-center h-28 text-center group focus:outline-none"
            title="Save current tasks as preset template"
          >
            <Plus className="w-6 h-6 mb-2 group-hover:scale-110 transition-transform" />
            <span className="font-serif text-sm font-semibold leading-none">Save Preset</span>
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-x-5 gap-y-3 items-center justify-between border-t pt-5 border-theme-border/60">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-semibold uppercase tracking-wider text-theme-text-muted">
            Current View:
          </span>
          <span className="text-sm font-medium px-2.5 py-1 rounded bg-theme-accent/15 text-theme-text ring-1 ring-theme-accent/30">
            {activePreset}
          </span>
        </div>

        <div className="flex flex-wrap gap-3 sm:gap-4">
          <button
            onClick={onToggleExportPreview}
            className={`px-4 py-2 text-xs font-medium rounded-lg border flex items-center gap-2 transition-all cursor-pointer ${
              showExportPreview
                ? 'bg-theme-accent/15 border-theme-border text-theme-text font-semibold ring-1 ring-theme-accent/30'
                : 'border-theme-border hover:bg-theme-bg/60 text-theme-text-muted bg-theme-card'
            }`}
            title="Preview when tasks would first appear if you export today"
          >
            <Calendar className="w-3.5 h-3.5" />
            {showExportPreview ? 'Hide Preview' : 'Show Export Preview'}
          </button>
          <button
            id="btn-print-preview-toggle"
            onClick={onTogglePrintPreview}
            className={`px-4 py-2 text-xs font-medium rounded-lg border flex items-center gap-2 transition-all cursor-pointer ${
              printPreview
                ? 'bg-theme-accent text-white border-theme-accent hover:bg-theme-accent-hover'
                : 'border-theme-border hover:bg-theme-bg/60 text-theme-text-muted bg-theme-card'
            }`}
          >
            <Printer className="w-3.5 h-3.5" />
            {printPreview ? 'Interactive View' : 'Printer Friendly View'}
          </button>
          <button
            onClick={onReset}
            className="px-4 py-2 text-xs font-medium rounded-lg border border-theme-border bg-theme-card text-theme-text-muted hover:bg-theme-bg/60 cursor-pointer transition-colors"
            title="Reset schedule to defaults"
          >
            Reset
          </button>
        </div>
      </div>
    </div>
  );
}
