# Security Policy

NeatClock is a client-only static app — no backend, no database, no user
accounts. Your schedule data lives only in your browser's `localStorage` and
is never transmitted to any server. See [SCOPE.md](./SCOPE.md).

## Reporting a vulnerability

If you find a security issue (XSS, dependency vulnerability, exposed secret,
CSP bypass, etc.), please report it privately rather than opening a public
GitHub issue:

- Open a [GitHub Security Advisory](https://github.com/4ourCEo/NeatClock/security/advisories/new)
  (preferred — private by default), or
- Use the feedback form at [neatclock.pro](https://neatclock.pro) and mention "security" in your message.

Please include steps to reproduce and the potential impact. We'll acknowledge
reports within a few days.

## Scope

In scope: neatclock.pro, this repository, and the build/deploy pipeline
(GitHub Actions, Vercel config).

Out of scope: third-party services we integrate with (Formspree, Plausible,
Amazon) — report those directly to the respective provider.
