#!/usr/bin/env node
/**
 * Scaffold a new SEO landing page and wire sitemap / vercel / footer / llms.
 *
 * Usage:
 *   npm run seo:landing -- \
 *     --slug oil-change-reminder-calendar \
 *     --title "Oil Change Reminder Calendar" \
 *     --preset gearhead \
 *     --campaign oil_change \
 *     --lead "Recurring oil-change reminders as a calendar file." \
 *     --label "Oil change reminders"
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

function arg(name, fallback = '') {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const slug = arg('slug').replace(/^\/+|\/+$/g, '').replace(/\.html$/, '');
const title = arg('title');
const presetRaw = arg('preset', 'home'); // home | gearhead | cfo | ''
const presetAliases = { car: 'gearhead', freelance: 'cfo', freelancer: 'cfo' };
const preset = presetAliases[presetRaw] || presetRaw;
const campaign = arg('campaign', slug.replace(/-/g, '_').slice(0, 40));
const lead = arg('lead', `${title} — export a free .ics file in under a minute.`);
const label = arg('label', title);
const description = arg(
  'description',
  `${title}. Export recurring .ics reminders for Google, Apple, or Outlook — no sign-up.`,
);

if (!slug || !title) {
  console.error('Required: --slug <path-slug> --title "Page Title"');
  process.exit(1);
}

const urlPath = `/${slug}`;
const htmlFile = path.join('public', `${slug}.html`);
const ogFile = path.join('public', `og-${slug}.png`);
const ogSource = fs.existsSync('public/og-home-maintenance-calendar.png')
  ? 'public/og-home-maintenance-calendar.png'
  : 'public/og-image.png';

if (fs.existsSync(htmlFile)) {
  console.error(`Already exists: ${htmlFile}`);
  process.exit(1);
}

const ctaHref = preset
  ? `/?preset=${preset}&amp;utm_source=landing&amp;utm_medium=seo&amp;utm_campaign=${campaign}`
  : `/?utm_source=landing&amp;utm_medium=seo&amp;utm_campaign=${campaign}`;

const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title} — Free ICS | NeatClock</title>
    <meta name="description" content="${description.replace(/"/g, '&quot;')}" />
    <link rel="canonical" href="https://neatclock.pro${urlPath}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://neatclock.pro${urlPath}" />
    <meta property="og:title" content="${title} — Free ICS | NeatClock" />
    <meta property="og:description" content="${description.replace(/"/g, '&quot;')}" />
    <meta property="og:image" content="https://neatclock.pro/og-${slug}.png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="NeatClock — free recurring calendar export" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title} — NeatClock" />
    <meta name="twitter:description" content="${description.replace(/"/g, '&quot;')}" />
    <meta name="twitter:image" content="https://neatclock.pro/og-${slug}.png" />
    <meta name="twitter:image:alt" content="NeatClock — free recurring calendar export" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet" />
    <link rel="stylesheet" href="/page-base.css" />
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Is ${title.replace(/"/g, '\\"')} free?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. Core presets and .ics export are free. No account — your schedule stays on your device."
          }
        },
        {
          "@type": "Question",
          "name": "Can I import this into Google Calendar?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. Export a .ics file from NeatClock and import it into Google Calendar, Apple Calendar, or Outlook."
          }
        },
        {
          "@type": "Question",
          "name": "Do I need an account?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "No. NeatClock runs in your browser with no sign-up."
          }
        }
      ]
    }
    </script>
    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "NeatClock", "item": "https://neatclock.pro/" },
        { "@type": "ListItem", "position": 2, "name": "${title.replace(/"/g, '\\"')}", "item": "https://neatclock.pro${urlPath}" }
      ]
    }
    </script>
    <style>
      ul { color: var(--muted); }
      .cta { display: inline-block; margin-top: 1.5rem; padding: 0.85rem 1.75rem; background: var(--accent); color: #fff; font-weight: 600; text-decoration: none; border-radius: 9999px; transition: background .15s; }
      .cta:hover { background: var(--accent-hover); }
      .related { text-align: center; margin: 2rem 0 0; padding-top: 1.5rem; border-top: 1px solid rgba(28,28,28,.08); }
      .related p { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.12em; font-weight: 600; color: var(--muted); margin-bottom: 0.75rem; }
      .related a { color: var(--accent); text-decoration: none; font-size: 0.875rem; margin: 0 0.35rem; }
      .related a:hover { text-decoration: underline; }
    </style>
    <!-- Privacy-friendly analytics by Plausible -->
    <script async src="https://plausible.io/js/pa-7V3YfWxV7OYX_X9davuMm.js"></script>
    <script>
      window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};
      plausible.init()
    </script>
  </head>
  <body>
    <div class="wrap">
      <header>
        <img class="logo" src="/logo.png" width="2003" height="299" alt="NeatClock" />
        <h1>${title}</h1>
        <p class="lead">${lead.replace(/</g, '&lt;')}</p>
      </header>

      <div class="card">
        <h2>What you get</h2>
        <ul>
          <li>Recurring reminders tuned for this schedule</li>
          <li>Editable tasks before you export</li>
          <li>Standard .ics for Google, Apple, or Outlook</li>
          <li>No account — data stays on your device</li>
        </ul>
        <a class="cta" href="${ctaHref}" onclick="window.plausible&&window.plausible('landing_cta',{props:{campaign:'${campaign}'}})">Open NeatClock →</a>
      </div>

      <div class="card">
        <h2>How it works</h2>
        <p style="color:var(--muted)">Pick a preset, tweak intervals, download your .ics, and import it into any calendar app. NeatClock is a generator — not another task tracker with a signup wall.</p>
      </div>

      <div class="card faq">
        <h2>FAQ</h2>
        <details>
          <summary>Is ${title.replace(/</g, '&lt;')} free?</summary>
          <p>Yes. Core presets and .ics export are free. No account — your schedule stays on your device.</p>
        </details>
        <details>
          <summary>Can I import this into Google Calendar?</summary>
          <p>Yes. Export a .ics file from NeatClock and import it into Google Calendar, Apple Calendar, or Outlook.</p>
        </details>
        <details>
          <summary>Do I need an account?</summary>
          <p>No. NeatClock runs in your browser with no sign-up.</p>
        </details>
      </div>

      <nav class="related" aria-label="Related schedule guides">
        <p>Other free calendars</p>
        <a href="/guides">All guides</a> ·
        <a href="/recurring-ics-calendar-generator">ICS generator</a> ·
        <a href="/home-maintenance-calendar">Home maintenance</a> ·
        <a href="/car-maintenance-schedule-ics">Car maintenance</a> ·
        <a href="/printable-chore-chart">Printable checklist</a>
      </nav>

      <footer>
        <a href="/">NeatClock</a> — minimalist recurring calendar generator
      </footer>
    </div>
  </body>
</html>
`;

fs.writeFileSync(htmlFile, html);
fs.copyFileSync(ogSource, ogFile);
console.log(`wrote ${htmlFile}`);
console.log(`wrote ${ogFile} (copied from ${ogSource} — replace with a unique OG when ready)`);

// vercel.json
const vercelPath = 'vercel.json';
const vercel = JSON.parse(fs.readFileSync(vercelPath, 'utf8'));
const redirectRule = {
  source: `/${slug}.html`,
  destination: urlPath,
  permanent: true,
};
const rewriteRule = {
  source: urlPath,
  destination: `/${slug}.html`,
};
if (!vercel.redirects.some((r) => r.source === redirectRule.source)) {
  const partnerIdx = vercel.redirects.findIndex((r) => r.source === '/partner.html');
  vercel.redirects.splice(partnerIdx >= 0 ? partnerIdx : vercel.redirects.length, 0, redirectRule);
}
if (!vercel.rewrites.some((r) => r.source === rewriteRule.source)) {
  const catchAll = vercel.rewrites.findIndex((r) => r.source === '/(.*)');
  vercel.rewrites.splice(catchAll >= 0 ? catchAll : vercel.rewrites.length, 0, rewriteRule);
}
fs.writeFileSync(vercelPath, `${JSON.stringify(vercel, null, 2)}\n`);
console.log('updated vercel.json');

// sitemap — insert before llms.txt block
const sitemapPath = path.join('public', 'sitemap.xml');
let sitemap = fs.readFileSync(sitemapPath, 'utf8');
if (!sitemap.includes(`https://neatclock.pro${urlPath}`)) {
  const today = new Date().toISOString().slice(0, 10);
  const block = `  <url>
    <loc>https://neatclock.pro${urlPath}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.85</priority>
  </url>
`;
  sitemap = sitemap.replace(
    '  <url>\n    <loc>https://neatclock.pro/llms.txt</loc>',
    `${block}  <url>\n    <loc>https://neatclock.pro/llms.txt</loc>`,
  );
  fs.writeFileSync(sitemapPath, sitemap);
  console.log('updated public/sitemap.xml');
}

// update-sitemap source map
const updatePath = path.join('scripts', 'update-sitemap.mjs');
let updateSrc = fs.readFileSync(updatePath, 'utf8');
const mapLine = `  '${urlPath}': 'public/${slug}.html',`;
if (!updateSrc.includes(`'${urlPath}'`)) {
  updateSrc = updateSrc.replace(
    "  '/partner': 'public/partner.html',",
    `${mapLine}\n  '/partner': 'public/partner.html',`,
  );
  fs.writeFileSync(updatePath, updateSrc);
  console.log('updated scripts/update-sitemap.mjs');
}

// SeoFooterLinks
const footerPath = path.join('src', 'components', 'SeoFooterLinks.jsx');
let footer = fs.readFileSync(footerPath, 'utf8');
const guideLine = `  { href: '${urlPath}', label: '${label.replace(/'/g, "\\'")}' },`;
if (!footer.includes(`href: '${urlPath}'`)) {
  const inserted = footer.replace(
    /(\n];\n\nexport default function SeoFooterLinks)/,
    `\n${guideLine}$1`,
  );
  if (inserted === footer) {
    console.warn('Could not auto-wire SeoFooterLinks.jsx — add manually:', guideLine.trim());
  } else {
    fs.writeFileSync(footerPath, inserted);
    console.log('updated SeoFooterLinks.jsx');
  }
}

// llms.txt
const llmsPath = path.join('public', 'llms.txt');
let llms = fs.readFileSync(llmsPath, 'utf8');
const llmsLine = `- ${title}: https://neatclock.pro${urlPath}`;
if (!llms.includes(urlPath)) {
  llms = llms.replace(
    '- Partner / co-brand builder: https://neatclock.pro/partner',
    `${llmsLine}\n- Partner / co-brand builder: https://neatclock.pro/partner`,
  );
  fs.writeFileSync(llmsPath, llms);
  console.log('updated llms.txt');
}

const llmsFullPath = path.join('public', 'llms-full.txt');
let llmsFull = fs.readFileSync(llmsFullPath, 'utf8');
if (!llmsFull.includes(urlPath)) {
  llmsFull = llmsFull.replace(
    '| Partner / co-brand page | https://neatclock.pro/partner |',
    `| ${title} landing | https://neatclock.pro${urlPath} |\n| Partner / co-brand page | https://neatclock.pro/partner |`,
  );
  fs.writeFileSync(llmsFullPath, llmsFull);
  console.log('updated llms-full.txt');
}

try {
  execFileSync('node', ['scripts/sync-llms-catalog.mjs'], { stdio: 'inherit' });
} catch {
  process.exitCode = 1;
}

try {
  execFileSync('node', ['scripts/check-html-assets.mjs'], { stdio: 'inherit' });
} catch {
  process.exitCode = 1;
}

console.log(`\nNext: edit FAQ copy in ${htmlFile}, then commit + push (IndexNow workflow runs on main).`);
