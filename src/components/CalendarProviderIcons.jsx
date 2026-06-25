/** Recognizable calendar provider marks — sized for task row action buttons */

export function GoogleCalendarIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.94 5.94 0 0 1-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  );
}

export function OutlookCalendarIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3" y="5" width="12" height="14" rx="1.5" fill="#0078D4" />
      <path fill="#fff" d="M5.5 8h7v1.2h-7V8zm0 2.4h7v1.2h-7v-1.2zm0 2.4h5v1.2h-5v-1.2z" />
      <path fill="#28A8EA" d="M13 7h8v10h-8z" />
      <ellipse cx="17" cy="12" rx="2.8" ry="3.2" fill="#0078D4" />
      <path fill="#fff" d="M16.2 10.8h1.6v.9h-1.6v-.9zm0 1.8h1.6v.9h-1.6v-.9z" />
    </svg>
  );
}

export function AppleCalendarIcon({ className = 'w-4 h-4' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="5" width="16" height="15" rx="2.5" fill="#fff" stroke="#8E8E93" strokeWidth="1.2" />
      <rect x="4" y="5" width="16" height="5" rx="2.5" fill="#FF3B30" />
      <rect x="4" y="8" width="16" height="2" fill="#FF3B30" />
      <circle cx="8" cy="4" r="1" fill="#8E8E93" />
      <circle cx="16" cy="4" r="1" fill="#8E8E93" />
      <text x="12" y="17" textAnchor="middle" fontSize="8" fontWeight="600" fill="#1C1C1E" fontFamily="system-ui,sans-serif">
        17
      </text>
    </svg>
  );
}

export const calendarProviderButtonClass =
  'touch-target inline-flex items-center justify-center w-8 h-8 rounded-lg border border-theme-border bg-theme-card text-theme-text shadow-sm hover:border-theme-accent hover:bg-theme-bg/70 hover:shadow transition-colors';
