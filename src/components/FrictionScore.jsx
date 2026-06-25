import { Activity } from 'lucide-react';

export default function FrictionScore({ tasks }) {
  // Calculate the complexity / friction weight of the schedule
  const totalWeight = tasks.reduce((sum, task) => {
    let weeks = 1;
    const interval = parseFloat(task.interval) || 1;
    if (task.unit === 'weeks') {
      weeks = interval;
    } else if (task.unit === 'months') {
      weeks = interval * 4.33;
    } else if (task.unit === 'years') {
      weeks = interval * 52;
    }
    // Frequency weight is inversely proportional to frequency in weeks
    return sum + (1 / Math.max(0.5, weeks));
  }, 0);

  // Convert to a nice integer score out of 100 max (cap it)
  const score = Math.min(100, Math.round(totalWeight * 25));

  let label = 'Ultra Light 🍃';
  let colorClass = 'text-green-500 bg-green-500/10 border-green-500/20';

  if (score >= 35) {
    label = 'High Density 🔴';
    colorClass = 'text-red-500 bg-red-500/10 border-red-500/20';
  } else if (score >= 15) {
    label = 'Balanced 🟡';
    colorClass = 'text-amber-500 bg-amber-500/10 border-amber-500/20';
  } else if (score >= 5) {
    label = 'Low Friction 🟢';
    colorClass = 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
  }

  return (
    <div className="relative group flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-medium backdrop-blur-md transition-all duration-300 shadow-[var(--theme-shadow-sm)] hover:shadow-[var(--theme-shadow-md)] bg-theme-card/65 border-theme-border/60">
      <Activity className="w-3.5 h-3.5 text-theme-accent animate-pulse" />
      <span className="text-theme-text-muted">Schedule Load:</span>
      <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold tracking-wide ${colorClass}`}>
        {score} — {label}
      </span>

      {/* Hover tooltip — opens downward on mobile, upward on md+ to avoid viewport clipping */}
      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 md:top-auto md:bottom-full md:mt-0 md:mb-2 w-56 p-3 rounded-xl border opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-300 z-30 text-[10px] leading-relaxed shadow-lg bg-theme-card border-theme-border text-theme-text-muted">
        <p className="font-semibold text-theme-text mb-1">How Load is calculated:</p>
        <p>Inversely sums task intervals. More frequent tasks (e.g. weekly) create higher load than infrequent ones (e.g. yearly).</p>
        <div className="border-t border-theme-border/40 my-1.5 pt-1.5 flex justify-between font-mono">
          <span>Active Tasks: {tasks.length}</span>
          <span>Index: {totalWeight.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
}
