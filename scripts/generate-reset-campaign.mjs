import fs from 'fs';
import path from 'path';

// Parse command line arguments
const args = process.argv.slice(2);
let presetArg = 'home';
for (let i = 0; i < args.length; i++) {
  if ((args[i] === '--preset' || args[i] === '-p') && args[i + 1]) {
    presetArg = args[i + 1].toLowerCase();
  }
}

// Preset mapping details
const PRESETS_DATA = {
  home: {
    alias: 'home',
    title: "Homeowner's Sentinel",
    hook: "Stop trying to remember when to flush your water heater or vacuum your dryer vents.",
    problem: "HVAC systems, gutters, and smoke detectors have random timelines. Missing them ruins appliances or threatens your home, but standard task apps force you to sign up and pay monthly.",
    solution: "Go to neatclock.pro and select 'Home Sentinel'. It's 100% free, runs entirely offline in your browser, and generates a recurring schedule in one click.",
    monetization: "Highlight the physical checklist option (print layout with hand-written notes section) and the automated .ics export containing direct Amazon product affiliate links for needed HVAC filter sizes.",
    tags: ["#sundayreset", "#homeowners", "#firsttimehomebuyer", "#diyhome", "#neatclock", "#homecare"],
    pinTitle: "Minimalist Home Maintenance Checklist & Schedule Planner",
    pinDesc: "Keep your home running perfectly without a messy spreadsheet. Generate your free recurring homeowner schedule at neatclock.pro. Export to your Google/Apple calendar or print a premium minimalist checklist for your fridge."
  },
  gearhead: {
    alias: 'gearhead',
    title: "Preventive Gearhead",
    hook: "Keep your car running forever without keeping a messy spreadsheet of oil changes and tire rotations.",
    problem: "Skipping fluid checks or tire rotations leads to thousands in repair fees. Keeping track of vehicle logs in notebooks or bloated task managers is a friction-filled chore.",
    solution: "Go to neatclock.pro and select 'Preventive Gearhead'. It populates a full vehicle care schedule instantly. No email signups, no trackers.",
    monetization: "Emphasize how task name details (like oil viscosity grades '5W-30' or wiper sizes) auto-generate direct Amazon shopping affiliate links right inside the calendar descriptions.",
    tags: ["#sundayreset", "#carcare", "#mechanictips", "#carrepair", "#diygarage", "#neatclock"],
    pinTitle: "DIY Car Maintenance Schedule & Garage Checklist",
    pinDesc: "Keep track of vehicle logs, oil changes, and fluid checks easily. Generate a free car maintenance checklist at neatclock.pro. Export recurring events to your phone calendar with auto-links to parts."
  },
  cfo: {
    alias: 'cfo',
    title: "Automated CFO",
    hook: "Don't let quarterly estimated taxes or subscription zombie fees sneak up on you.",
    problem: "IRS tax dates and software trial expirations are the ultimate solopreneur profit killers. Bloated project tools require accounts and spam you with notifications.",
    solution: "Go to neatclock.pro and select 'Automated CFO'. Instantly builds a recurring financial schedule so you never pay a late fee again.",
    monetization: "Promote B2B white-labeled partner builder pages. Service providers can brand these checklists with their logos and contact info as a helpful client closing gift.",
    tags: ["#sundayreset", "#solopreneur", "#freelancelife", "#financialfreedom", "#budgettips", "#neatclock"],
    pinTitle: "Freelancer Tax Checklist & Financial Calendar Generator",
    pinDesc: "Never miss quarterly estimated tax deadlines or get billed for inactive software subscriptions again. Generate your solopreneur financial calendar for free at neatclock.pro."
  }
};

const data = PRESETS_DATA[presetArg] || PRESETS_DATA.home;
const projectDir = path.join('videos', `sunday-reset-${data.alias}`);

// Ensure directories exist
fs.mkdirSync(projectDir, { recursive: true });

// 1. Write hyperframes.json
const hyperframesJson = {
  projectId: `sunday-reset-${data.alias}`,
  title: `Sunday Reset: ${data.title}`,
  format: "1080x1920",
  version: "1.0.0"
};
fs.writeFileSync(
  path.join(projectDir, 'hyperframes.json'),
  JSON.stringify(hyperframesJson, null, 2)
);

