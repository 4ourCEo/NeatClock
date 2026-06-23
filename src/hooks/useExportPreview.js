import { useMemo } from 'react';
import { calculateFirstOccurrence } from '../lib/schedulePreview.js';

export function useExportPreview(tasks) {
  return useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const occurrences = tasks.map(task => {
      const firstDate = calculateFirstOccurrence(task);
      const isValid = !isNaN(firstDate.getTime());

      const daysUntil = isValid
        ? Math.ceil((firstDate - today) / (1000 * 60 * 60 * 24))
        : 0;

      return {
        task,
        firstDate,
        daysUntil,
        formattedDate: isValid
          ? firstDate.toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })
          : 'Invalid Date',
      };
    });

    occurrences.sort((a, b) => a.firstDate - b.firstDate);
    return occurrences.slice(0, 10);
  }, [tasks]);
}
