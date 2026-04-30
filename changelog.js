/* ========================================================================
   North×South — CHANGELOG (shipped) + ROADMAP (planned)
   On every deploy, prepend a new entry to CHANGELOG.

   Loaded as a plain <script> in the browser; the const declarations are
   visible as globals to the inline JSX block in index.html. Splitting
   this out keeps the data off Babel's in-browser parse path.
   ======================================================================== */

const CHANGELOG = [
  {
    version: '3.4.0',
    date: '2026-04-30',
    title: 'Verdict disclaimer + editable FX, Tailwind CDN→CLI, externalized CHANGELOG, pinned tests',
    items: [
      'Verdict-adjacent disclaimer: "Estimates only · 2026 brackets (BC, QC, CA, NY currently approximated) · not tax/immigration/financial advice" — surfaced where the user reads the dollar amount, not buried in the footer',
      'FX rate is now an inline-editable button next to the disclaimer ("$1 USD = $0.73 CAD") so users can override the hardcoded default',
      'CHANGELOG and ROADMAP arrays moved out of index.html into changelog.js (loaded as a separate <script>); keeps shipped-history off the in-browser Babel parse path',
      'Tailwind CDN replaced with CLI-built style.css (~22KB minified) — removes the "do not use in production" console warning; src.css holds source utilities + custom CSS, npm run build:css regenerates style.css',
      'tailwind.config.js carries the same custom theme (night/lime/pink/cobalt palette + Fraunces/Geist/Grotesk font stack)',
      '11 new pinned-value tests in calc.test.mjs at $100k/$200k/$400k Ontario, $200k AB/QC, $100k/$200k/$400k TX single, $200k CA single, $300k CA mfj+2 kids, $300k NY mfj — total 39 tests',
      'ROADMAP cleanup: stale v3.1.0 "Next" entry renumbered to v3.5.0 with current item set'
    ]
  },
  {
    version: '3.3.0',
    date: '2026-04-30',
    title: 'Extract calc + tax data into calc.js, add vitest test suite',
    items: [
      'New calc.js — all 2026 tax data and pure calculation functions (applyBrackets, calcCPP, calcEI, calculateCanada, calcStateTax, calculateUS, estimateHealthcareCost, buildBreakeven) live here',
      'index.html dropped from 1755 → 1499 lines; loads calc.js as a plain <script> before the JSX block',
      'CommonJS export shim at the bottom of calc.js so Node tests can require() it without a build step',
      'New calc.test.mjs with 28 vitest tests covering bracket math, CPP/EI ceilings, OHP plateaus, Canada/US take-home invariants (AB > ON, TX > CA, CTC effect), state-tax modes, and breakeven detection',
      'package.json with vitest as the only devDep; npm test runs the suite',
      '.gitignore added for node_modules'
    ]
  },
  {
    version: '3.2.1',
    date: '2026-04-30',
    title: 'Fix lime text-on-cream readability regressions from light-mode flip',
    items: [
      'Hero closing line: lime body text → night with hl-lime highlight on key phrase',
      'Verdict headline dollar amount: text-lime/text-pink → hl-lime/hl-pink bars (matches "five years" pattern)',
      'Wizard kicker (Q1/5) and CAD/USD input labels: text-lime → muted night',
      'Changelog bullet separators: text-lime → muted night'
    ]
  },
  {
    version: '3.2.0',
    date: '2026-04-30',
    title: 'Switch to light mode + Canadian/US flags in header',
    items: [
      'Body background flipped to warm cream (#F5EBD3) with softer gradient mesh and lighter noise overlay',
      'All body text flipped from cream to night (#0E0B2C); meta theme-color and color-scheme updated to light',
      'Added 🇨🇦 and 🇺🇸 flag emojis flanking the North×South wordmark in the header (and footer)',
      'New panel-night and sticker-night variants — used for Departure tax card, 3-yr nest egg stat block, and "⚠ The trouble" sticker so the dark surfaces still pop on light bg',
      'Pill borders, input underlines, btn-ghost, and glass .panel translucency all retuned for light surface',
      'Pill active state flipped to night-on-cream (was lime-on-night) for stronger selection contrast',
      'Chart axis labels, breakeven crosshair, and breakeven pill switched to night fills so they read on light bg',
      'Nav hover swapped to pink (was lime — lime hover was barely visible on cream)',
      'Sticker-outline border updated to night so it shows up on light bg'
    ]
  },
  {
    version: '3.1.2',
    date: '2026-04-30',
    title: 'Fix lime-highlight clipping and overlap in big headlines',
    items: [
      'box-decoration-break: clone on .hl-lime / .hl-pink / .hl-cobalt — highlights split cleanly across line wraps',
      'Highlight gradient stops at 60% (was 55%) so the lime bar takes less vertical room',
      'Loosened tight line-heights: hero 0.92 → 1.02, pivot 0.96 → 1.04, section asides 0.96 → 1.06, verdict 0.96 → 1.05',
      'Added padding-bottom to highlighted h2/h3 elements so descender + highlight bar are not clipped by section overflow:hidden'
    ]
  },
  {
    version: '3.1.1',
    date: '2026-04-30',
    title: 'Fix homepage scrolling to Section 1 again',
    items: [
      'Removed content-visibility: auto from offscreen sections — its placeholder size was causing scroll-anchoring to nudge the page',
      'history.scrollRestoration set to manual so the browser stops restoring stale scroll positions on reload/back-forward',
      'On every fresh load (no #changelog hash), explicitly scroll to (0, 0) before React paints the rest'
    ]
  },
  {
    version: '3.1.0',
    date: '2026-04-30',
    title: 'Web + mobile optimization pass',
    items: [
      'SEO: Open Graph + Twitter card meta, JSON-LD WebApplication schema, canonical URL',
      'Browser chrome: theme-color, color-scheme, apple-mobile-web-app-* meta tags',
      'Inline SVG favicon (lime N×S on night background) — no external request',
      'Mobile: viewport-fit=cover with safe-area-inset padding for iOS notch/home bar',
      'Touch targets: pills bumped to 44px min-height, btn-primary to 48px, font 13px → 14px on pills',
      '-webkit-tap-highlight-color: transparent on interactive elements (no blue flash on tap)',
      'touch-action: manipulation to remove the 300ms double-tap delay',
      'Trimmed Google Fonts: only the weights actually used (Fraunces 700/800, Geist 400/500, Geist Mono 400/500)',
      'Skip-to-content link for keyboard users',
      ':focus-visible rings (lime, 2px, 3px offset) on every interactive element',
      'prefers-reduced-motion: pauses the marquee, disables floating-tag rotation, kills transitions',
      'content-visibility: auto on below-fold sections — faster initial paint',
      'noscript fallback message',
      'Mobile-tightened sticker padding and panel border-radius under 480px'
    ]
  },
  {
    version: '3.0.0',
    date: '2026-04-30',
    title: 'Bold electric redesign — youth-skewing, sticker-heavy aesthetic',
    items: [
      'New palette: deep midnight indigo background with hot lime, pink, cobalt accents',
      'Type system: Fraunces display + Space Grotesk grotesk + Geist body + Geist Mono numbers (dropped Caveat handwriting)',
      'Gradient mesh + noise overlay across the page; chunky drop-shadow stickers and pill buttons',
      'Hero: 3 colored "plan" cards (pink, cobalt, lime) + 3 glass "fail mode" panels with strike-pink emphasis',
      'New marquee strip below header with the seven punchy facts about the move',
      'Section 01: 4 colored cost cards (pink/cobalt/lime/cream) replace the letter-style point list',
      'Section 02: wizard inside a glass panel with animated lime progress bar',
      'Section 03: floating verdict sticker (lime if positive, pink if negative) + 4 colored stat blocks',
      'Chart: lime/pink lines on dark, with cream-pill BREAKEVEN label at the crossover'
    ]
  },
  {
    version: '2.0.1',
    date: '2026-04-30',
    title: 'Fix homepage auto-scrolling to Section 1',
    items: [
      'Header nav links no longer mutate the URL hash',
      'Stale section hashes are stripped on page load',
      'Anchor scroll goes through JS so the URL stays clean'
    ]
  },
  {
    version: '2.0.0',
    date: '2026-04-30',
    title: 'Aged-paper letter-to-a-friend redesign',
    items: [
      'Aged-paper aesthetic with Fraunces + Caveat handwriting + terracotta accent (superseded by v3.0.0)',
      'Hero framing: most Canadians plan a 3–5 year detour, the math decides if it works',
      'The four numbers that flip the plan (healthcare, childcare, TFSA, departure tax)',
      'Condensed 5-question wizard (was 9)',
      'Verdict section with sidebar stats + breakeven chart with hand-drawn arrow'
    ]
  },
  {
    version: '1.3.1',
    date: '2026-04-30',
    title: 'Clean URL on landing — no more default-number pollution',
    items: [
      'Removed URL state syncing — landing page no longer redirects to ?cad=145000&...',
      'Salary inputs start blank instead of pre-filled',
      'Removed the share-link section from footer'
    ]
  },
  {
    version: '1.3.0',
    date: '2026-04-30',
    title: 'Header nav, dedicated Changelog tab, and SEO content section',
    items: [
      'Calculator and Changelog as separate tabs (hash-based routing)',
      'Header CTA "Start ↓" scrolls smoothly to wizard step 1',
      'New SEO content section with sourced stats and FAQ'
    ]
  },
  {
    version: '1.2.0',
    date: '2026-04-30',
    title: 'Wizard becomes the primary input flow',
    items: [
      'Removed the inline calculator panel from the landing page',
      'Step-by-step wizard sits below the hero',
      'Hero answer panel updates live as the user answers each wizard question'
    ]
  },
  {
    version: '1.1.0',
    date: '2026-04-30',
    title: 'Landing-first flow + 5-year breakeven chart',
    items: [
      'Page opens on the landing view — hero, calculator, and results inline',
      'New Breakeven section: 5-year cumulative take-home for staying vs moving',
      'US line starts negative to reflect moving costs and departure tax',
      'Editable moving costs input ($25k default)'
    ]
  },
  {
    version: '1.0.0',
    date: '2026-04-30',
    title: 'Initial release',
    items: [
      '2026 federal tax brackets for Canada (CRA) and US (IRS)',
      '4 provinces, 8 states with full bracket coverage',
      'CPP, EI, FICA, Medicare, Additional Medicare',
      'Healthcare and childcare cost line items',
      '10-year future value projection at 7%'
    ]
  }
];

