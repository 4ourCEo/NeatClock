export function isRhythmHighlighted(task, monthNum) {
  const interval = parseInt(task.interval, 10) || 1;

  if (task.unit === 'years') {
    return monthNum === 1;
  }
  if (task.unit === 'weeks') {
    return monthNum % Math.max(1, Math.round(interval / 4)) === 0;
  }
  return monthNum % interval === 0;
}

export function calculateFirstOccurrence(task) {
  const baseDateStr = new Date().toISOString().split('T')[0];
  const parts = baseDateStr.split('-');
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // 0-indexed month
  const day = parseInt(parts[2], 10);

  const baseDate = new Date(year, month, day, 12, 0, 0); // Local noon, browser-agnostic
  const interval = parseInt(task.interval, 10) || 1;

  if (task.unit === 'weeks') {
    baseDate.setDate(baseDate.getDate() + (interval * 7));
  } else if (task.unit === 'years') {
    baseDate.setFullYear(baseDate.getFullYear() + interval);
  } else {
    // months
    baseDate.setMonth(baseDate.getMonth() + interval);
  }
  return baseDate;
}
