function env(name, fallback = '') {
  return import.meta.env[name] || fallback;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Resolves Formspree URL, FormSubmit ajax URL (from email), or legacy waitlist alias. */
export function resolveInterestFormEndpoint() {
  const explicit = (env('VITE_INTEREST_FORM_ENDPOINT') || env('VITE_WAITLIST_URL')).trim();
  if (explicit) return explicit;

  const email = env('VITE_INTEREST_FORM_EMAIL').trim();
  if (email && EMAIL_RE.test(email)) {
    return `https://formsubmit.co/ajax/${encodeURIComponent(email)}`;
  }

  return '';
}

export const interestFormEndpoint = resolveInterestFormEndpoint();

export function isInterestEndpointConfigured() {
  return Boolean(interestFormEndpoint);
}
