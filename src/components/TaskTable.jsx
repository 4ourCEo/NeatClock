import { useState } from 'react';
import { Trash2, GripVertical, ChevronUp, ChevronDown } from 'lucide-react';
import { isRhythmHighlighted } from '../lib/schedulePreview.js';

export default function TaskTable({
  tasks,
  setTasks,
  printPreview,
  onUpdateTaskName,
  onUpdateTaskInterval,
  onUpdateTaskUnit,
  onDeleteTask,
  onMoveTask,
  getGoogleCalLink,
  getOutlookCalLink,
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
            {printPreview && <th className="py-3 px-2 w-12 text-center">Status</th>}
            <th className="py-3 px-2">Recurring Task Name</th>
            <th className="py-3 px-2 w-48">Frequency / Unit</th>
            <th className="py-3 px-2 w-28 text-center no-print">Actions</th>
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

                {/* Completion Checkbox Column for Print only */}
                {printPreview && (
                  <td className="py-4 px-2 text-center align-middle">
                    <span className="print-checkbox border border-black dark:border-white inline-block w-4 h-4 rounded-sm"></span>
                  </td>
                )}

                {/* Task Name Cell */}
                <td className="py-4 px-2">
                  {printPreview ? (
                    <span className="font-serif">
                      {task.name}
                    </span>
                  ) : (
                    <div className="flex flex-col gap-1 w-full">
                      <input
                        type="text"
                        value={task.name}
                        onChange={(e) => onUpdateTaskName(task.id, e.target.value)}
                        className="w-full bg-transparent border-0 border-b border-transparent focus:border-theme-accent focus:ring-0 py-0 pl-0 pr-2 font-serif text-theme-text placeholder-theme-text-muted/40 focus:outline-none transition-colors"
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
                      Every {task.interval} {task.unit}
                    </span>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <span className="text-theme-text-muted text-xs font-sans">Every</span>
                      <input
                        type="number"
                        min="1"
                        max="120"
                        value={task.interval}
                        onChange={(e) => onUpdateTaskInterval(task.id, e.target.value)}
                        className="w-12 bg-theme-card border border-theme-border rounded px-1.5 py-1 text-center font-sans text-sm focus:border-theme-accent focus:ring-0 focus:outline-none text-theme-text"
                      />
                      <select
                        value={task.unit}
                        onChange={(e) => onUpdateTaskUnit(task.id, e.target.value)}
                        className="bg-transparent border-0 border-b border-transparent focus:border-theme-accent focus:ring-0 py-1 pl-1 text-xs font-sans text-theme-text-muted focus:outline-none cursor-pointer"
                      >
                        <option value="weeks" className="bg-theme-card text-theme-text">week{task.interval > 1 ? 's' : ''}</option>
                        <option value="months" className="bg-theme-card text-theme-text">month{task.interval > 1 ? 's' : ''}</option>
                        <option value="years" className="bg-theme-card text-theme-text">year{task.interval > 1 ? 's' : ''}</option>
                      </select>
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
                      className="touch-target text-theme-text-muted hover:text-theme-accent transition-colors p-1"
                      title="Add to Google Calendar"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                      </svg>
                    </a>
                    <a
                      href={getOutlookCalLink(task)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="touch-target text-theme-text-muted hover:text-theme-accent transition-colors p-1"
                      title="Add to Outlook Calendar"
                    >
                      <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M16.5 12c1.38 0 2.5-1.12 2.5-2.5S17.88 7 16.5 7 14 8.12 14 9.5s1.12 2.5 2.5 2.5zM9 11c1.66 0 3-1.34 3-3S10.66 5 9 5 6 6.34 6 8s1.34 3 3 3zm7.5 3c-1.83 0-5.5.92-5.5 2.75V19h11v-2.25c0-1.83-3.67-2.75-5.5-2.75zM9 13c-2.33 0-7 1.17-7 3.5V19h10v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
                      </svg>
                    </a>
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
