import { Download } from 'lucide-react';
import { BUSINESS_INDUSTRIES } from '../lib/businessCalendar.js';
import { PRESETS } from '../config/presets.js';
import { buildIcsContent } from '../lib/buildIcs.js';
import { downloadText } from '../lib/download.js';

export default function SharedBusinessCalendar({ industry, brand, businessId }) {
  const preset = BUSINESS_INDUSTRIES[industry]?.preset;
  const tasks = preset ? PRESETS[preset] : [];

  const downloadCalendar = () => {
    const content = buildIcsContent(tasks, { businessBrand: brand, businessId });
    if (content) downloadText(content, `${industry}-customer-care.ics`, 'text/calendar;charset=utf-8');
  };

  return (
    <main className="min-h-screen app-canvas px-4 py-10 text-theme-text">
      <section className="mx-auto max-w-3xl rounded-2xl border border-theme-border bg-theme-card p-6 shadow-sm sm:p-10">
        <a href="https://neatclock.pro" className="text-xs text-theme-text-muted hover:text-theme-text">NeatClock</a>
        <header className="mt-5 mb-8 border-b pb-5" style={{ borderColor: `#${brand.brandColor}` }}>
          {brand.brandLogo && <img src={brand.brandLogo} alt={`${brand.brandName} logo`} className="mb-4 max-h-16 max-w-40 object-contain" />}
          <p className="text-xs font-semibold uppercase tracking-wider text-theme-text-muted">Customer care calendar from</p>
          <h1 className="mt-1 text-3xl font-serif font-bold">{brand.brandName}</h1>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-theme-text-muted">
            {brand.brandPhone && <a href={`tel:${brand.brandPhone}`}>{brand.brandPhone}</a>}
            {brand.brandEmail && <a href={`mailto:${brand.brandEmail}`}>{brand.brandEmail}</a>}
            {brand.brandWeb && <a href={brand.brandWeb} target="_blank" rel="noopener noreferrer">Website</a>}
          </div>
        </header>

        <p className="mb-5 text-sm text-theme-text-muted">A ready-to-use {BUSINESS_INDUSTRIES[industry].label.toLowerCase()} reminder schedule. You can add it to your calendar without replacing your saved NeatClock schedule.</p>
        <ul className="mb-8 divide-y divide-theme-border rounded-xl border border-theme-border">
          {tasks.map((task) => (
            <li key={task.id} className="flex items-center justify-between gap-4 px-4 py-3">
              <span className="font-medium">{task.name}</span>
              <span className="shrink-0 text-sm text-theme-text-muted">Every {task.interval} {task.unit}</span>
            </li>
          ))}
        </ul>

        <button type="button" onClick={downloadCalendar} className="inline-flex items-center gap-2 rounded-lg bg-theme-accent px-4 py-3 text-sm font-bold text-white hover:bg-theme-accent-hover">
          <Download className="h-4 w-4" /> Download branded calendar
        </button>
        <p className="mt-4 text-xs leading-relaxed text-theme-text-muted">These are general maintenance reminders. Follow manufacturer instructions and consult a qualified technician for service recommendations.</p>
      </section>
    </main>
  );
}
