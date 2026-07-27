# Contributing to NeatClock

## Before you start

Read [SCOPE.md](./SCOPE.md) first. NeatClock is a generator, not a tracker —
PRs that add accounts, task-completion tracking, notifications, or a backend
for the free tool will be declined regardless of code quality. See
[FEATURES.md](./FEATURES.md) for the feature-flag pattern used for optional,
disabled-by-default extras.

## Setup

```bash
npm install
npm run dev
```

## Before opening a PR

```bash
npm run go-live:check   # lint + unit + e2e + build
```

All four must pass. CI runs the same check on every PR.

## Code style

- Keep files under 500 lines
- No new files unless necessary — prefer editing existing ones
- Validate input at system boundaries (localStorage reads, backup import,
  URL query params) — see `src/lib/storage.js` and `src/lib/backup.js` for
  the existing pattern
- Tests live next to the file they cover (`foo.js` → `foo.test.js`)

## Issues

Bug reports and feature requests go through
[GitHub Issues](https://github.com/4ourCEo/NeatClock/issues) — use the
provided templates. Security issues should **not** go through public issues;
see [SECURITY.md](./SECURITY.md).

## Commit messages

Keep them focused on the *why*, not a restatement of the diff. One logical
change per commit.
