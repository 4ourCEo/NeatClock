#!/usr/bin/env node
/**
 * One-shot SEO automation orchestrator.
 *
 * Steps:
 *  1) refresh sitemap lastmod
 *  2) check local HTML assets
 *  3) live SEO smoke (production)
 *  4) IndexNow submit (all sitemap URLs)
 *  5) Plausible → TRAFFIC-SCOREBOARD (if PLAUSIBLE_API_KEY set)
 *  6) print today's distribution reminder
 *
 * Flags:
 *   --skip-live
 *   --skip-indexnow
 *   --skip-scoreboard
 *   --skip-sitemap
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';

const flags = new Set(process.argv.slice(2));

function run(label, cmd, args, { optional = false } = {}) {
  console.log(`\n==> ${label}`);
  try {
    execFileSync(cmd, args, { stdio: 'inherit' });
    return true;
  } catch (err) {
    if (optional) {
      console.warn(`(optional) ${label} failed: ${err.message}`);
      return false;
    }
    throw err;
  }
}

const weekday = new Date().toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });

if (!flags.has('--skip-sitemap')) {
  run('sitemap:update', 'node', ['scripts/update-sitemap.mjs']);
}

run('check:html-assets', 'node', ['scripts/check-html-assets.mjs']);

if (!flags.has('--skip-live')) {
  run('check:seo-live', 'node', ['scripts/check-seo-live.mjs']);
}

if (!flags.has('--skip-indexnow')) {
  run('indexnow', 'node', ['scripts/submit-indexnow.mjs']);
}

if (!flags.has('--skip-scoreboard')) {
  run('plausible-scoreboard', 'node', ['scripts/plausible-scoreboard.mjs'], { optional: true });
}

console.log('\n==> distribution reminder (UTC weekday:', weekday + ')');
const distPath = 'docs/DISTRIBUTION-WEEKLY.md';
if (fs.existsSync(distPath)) {
  const map = {
    Monday: 'Pinterest → /home-maintenance-calendar (UTM sunday_reset_home)',
    Wednesday: 'Reddit value post → matching intent landing',
    Friday: 'TikTok/Shorts → kit CTA landing',
  };
  console.log(map[weekday] || 'No scheduled channel today — max 3 posts/week. See docs/DISTRIBUTION-WEEKLY.md');
} else {
  console.log('docs/DISTRIBUTION-WEEKLY.md missing');
}

console.log('\nseo:auto complete');
