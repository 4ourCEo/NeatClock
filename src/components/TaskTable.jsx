import { useState } from 'react';
import { Trash2, GripVertical, ChevronUp, ChevronDown } from 'lucide-react';
import { isRhythmHighlighted } from '../lib/schedulePreview.js';
import {
  getGoogleCalLink,
  getOutlookCalLink,
  downloadAppleTaskIcs,
} from '../lib/calendarProviders.js';
import {
  GoogleCalendarIcon,
  OutlookCalendarIcon,
  AppleCalendarIcon,
  calendarProviderButtonClass,
} from './CalendarProviderIcons.jsx';

export default function TaskTable({
  tasks,
  setTasks,
  printPreview,
  onUpdateTaskName,
  onUpdateTaskInterval,
  onUpdateTaskUnit,
  onDeleteTask,
  onMoveTask,
  onToggleTaskChecked,
}) {
  const [draggedIdx, setDraggedIdx] = useState(null);

  const handleDragStart = (index) => {
    setDraggedIdx(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === index) return;

    const updated = [...tasks];
    const item = updated.splice(draggedIdx, 1)[0];
    updated.splice(index, 0, item);

    setDraggedIdx(index);
    setTasks(updated);
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left print-table">
        <thead>
          <tr className="border-b border-theme-border text-xs font-semibold uppercase tracking-wider text-theme-text-muted print:text-black print:border-black">
            {!printPreview && <th className="task-drag-col py-3 px-2 w-8 no-print" aria-hidden="true" />}
            <th className="py-3 px-2 w-10 text-center">Status</th>
            <th className="py-3 px-2">Recurring Task Name</th>
            <th className="py-3 px-1 sm:px-2 sm:w-44">Frequency</th>
            <th className="py-3 px-2 w-24 sm:w-40 text-center no-print">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task, idx) => {
            return (
              <tr
                key={task.id}
                draggable={!printPreview}
                onDragStart={() => handleDragStart(idx)}
                onDragOver={(e) => handleDragOver(e, idx)}
                onDragEnd={handleDragEnd}
                className={`print-task-row group border-b border-theme-border/30 hover:bg-theme-bg/10 print:border-black print:hover:bg-transparent transition-all duration-300 animate-slide-up ${
                  draggedIdx === idx ? 'opacity-30 bg-theme-bg border-dashed' : ''
                } ${!printPreview ? 'cursor-grab active:cursor-grabbing' : ''}`}
              >
                {/* Drag handle column */}
                {!printPreview && (
                  <td className="task-drag-col py-4 px-2 w-8 text-center align-middle no-print">
                    <GripVertical className="task-drag-handle w-3.5 h-3.5 text-theme-text-muted transition-opacity" />
                  </td>
                )}

                {/* Status Checkbox Column */}
                <td className="py-4 px-2 text-center align-middle">
                  {printPreview ? (
                    <span className="print-checkbox border border-black dark:border-white inline-block w-4 h-4 rounded-sm flex items-center justify-center">
                      {task.checked && (
                        <svg className="w-3 h-3 stroke-black dark:stroke-white stroke-[3.5] fill-none" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onToggleTaskChecked(task.id)}
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-300 focus:outline-none cursor-pointer mx-auto ${
                        task.checked
                          ? 'bg-theme-accent border-theme-accent text-theme-accent-text morph-checked'
                          : 'border-theme-border bg-theme-card hover:border-theme-accent text-transparent'
                      }`}
                      aria-label={task.checked ? 'Mark task incomplete' : 'Mark task complete'}
                    >
                      <svg
                        className="w-3.5 h-3.5 stroke-current stroke-[3] fill-none"
                        viewBox="0 0 24 24"
                      >
                        <path
                          className="morph-check-path"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </button>
                  )}
                </td>

                {/* Task Name Cell */}
                <td className="py-4 px-2">
                  {printPreview ? (
                    <span className={`font-serif ${task.checked ? 'line-through opacity-40' : ''}`}>
                      {task.name}
                    </span>
                  ) : (
                    <div className="flex flex-col gap-1 w-full">
                      <input
                        type="text"
                        value={task.name}
                        onChange={(e) => onUpdateTaskName(task.id, e.target.value)}
                        className={`w-full bg-transparent border-0 border-b border-transparent focus:border-theme-accent focus:ring-0 py-0 pl-0 pr-2 font-serif placeholder-theme-text-muted/40 focus:outline-none transition-all duration-300 ${
                          task.checked ? 'line-through opacity-40 text-theme-text-muted' : 'text-theme-text'
                        }`}
                        placeholder="Describe recurring task..."
                      />
                      {/* Rhythm Wave Indicator */}
                      <div className="flex items-center gap-1 text-[9px] text-theme-text-muted mt-1 h-3 no-print select-none">
                        <span className="mr-1 opacity-70">Frequency Rhythm:</span>
                        <div className="flex gap-0.5 items-center">
                          {Array.from({ length: 12 }).map((_, i) => {
                            const monthNum = i + 1;
                            const highlighted = isRhythmHighlighted(task, monthNum);

                            return (
                              <div
                                key={i}
                                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                                  highlighted
                                    ? 'bg-theme-accent scale-110'
                                    : 'bg-theme-border/60 hover:bg-theme-border'
                                }`}
                                title={`Month ${monthNum}`}
                              />
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </td>

                {/* Interval and Unit Cell */}
                <td className="py-4 px-2">
                  {printPreview ? (
                    <span className="text-theme-text-muted font-sans text-sm">
                      Every {task.interval}{' '}
                      {task.interval === 1
                        ? task.unit.replace(/s$/, '')
                        : task.unit}
                    </span>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-theme-text-muted text-xs font-sans">Every</span>
                        <input
                          type="number"
                          min="1"
                          max="120"
                          value={task.interval}
                          onChange={(e) => onUpdateTaskInterval(task.id, e.target.value)}
                          className="task-freq-number w-12 bg-theme-card border border-theme-border rounded px-1.5 py-1 text-center font-sans text-sm focus:border-theme-accent focus:ring-0 focus:outline-none text-theme-text"
                        />
                        <select
                          value={task.unit}
                          onChange={(e) => onUpdateTaskUnit(task.id, e.target.value)}
                          className="task-freq-unit bg-transparent border-0 border-b border-transparent focus:border-theme-accent focus:ring-0 py-1 pl-1 text-xs font-sans text-theme-text-muted focus:outline-none cursor-pointer"
                        >
                          <option value="weeks" className="bg-theme-card text-theme-text">week{task.interval > 1 ? 's' : ''}</option>
                          <option value="months" className="bg-theme-card text-theme-text">month{task.interval > 1 ? 's' : ''}</option>
                          <option value="years" className="bg-theme-card text-theme-text">year{task.interval > 1 ? 's' : ''}</option>
                        </select>
                      </div>
                      <div className="text-[10px] text-theme-text-muted/70 font-sans italic no-print select-none">
                        {(() => {
                          const num = parseInt(task.interval, 10);
                          if (isNaN(num) || num <= 0) return 'Every recurrence';
                          const cleanUnit = num === 1 ? task.unit.replace(/s$/, '') : task.unit;
                          return `Every ${num === 1 ? '' : num + ' '}${cleanUnit}`;
                        })()}
                      </div>
                    </div>
                  )}
                </td>

                {/* Action Cell */}
                <td className="py-4 px-2 text-center no-print">
                  <div className="task-row-actions flex items-center justify-center gap-0.5 sm:gap-1.5 focus-within:opacity-100 transition-opacity">
                    <button
                      type="button"
                      onClick={() => onMoveTask(idx, -1)}
                      disabled={idx === 0}
                      className="touch-target text-theme-text-muted hover:text-theme-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors p-1 cursor-pointer"
                      title="Move task up"
                      aria-label={`Move ${task.name} up`}
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onMoveTask(idx, 1)}
                      disabled={idx === tasks.length - 1}
                      className="touch-target text-theme-text-muted hover:text-theme-accent disabled:opacity-30 disabled:cursor-not-allowed transition-colors p-1 cursor-pointer"
                      title="Move task down"
                      aria-label={`Move ${task.name} down`}
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                    <a
                      href={getGoogleCalLink(task)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`hidden sm:inline-flex ${calendarProviderButtonClass}`}
                      title="Add to Google Calendar"
                      aria-label={`Add ${task.name} to Google Calendar`}
                    >
                      <GoogleCalendarIcon />
                    </a>
                    <a
                      href={getOutlookCalLink(task)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`hidden sm:inline-flex ${calendarProviderButtonClass}`}
                      title="Add to Outlook Calendar"
                      aria-label={`Add ${task.name} to Outlook Calendar`}
                    >
                      <OutlookCalendarIcon />
                    </a>
                    <button
                      type="button"
                      onClick={() => downloadAppleTaskIcs(task)}
                      className={`hidden sm:inline-flex ${calendarProviderButtonClass} cursor-pointer`}
                      title="Download .ics for Apple Calendar"
                      aria-label={`Download ${task.name} for Apple Calendar`}
                    >
                      <AppleCalendarIcon />
                    </button>
                    <button
                      onClick={() => onDeleteTask(task.id)}
                      className="touch-target text-theme-text-muted hover:text-red-500 transition-colors p-1 cursor-pointer focus:outline-none"
                      title="Delete task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