const ROADMAP = [
  {
    version: '3.5.0', horizon: 'Next', title: 'Verified brackets + small fixes',
    items: [
      'Replace approximated BC, QC, CA, NY brackets with final 2026 published numbers (currently flagged in the verdict disclaimer)',
      'Canada Employment Amount credit (~$200 understatement currently)',
      'AMT comparison check on US side',
      'Live FX rate fetch (user-editable input added in v3.4.0; still hardcoded default of 0.73)',
      'Remaining provinces: MB, SK, NS, NB, NL, PE'
    ]
  },
  {
    version: '4.0.0', horizon: 'Soon', title: 'Equity, housing, multi-state',
    items: [
      'RSU and stock option cross-border treatment',
      'Cost-of-living adjustment by metro — $200k in Austin vs $250k in SF',
      'Itemized deductions, mortgage interest, SALT cap math',
      'Multi-state allocation for partial-year residents',
      'Departure tax estimator with portfolio inputs',
      'TFSA wind-down calculator with PFIC liability projection'
    ]
  },
  {
    version: '5.0.0', horizon: 'Later', title: 'Persona variants + monetization',
    items: [
      'Healthcare worker variant — NCLEX path, malpractice insurance line item',
      'Dual-income couple modeling with TN/TD spouse work restriction',
      'Family-of-four GTA-to-Texas/Florida preset scenario',
      'Downloadable PDF report for accountant or offer negotiation',
      'Cross-border accountant + immigration lawyer referral integration'
    ]
  }
];
