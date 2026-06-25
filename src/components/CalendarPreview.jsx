import { useState } from 'react';
import { Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { isRhythmHighlighted } from '../lib/schedulePreview.js';

export default function CalendarPreview({ tasks }) {
  const [isOpen, setIsOpen] = useState(false);
  const [hoveredTaskId, setHoveredTaskId] = useState(null);

  // Get the next 12 months starting from current month
  const getMonthsList = () => {
    const months = [];
    const today = new Date();
    let currentMonth = today.getMonth(); // 0-indexed
    let currentYear = today.getFullYear();

    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];

    for (let i = 0; i < 12; i++) {
      const monthIndex = (currentMonth + i) % 12;
      const yearOffset = Math.floor((currentMonth + i) / 12);
      months.push({
        index: i + 1, // 1-indexed relative offset for rhythm calculation
        name: monthNames[monthIndex],
        shortName: monthNames[monthIndex].slice(0, 3),
        year: currentYear + yearOffset,
      });
    }
    return months;
  };

  const months = getMonthsList();

  return (
    <div className="no-print mt-6 md:mt-8 surface-panel border border-theme-border/60 overflow-hidden transition-all duration-500">
      {/* Accordion Header */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-4 font-serif text-sm font-semibold text-theme-text hover:bg-theme-bg/30 transition-colors focus:outline-none cursor-pointer"
      >
        <div className="flex items-center gap-2.5">
          <Calendar className="w-4.5 h-4.5 text-theme-accent" />
          <span>Yearly Calendar Horizon (Occurrences Preview)</span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-theme-text-muted" />
        ) : (
          <ChevronDown className="w-4 h-4 text-theme-text-muted" />
        )}
      </button>

      {/* Accordion Content */}
      <div
        className={`transition-all duration-500 ease-in-out ${
          isOpen ? 'max-h-[1200px] border-t border-theme-border/40 p-5' : 'max-h-0 opacity-0 pointer-events-none'
        }`}
      >
        <p className="text-[11px] text-theme-text-muted mb-4 font-sans">
          This horizon simulates when your recurring tasks fall over the next 12 months. Hover over a task to highlight its annual occurrence rhythm.
        </p>

        {tasks.length === 0 ? (
          <div className="text-center py-6 font-serif italic text-theme-text-muted text-sm">
            Add tasks above to preview your calendar horizon.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {months.map((month) => {
              // Find tasks occurring in this month
              const recurringTasks = tasks.filter((task) =>
                isRhythmHighlighted(task, month.index)
              );

              return (
                <div
                  key={month.index}
                  className="surface-well border border-theme-border/40 p-3 rounded-xl flex flex-col min-h-[140px] hover:border-theme-accent/60 transition-all duration-300 shadow-[var(--theme-shadow-sm)] bg-theme-card/40"
                >
                  {/* Month header */}
                  <div className="flex justify-between items-baseline mb-2 border-b border-theme-border/30 pb-1.5">
                    <span className="font-serif font-bold text-xs text-theme-text">
                      {month.name}
                    </span>
                    <span className="text-[9px] font-mono text-theme-text-muted">
                      {month.year}
                    </span>
                  </div>

                  {/* Tasks List */}
                  <div className="flex-1 flex flex-col gap-1.5 overflow-y-auto max-h-[120px] scrollbar-thin">
                    {recurringTasks.length === 0 ? (
                      <span className="text-[10px] italic text-theme-text-muted/60 mt-2 text-center">
                        Relax 🏖️
                      </span>
                    ) : (
                      recurringTasks.map((task) => {
                        const isHovered = hoveredTaskId === task.id;
                        const isAnyHovered = hoveredTaskId !== null;

                        return (
                          <div
                            key={task.id}
                            onMouseEnter={() => setHoveredTaskId(task.id)}
                            onMouseLeave={() => setHoveredTaskId(null)}
                            className={`px-1.5 py-1 rounded text-[9px] transition-all duration-200 cursor-help flex items-center gap-1.5 border leading-tight ${
                              isHovered
                                ? 'bg-theme-accent/20 border-theme-accent/40 text-theme-text font-medium scale-[1.02] shadow-sm'
                                : isAnyHovered
                                ? 'opacity-35 bg-theme-bg/10 border-transparent text-theme-text-muted'
                                : 'bg-theme-bg/30 border-theme-border/20 text-theme-text-muted hover:border-theme-accent/30'
                            } ${task.checked ? 'line-through opacity-45' : ''}`}
                            title={`Every ${task.interval} ${task.unit}`}
                          >
                            {/* Color Dot indicator */}
                            <div className="w-1.5 h-1.5 rounded-full bg-theme-accent shrink-0" />
                            <span className="truncate">{task.name}</span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
