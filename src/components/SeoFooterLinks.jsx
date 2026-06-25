const GUIDES = [
  { href: '/recurring-ics-calendar-generator', label: 'ICS calendar generator' },
  { href: '/home-maintenance-calendar', label: 'Home maintenance calendar' },
  { href: '/car-maintenance-schedule-ics', label: 'Car maintenance ICS' },
  { href: '/freelancer-quarterly-tax-reminders', label: 'Freelancer tax reminders' },
];

export default function SeoFooterLinks() {
  return (
    <nav aria-label="Free schedule guides" className="text-center no-print">
      <ul className="flex flex-wrap justify-center items-center gap-x-2 gap-y-1 text-[10px] text-theme-text-muted/50">
        <li className="text-theme-text-muted/30 font-serif italic mr-1 select-none text-[9px]">Sitemap:</li>
        {GUIDES.map(({ href, label }, idx) => (
          <li key={href} className="flex items-center gap-2">
            {idx > 0 && <span className="text-theme-text-muted/20 select-none">·</span>}
            <a
              href={href}
              className="hover:text-theme-accent hover:underline underline-offset-2 transition-colors"
            >
              {label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
