const GUIDES = [
  { href: '/guides', label: 'All schedule guides' },
  { href: '/recurring-ics-calendar-generator', label: 'ICS calendar generator' },
  { href: '/home-maintenance-calendar', label: 'Home maintenance calendar' },
  { href: '/hvac-filter-reminder-calendar', label: 'HVAC filter reminders' },
  { href: '/smoke-detector-reminder-calendar', label: 'Smoke detector reminders' },
  { href: '/water-heater-flush-reminder', label: 'Water heater flush reminder' },
  { href: '/gutter-cleaning-calendar', label: 'Gutter cleaning calendar' },
  { href: '/dryer-vent-cleaning-reminder', label: 'Dryer vent cleaning reminder' },
  { href: '/car-maintenance-schedule-ics', label: 'Car maintenance ICS' },
  { href: '/oil-change-reminder-calendar', label: 'Oil change reminders' },
  { href: '/tire-rotation-schedule-ics', label: 'Tire rotation schedule' },
  { href: '/freelancer-quarterly-tax-reminders', label: 'Freelancer tax reminders' },
  { href: '/quarterly-estimated-tax-calendar', label: 'Quarterly estimated tax calendar' },
  { href: '/subscription-audit-reminder', label: 'Subscription audit reminder' },
  { href: '/printable-chore-chart', label: 'Printable chore chart' },
  { href: '/google-calendar-recurring-events', label: 'Google Calendar recurring events' },
  { href: '/recurring-task-reminder-app', label: 'Recurring reminder app' },
];

export default function SeoFooterLinks() {
  return (
    <nav
      aria-label="Free schedule guides"
      className="no-print mx-auto max-w-3xl rounded-2xl border border-border/50 bg-card/40 px-4 py-5 sm:px-6"
    >
      <p className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground mb-3 text-center sm:text-left">
        Free schedule guides
      </p>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs text-muted-foreground">
        {GUIDES.map(({ href, label }) => (
          <li key={href}>
            <a
              href={href}
              className="inline-flex items-center gap-1.5 hover:text-primary hover:underline underline-offset-2 transition-colors"
            >
              <span className="text-primary/50 select-none" aria-hidden="true">
                →
              </span>
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
