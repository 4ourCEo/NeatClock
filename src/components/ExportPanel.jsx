import { Sparkles, Calendar } from 'lucide-react';

export function NaturalLanguageInput({
  nlInput,
  onNlInputChange,
  parsedNl,
  onAddNlTask,
}) {
  return (
    <div className="no-print mb-6">
      <div className="relative flex items-center">
        <input
          type="text"
          value={nlInput}
          onChange={(e) => onNlInputChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') onAddNlTask();
          }}
          placeholder="Type to create task, e.g. Wash car every 2 weeks or Check batteries every year"
          className="w-full pl-4 pr-16 py-3 rounded-xl border border-theme-border surface-well focus:bg-theme-card focus:outline-none focus:border-theme-accent focus:ring-1 focus:ring-theme-accent text-sm font-sans transition-all text-theme-text placeholder-theme-text-muted/60"
        />
        {parsedNl && (
          <button
            onClick={onAddNlTask}
            className="absolute right-2 bg-theme-accent hover:bg-theme-accent-hover text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-colors focus:outline-none cursor-pointer"
          >
            Add
          </button>
        )}
      </div>
      {parsedNl && (
        <p className="text-xs text-theme-text-muted mt-2 pl-2 animate-fade-in flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-theme-accent animate-pulse" />
          <span>Ready to add: <strong className="text-theme-text">"{parsedNl.name}"</strong> repeating every <strong className="text-theme-text">{parsedNl.interval} {parsedNl.unit}</strong></span>
        </p>
      )}
    </div>
  );
}

export function ExportPreviewAside({ exportPreview }) {
  return (
    <aside className="lg:col-span-1 no-print">
      <div className="surface-panel p-6 transition-all duration-300">
        <h2 className="font-serif text-lg font-semibold tracking-tight border-b pb-3 mb-2 border-theme-border/60 text-theme-text">
          Export Preview
        </h2>
        <p className="text-[11px] text-theme-text-muted mb-4 leading-relaxed">
          If you export today, recurring events would first appear around these dates. This is a preview — not a to-do list.
        </p>

        {exportPreview.length === 0 ? (
          <p className="text-xs text-theme-text-muted italic">Add tasks to see a preview.</p>
        ) : (
          <div className="flex flex-col gap-4">
            {exportPreview.map(({ task, formattedDate, daysUntil }, idx) => (
              <div
                key={`${task.id}-preview-${idx}`}
                className="flex gap-3 items-start border-l-2 pl-3 py-1 animate-slide-up border-theme-accent/60"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-serif text-sm font-medium truncate text-theme-text">
                    {task.name}
                  </h3>
                  <div className="flex flex-wrap gap-1.5 items-center mt-1 text-[11px] text-theme-text-muted">
                    <span>{formattedDate}</span>
                    <span className="opacity-40">•</span>
                    <span>
                      ~{daysUntil} day{daysUntil === 1 ? '' : 's'} from today
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}

export function StartOffsetSlider({ startOffsetWeeks, onStartOffsetChange }) {
  return (
    <div className="surface-panel w-full max-w-md mx-auto px-6 py-5 text-center">
      <span className="font-semibold text-theme-text flex items-center justify-center gap-2 text-sm">
        <Calendar className="w-4 h-4 text-theme-accent" />
        Start Offset: {startOffsetWeeks === 0 ? 'Today' : `+${startOffsetWeeks} Week${startOffsetWeeks > 1 ? 's' : ''}`}
      </span>
      <input
        type="range"
        min="0"
        max="12"
        value={startOffsetWeeks}
        onChange={(e) => {
          const parsed = parseInt(e.target.value, 10);
          onStartOffsetChange(Number.isNaN(parsed) ? 0 : Math.min(12, Math.max(0, parsed)));
        }}
        className="offset-slider w-full max-w-xs mx-auto mt-4 block"
        aria-label="Weeks to offset calendar export start date"
      />
      <span className="text-[11px] text-theme-text-muted mt-3 block leading-relaxed max-w-xs mx-auto">
        Offsets the start date of all events in your exported calendar file.
      </span>
    </div>
  );
}
