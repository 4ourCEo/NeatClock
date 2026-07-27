#!/usr/bin/env node
/**
 * Fails CI if any local asset referenced in a public/*.html or root index.html
 * <meta>/<link>/<img> tag doesn't actually exist — catches broken OG images,
 * favicons, etc. that are otherwise invisible until someone checks manually.
 */
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const htmlFiles = [
  'index.html',
  ...fs.readdirSync(path.join(ROOT, 'public')).filter((f) => f.endsWith('.html')),
].map((f) => (f === 'index.html' ? f : path.join('public', f)));

const ATTR_RE = /(?:src|href|content)="(\/[^"?#]+)/g;

let missing = [];

for (const file of htmlFiles) {
  const html = fs.readFileSync(path.join(ROOT, file), 'utf8');
  let match;
  while ((match = ATTR_RE.exec(html))) {
    const assetPath = match[1];
    // Skip non-file routes (SPA/app paths) and /src/* (resolved by Vite, not a public/ file)
    if (!path.extname(assetPath) || assetPath.startsWith('/src/')) continue;
    const fullPath = path.join(ROOT, 'public', assetPath);
    if (!fs.existsSync(fullPath)) {
      missing.push(`${file}: ${assetPath}`);
    }
  }
}

if (missing.length > 0) {
  console.error('Missing assets referenced in HTML:');
  for (const m of missing) console.error(`  ${m}`);
  process.exit(1);
}

console.log(`check-html-assets: all referenced assets exist (${htmlFiles.length} files checked)`);
