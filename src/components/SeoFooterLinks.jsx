const GUIDES = [
  { href: '/recurring-ics-calendar-generator', label: 'ICS calendar generator' },
  { href: '/home-maintenance-calendar', label: 'Home maintenance calendar' },
  { href: '/car-maintenance-schedule-ics', label: 'Car maintenance ICS' },
  { href: '/freelancer-quarterly-tax-reminders', label: 'Freelancer tax reminders' },
];

export default function SeoFooterLinks() {
  return (
    <nav aria-label="Free schedule guides" className="text-center">
      <p className="text-[10px] uppercase tracking-widest font-semibold text-theme-text-muted mb-2">
        Free schedule guides
      </p>
      <ul className="flex flex-wrap justify-center gap-x-3 gap-y-1 text-xs text-theme-text-muted">
        {GUIDES.map(({ href, label }) => (
          <li key={href}>
            <a
              href={href}
              className="hover:text-theme-accent underline-offset-2 hover:underline transition-colors"
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
