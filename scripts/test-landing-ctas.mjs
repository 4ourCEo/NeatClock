#!/usr/bin/env node
/**
 * Test that preset landing pages have both primary (free) and secondary (print) CTAs.
 * Run: node scripts/test-landing-ctas.mjs
 */
import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const failures = [];

function check(file, label, condition, errorMsg) {
  if (!condition) {
    failures.push(`${file}: ${label} - ${errorMsg}`);
    console.error(`FAIL ${file}: ${label}`);
    return false;
  }
  console.log(`OK   ${file}: ${label}`);
  return true;
}

const presetLandings = [
  {
    file: 'public/home-maintenance-calendar.html',
    primaryCTA: 'Build my home calendar',
    printURL: 'gorillamotors.gumroad.com/l/oikeyi',
    bundleURL: 'gorillamotors.gumroad.com/l/qyyoe',
    campaign: 'home_maintenance',
  },
  {
    file: 'public/car-maintenance-schedule-ics.html',
    primaryCTA: 'Build my car schedule',
    printURL: 'gorillamotors.gumroad.com/l/undcqo',
    bundleURL: 'gorillamotors.gumroad.com/l/qyyoe',
    campaign: 'car_maintenance',
  },
  {
    file: 'public/freelancer-quarterly-tax-reminders.html',
    primaryCTA: 'Build my tax calendar',
    printURL: 'gorillamotors.gumroad.com/l/zdwmy',
    bundleURL: 'gorillamotors.gumroad.com/l/qyyoe',
    campaign: 'freelancer_taxes',
  },
  // Home pack long-tail pages
  {
    file: 'public/hvac-filter-reminder-calendar.html',
    primaryCTA: 'Create my reminder',
    printURL: 'gorillamotors.gumroad.com/l/oikeyi',
    bundleURL: 'gorillamotors.gumroad.com/l/qyyoe',
    campaign: 'hvac_filter',
  },
  {
    file: 'public/smoke-detector-reminder-calendar.html',
    primaryCTA: 'Create my reminder',
    printURL: 'gorillamotors.gumroad.com/l/oikeyi',
    bundleURL: 'gorillamotors.gumroad.com/l/qyyoe',
    campaign: 'smoke_detector',
  },
  {
    file: 'public/gutter-cleaning-calendar.html',
    primaryCTA: 'Create my reminder',
    printURL: 'gorillamotors.gumroad.com/l/oikeyi',
    bundleURL: 'gorillamotors.gumroad.com/l/qyyoe',
    campaign: 'gutters',
  },
  {
    file: 'public/water-heater-flush-reminder.html',
    primaryCTA: 'Create my reminder',
    printURL: 'gorillamotors.gumroad.com/l/oikeyi',
    bundleURL: 'gorillamotors.gumroad.com/l/qyyoe',
    campaign: 'water_heater',
  },
  {
    file: 'public/dryer-vent-cleaning-reminder.html',
    primaryCTA: 'Create my reminder',
    printURL: 'gorillamotors.gumroad.com/l/oikeyi',
    bundleURL: 'gorillamotors.gumroad.com/l/qyyoe',
    campaign: 'dryer_vent',
  },
  // Vehicle pack long-tail pages
  {
    file: 'public/oil-change-reminder-calendar.html',
    primaryCTA: 'Create my reminder',
    printURL: 'gorillamotors.gumroad.com/l/undcqo',
    bundleURL: 'gorillamotors.gumroad.com/l/qyyoe',
    campaign: 'oil_change',
  },
  {
    file: 'public/tire-rotation-schedule-ics.html',
    primaryCTA: 'Create my reminder',
    printURL: 'gorillamotors.gumroad.com/l/undcqo',
    bundleURL: 'gorillamotors.gumroad.com/l/qyyoe',
    campaign: 'tire_rotation',
  },
  // Finance pack long-tail pages
  {
    file: 'public/quarterly-estimated-tax-calendar.html',
    primaryCTA: 'Create my reminder',
    printURL: 'gorillamotors.gumroad.com/l/zdwmy',
    bundleURL: 'gorillamotors.gumroad.com/l/qyyoe',
    campaign: 'quarterly_tax',
  },
  {
    file: 'public/subscription-audit-reminder.html',
    primaryCTA: 'Create my reminder',
    printURL: 'gorillamotors.gumroad.com/l/zdwmy',
    bundleURL: 'gorillamotors.gumroad.com/l/qyyoe',
    campaign: 'subscription_audit',
  },
];

for (const landing of presetLandings) {
  const filePath = path.join(ROOT, landing.file);
  if (!fs.existsSync(filePath)) {
    failures.push(`${landing.file}: file not found`);
    console.error(`FAIL ${landing.file}: file not found`);
    continue;
  }

  const html = fs.readFileSync(filePath, 'utf8');

  check(
    landing.file,
    'Primary free CTA present',
    html.includes(landing.primaryCTA),
    `missing "${landing.primaryCTA}"`
  );

  check(
    landing.file,
    'Primary CTA has landing_cta event',
    html.includes("goatcounter.count({path:'landing_cta'") && html.includes(`campaign:${landing.campaign}`),
    'missing landing_cta tracking or campaign prop'
  );

  check(
    landing.file,
    'Secondary print CTA present',
    html.includes(landing.printURL),
    `missing Gumroad print pack link ${landing.printURL}`
  );

  check(
    landing.file,
    'Print CTA has print_cta_click event',
    html.includes("goatcounter.count({path:'print_cta_click'"),
    'missing print_cta_click tracking'
  );

  check(
    landing.file,
    'Print CTA has proper UTMs',
    html.includes('utm_source=landing') &&
      html.includes('utm_medium=seo') &&
      html.includes(`utm_campaign=${landing.campaign}`) &&
      html.includes('utm_content=print_pack'),
    'missing or incorrect UTM parameters on print CTA'
  );

  check(
    landing.file,
    'Bundle link present',
    html.includes(landing.bundleURL) && html.includes('utm_content=bundle'),
    'missing bundle link or bundle UTM'
  );

  check(
    landing.file,
    'Uses Inter font',
    html.includes('Inter:wght@400;500;600;700'),
    'should use Inter font, not Outfit'
  );

  check(
    landing.file,
    'FAQ mentions optional prints',
    html.includes('optional print') || html.includes('Optional print'),
    'FAQ should clarify free export + optional print packs'
  );
}

if (failures.length > 0) {
  console.error(`\ntest-landing-ctas: ${failures.length} failure(s)`);
  failures.forEach((f) => console.error(`  - ${f}`));
  process.exit(1);
}

console.log(`\ntest-landing-ctas: all checks passed (${presetLandings.length} landing pages)`);