// 2. Write SCRIPT.md
const scriptMarkdown = `# SCRIPT — sunday-reset-${data.alias}

**Voice:** Rachel (ElevenLabs)
**Voice settings:** stability 0.35 · similarity 0.75 · style 0.20
**Voice direction:** Calming, satisfying, soft spoken.

---

## Line 1 — Hook (Frame 1)

**Time:** 0.0 – 4.0s
**Delivery:** Satisfying, pacing with lo-fi beat.

    ${data.hook}

## Line 2 — The Problem (Frame 2)

**Time:** 4.0 – 9.0s
**Delivery:** Empathetic, slightly warning.

    ${data.problem}

## Line 3 — The Solution (Frame 3)

**Time:** 9.0 – 14.0s
**Delivery:** Relieved, clear, positive.

    ${data.solution}

## Line 4 — Highlights (Frame 4)

**Time:** 14.0 – 19.0s
**Delivery:** Explanatory, highlight premium features.

    With NeatClock, you can print a premium checklist with blank note lines, or export it. No subscription required.

## Line 5 — CTA (Frame 5)

**Time:** 19.0 – 23.0s
**Delivery:** Direct, call to action.

    Head to neatclock.pro now and start your Sunday reset.
`;
fs.writeFileSync(path.join(projectDir, 'SCRIPT.md'), scriptMarkdown);

// 3. Write STORYBOARD.md
const storyboardMarkdown = `---
format: 1080x1920
message: "Sunday Reset for your ${data.title}"
arc: Hook → Problem → Solution → Value → CTA
audience: Sunday Reset community on TikTok and Pinterest
---

## Frame 1 — Hook

- scene: satisfying close up of checking off a task on a minimalist paper checklist
- duration: 4s
- transition_in: cut
- status: outline
- voiceover: "${data.hook}"
- src: compositions/frames/01-hook.html

A satisfying visual of crossing off a task. Soft lo-fi music starts playing.

## Frame 2 — The Problem

- scene: split screen of calendar alerts piling up next to a messy handwritten notebook
- duration: 5s
- transition_in: crossfade
- status: outline
- voiceover: "${data.problem}"
- src: compositions/frames/02-problem.html

Visual representation of organizational anxiety and paywalled app frustrations.

## Frame 3 — The Solution

- scene: clean, screen capture of neatclock.pro loading the '${data.title}' preset in 1 click
- duration: 5s
- transition_in: wipe
- status: outline
- voiceover: "${data.solution}"
- src: compositions/frames/03-solution.html

Highlights the instant loading, preset selection, and simple offline-first UI.

## Frame 4 — Value & Monetization

- scene: close up of the customized print options and direct links to replacement products (affiliate loop)
- duration: 5s
- transition_in: crossfade
- status: outline
- voiceover: "With NeatClock, you can print a premium checklist with blank note lines, or export it. No subscription required."
- src: compositions/frames/04-value.html

Focuses on the monetization engines: clean checklist customizer options and auto-injected product links.

## Frame 5 — CTA

- scene: clean minimalist graphic with the domain 'neatclock.pro/?preset=${data.alias}' and a mobile sync QR code
- duration: 4s
- transition_in: cut
- status: outline
- voiceover: "Head to neatclock.pro now and start your Sunday reset."
- src: compositions/frames/05-cta.html

Ends on the custom preloaded domain link with a mobile scan QR code.
`;
fs.writeFileSync(path.join(projectDir, 'STORYBOARD.md'), storyboardMarkdown);

// 4. Write METADATA.json
const metadata = {
  campaign: "Sunday Reset Social Campaign",
  preset: data.alias,
  title: data.title,
  monetizationGoals: {
    description: data.monetization,
    primaryFunnels: [
      "Gumroad print pack upsell in export success modal",
      "Amazon Associates affiliate commission via .ics event product search descriptions",
      "B2B partner logo white-labeling subscriptions ($19/mo value proposition)"
    ]
  },
  platforms: {
    tiktok: {
      hookHeadline: data.hook,
      caption: `Sunday Reset: ${data.title} edition. 🧼📅 ${data.hook} ${data.tags.join(' ')}`,
      audioRecommendation: "Ambient Lo-Fi / Soft Chill Beats",
      ctaUrl: `https://neatclock.pro/?preset=${data.alias}`
    },
    pinterest: {
      pinTitle: data.pinTitle,
      pinDescription: `${data.pinDesc} ${data.tags.join(' ')}`,
      destinationLink: `https://neatclock.pro/?preset=${data.alias}`,
      keywords: [
        "sunday reset routine",
        "home organization tips",
        "minimalist checklists",
        "car care checklist",
        "freelancer tax schedule",
        "free schedule planner",
        "printable calendar"
      ]
    }
  }
};
fs.writeFileSync(
  path.join(projectDir, 'METADATA.json'),
  JSON.stringify(metadata, null, 2)
);

console.log(`\n🎉 Sunday Reset Campaign files generated successfully inside: ${projectDir}`);
console.log(`- Created hyperframes.json`);
console.log(`- Created SCRIPT.md`);
console.log(`- Created STORYBOARD.md`);
console.log(`- Created METADATA.json`);
console.log(`Ready for rendering! Run 'npx hyperframes preview --project ${projectDir}' to preview.`);
