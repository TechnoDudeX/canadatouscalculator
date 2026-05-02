/* ========================================================================
   North×South — CHANGELOG (shipped) + ROADMAP (planned)
   On every deploy, prepend a new entry to CHANGELOG.

   Loaded as a plain <script> in the browser; the const declarations are
   visible as globals to the inline JSX block in index.html. Splitting
   this out keeps the data off Babel's in-browser parse path.
   ======================================================================== */

const CHANGELOG = [
  {
    version: '4.5.0',
    date: '2026-05-01',
    title: 'Landing page tightening, marginal verdict tier, province/state caveats, chart label, OG image',
    items: [
      'Removed 3-step "plan" cards (STEP 01/02/03) from hero — reduces clutter before the thesis',
      'Removed marquee ticker — facts were duplicated from the FailMode cards below it',
      'Removed "Reality check" footer cards from verdict — generic content at the wrong moment',
      'Added 4th verdict tier: "Marginal — push back." for 5yr deltas of $0–$150k (cobalt), reducing false confidence in borderline cases',
      'WizardPreview now labels itself "partial" on steps 1–2 before family/housing inputs are entered',
      'Province caveats (ON/QC/BC/AB) appear inline after province selection in Step 1',
      'State caveats (CA/NY/WA/TX/FL/MA/IL/CO) appear inline after state selection in Step 1',
      'Breakeven chart now shows a rotated Y-axis title: "CUMULATIVE TAKE-HOME (CAD)"',
      'Added og.svg (1200×630) and og:image meta tags for link preview cards',
    ]
  },
  {
    version: '4.4.1',
    date: '2026-05-01',
    title: 'Fix blank-state breakeven showing 0.8 years',
    items: [
      'Breakeven StatBlock and chart marker now gate on hasInput — blank state correctly shows "—" instead of a spurious "Year 0.8" computed from all-zero inputs'
    ]
  },
  {
    version: '4.4.0',
    date: '2026-04-30',
    title: 'Canada Employment Amount credit, live FX rate, roadmap pruning',
    items: [
      'Canada Employment Amount non-refundable federal credit now applied (~$200 increase in Canadian take-home for any employment income above $1,433)',
      'FX rate auto-fetches live from frankfurter.app on page load — defaults to the live CAD/USD rate instead of the hardcoded 0.73; manual override still works',
      'Roadmap pruned: removed "Replace BC/QC brackets" (shipped in v4.0.0) and "Employment Amount credit" + "Live FX rate" (both shipped in this release); tier 1 now focuses on remaining provinces and spouse offer input'
    ]
  },
  {
    version: '4.3.0',
    date: '2026-04-30',
    title: 'Metro housing, live wizard preview, graph hover tooltips, dead code removal',
    items: [
      'Metro selector in wizard step 4 — pick your city/metro for tighter housing and COL defaults (e.g. Bay Area $5,500/mo vs Sacramento $2,200/mo within the same CA state)',
      'Live estimate panel below the wizard — shows CA vs US household take-home and net annual delta in real-time once both salaries are entered; updates on every keystroke and step change',
      'Breakeven chart now has hover tooltips — hover any year column to see exact CA and US values plus the running delta in a floating label',
      'Chart end-of-line labels updated to show dollar amounts; chart height bumped to give annotations more breathing room',
      'Roadmap version numbers now auto-compute from the latest CHANGELOG entry — they can never go stale again (tier 1 = current minor+1, tier 2 = minor+2, tier 3 = major+1)',
      'Disclaimer cleaned up — removed "BC, QC, CA, NY currently approximated" caveat (full brackets shipped in v4.0.0)',
      'Removed dead buildBreakeven function — superseded by buildHouseholdBreakeven since v4.0.0; tests updated accordingly'
    ]
  },
  {
    version: '4.2.2',
    date: '2026-04-30',
    title: 'Remove "The trouble" sticker + subtext; add spacing around marquee',
    items: [
      'Removed "⚠ The trouble" sticker and "with the plan, that is" subtext from hero section',
      'Added top/bottom margin around the marquee banner so it breathes between the step cards and the body copy'
    ]
  },
  {
    version: '4.2.1',
    date: '2026-04-30',
    title: 'Premise section removed, marquee relocated, header + hero copy updated for AI',
    items: [
      'Removed "Premise" sticker and subtext from hero section',
      'Marquee banner moved from between header and hero to between the Step 01/02/03 plan cards and the trouble section',
      'Header tagline updated to "AI-powered cross-border calculator"',
      'Hero body copy updated: "Five questions. Your real numbers. Claude reads the verdict and tells you what\'s actually moving the needle."',
      'CTA button text updated to "Run the numbers ↓" with subtext "5 questions · AI reads your inputs · 3 minutes"'
    ]
  },
  {
    version: '4.2.0',
    date: '2026-04-30',
    title: 'AI auto-fires on wizard completion + chart annotation + UI cleanup',
    items: [
      'AI explanation auto-triggers when user clicks "See the verdict →" on step 5 — no manual button click needed',
      'Netlify function now returns a chartLine field — a single Claude-generated sentence about the chart trajectory, shown below the breakeven chart',
      'Chart legend updated with 🇨🇦 and 🇺🇸 flag emojis on the Stay in Canada / Move to US lines',
      'Removed "Section 01/02/03" sticker labels and descriptive subtext paragraphs from all three sections — headings carry the context',
      'Marquee banner items updated with flag emojis and sharper copy'
    ]
  },
  {
    version: '4.1.5',
    date: '2026-04-30',
    title: 'Replace partial-gradient highlights with solid full-word highlights',
    items: [
      'hl-lime, hl-pink, hl-cobalt now use a solid background color covering the entire word instead of a bottom-40% gradient strip',
      'Fixes text visibility in all contexts — no more cream-on-cream or dark-on-dark in the transparent portion of the gradient'
    ]
  },
  {
    version: '4.1.4',
    date: '2026-04-30',
    title: 'Fix hl-cobalt highlight making "questions" text invisible on light background',
    items: [
      'hl-cobalt was forcing color: #FFF6E5 (cream) — on the cream/light wizard section background, text in the transparent 60% of the gradient was invisible',
      'Changed hl-cobalt to color: inherit so it picks up the parent text-night color, readable on both the transparent and cobalt-blue areas'
    ]
  },
  {
    version: '4.1.3',
    date: '2026-04-30',
    title: 'Move full disclaimer (estimates, FX rate, AI privacy note) from verdict to footer',
    items: [
      'Verdict section now leads straight from "Section 03 / based on your inputs..." into the headline — no more dense disclaimer paragraph above the dollar figure',
      'Full disclaimer relocated to a dedicated row in the footer between the 3-column grid and the copyright bar — same content, including the inline-editable FxRateEdit',
      '"AI explanation below" copy updated to "AI explanation in the verdict section" since the disclaimer is no longer above it',
      'Footer now takes state + update props so FxRateEdit can read/write the FX rate from the footer location'
    ]
  },
  {
    version: '4.1.2',
    date: '2026-04-30',
    title: 'AI explanation tightened — 3-5 sentences, not 3-4 paragraphs',
    items: [
      'System prompt rewritten to enforce a hard 5-sentence cap (3-4 typical). Each sentence has a job: verdict + magnitude / biggest line item / sanity-check / optional negotiation lever',
      'max_tokens dropped 800 → 300 to match — narrative responses now run ~2-4 seconds and use ~1/3 the output tokens',
      'ExplainPanel description updated to match the new shape ("3-5 sentence read" instead of "3-4 paragraph narrative")'
    ]
  },
  {
    version: '4.1.1',
    date: '2026-04-30',
    title: 'Switch AI default to Sonnet 4.6',
    items: [
      'netlify/functions/explain.js: MODEL changed from claude-haiku-4-5 to claude-sonnet-4-6 — better narrative quality at ~$0.015/call vs $0.005',
      'README updated: Sonnet is the documented default; Haiku noted as the cheaper swap',
      'Opus is intentionally not used in this project'
    ]
  },
  {
    version: '4.1.0',
    date: '2026-04-30',
    title: 'AI explanation — Claude turns the verdict into a plain-English narrative',
    items: [
      'New "Generate explanation" button in the verdict section. Click it and a 3-4 paragraph narrative comes back: one-line verdict, biggest line item driving it, 2-3 quieter items to sanity-check, one specific negotiation lever tied to your numbers',
      'First backend code in the repo: netlify/functions/explain.js wraps the Anthropic API. Defaults to claude-haiku-4-5 (~$0.005 per call); swap MODEL to claude-sonnet-4-6 (~3×) or claude-opus-4-7 (~5×) for richer output',
      'System prompt explains the household model to Claude — visa/spouse work-auth, housing both sides, COL, departure tax, employer credits — so the narrative reflects the actual calculator instead of generic cross-border boilerplate',
      'Prompt caching declared on the system prompt with cache_control: ephemeral — silently kicks in once the prompt grows past Haiku 4.5\'s 4096-token cache minimum',
      'Typed-error handling: Anthropic.RateLimitError → 429, AuthenticationError → 500 (mis-config), APIError → 502, all surface a user-readable message in the panel',
      'Client-side throttle: 30s between regenerations, button shows the countdown',
      'Verdict disclaimer updated: explicitly flags that clicking "Generate explanation" sends inputs to Anthropic\'s API. The numerical calculator continues to run entirely in the browser — this is the only feature that doesn\'t',
      'netlify.toml updated: functions directory wired up, npm run build:css runs as build command, esbuild bundler for the function',
      'Requires ANTHROPIC_API_KEY env var on Netlify; without it the function returns a 500 and the panel surfaces a clear "missing env var" message — the rest of the site works unchanged'
    ]
  },
  {
    version: '4.0.1',
    date: '2026-04-30',
    title: 'Partner branding — North×South is now a joint project with Copilot Tax',
    items: [
      'Footer rebuilt around a prominent CTA panel: "Need help with your actual taxes? Visit Copilot Tax →" linking to https://copilottax.ca/',
      'Byline updated to credit the partnership: "A joint project by Mazin Kanuga and Copilot Tax — the napkin math meets the actual cross-border CPA"',
      'Old "About" footer column replaced with a "Partner" column linking to Copilot Tax',
      'Footer copyright line updated: "© 2026 · North×South · Mazin Kanuga × Copilot Tax"',
      'Added "Spouse work-auth · housing · COL" line under "The math" footer column to reflect the v4.0.0 household model'
    ]
  },
  {
    version: '4.0.0',
    date: '2026-04-30',
    title: 'Household model — spouse work-auth, housing, COL, departure tax, offer credits',
    items: [
      'Spouse work-authorization is now first-class. Visa pills (TN/L1/H1B/O1/GC) drive whether the trailing spouse can legally work in the US — TD, H4, O3 default to "cannot work" and zero out spouse contribution to US household income. L2 and GC spouses default to working. User can override per-scenario.',
      'Spouse income is its own input — running calculateCanada({spouseIncomeCAD, province}) gives an honest "income shock" line item: how much CAD take-home evaporates if the trailing spouse cannot work.',
      'Canadian housing modeled both ways. Rent: monthly carrying cost. Own: choose to sell (5.5% realtor + legal goes to one-time exit cost) or keep paying it (mortgage proxy + maintenance becomes ongoing carry). Province-keyed default rents.',
      'US monthly housing input with state-keyed defaults (CA 4200, NY 3800, WA 3000, TX 2100, FL 2600, MA 3400, IL 2400, CO 2700). 2 months in as security deposit (one-time exit cost).',
      'Cost-of-living multiplier vs. Toronto baseline (state-keyed default 1.05–1.35×). Models groceries/transport/dining — housing/healthcare/childcare are explicit.',
      'Departure tax estimator. Unrealized capital gains × 50% inclusion × user\'s combined fed+prov marginal rate (Ontario surtax tier-2 included). RRSP/TFSA exemptions noted in copy.',
      'Offer-side credits — sign-on bonus + relocation coverage (USD) net against gross exit costs. If credits exceed costs, net is floored at 0 (no negative exit cost).',
      'Wizard refactored from 5 single-field steps to 5 multi-field steps: (1) salaries + locations, (2) family + spouse + visa, (3) Canadian housing, (4) US housing + COL, (5) the exit + the offer.',
      'Verdict gains a HOUSEHOLD AUDIT panel: 6 line items showing where the household money actually goes — spouse shock, housing delta, COL premium, healthcare, childcare delta, departure tax. Each shows a one-line explanation of the math.',
      '"Net exit cost" StatBlock is now auto-computed from the model (moving + realtor + departure tax + security deposit, minus employer credits) instead of a single editable field.',
      'Disclaimer updated to flag the new approximations: spouse-parity assumption when work-auth allows, single-state COL multiplier (not metro-specific).',
      'New calc.js exports: VISA_SPOUSE_WORK, CA_RENT_DEFAULT_MONTHLY_CAD, US_HOUSING_DEFAULT_MONTHLY_USD, US_COL_MULTIPLIER_DEFAULT, spouseCanWorkInUS, getMarginalRateCanada, caHousingMonthlyCAD, estimateColExtraAnnualCAD, estimateExitCostsCAD, buildHouseholdBreakeven.',
      '22 new tests added (61 total): visa lookup, marginal-rate combinator, housing math under each rent/own/sell/keep branch, COL multiplier edge cases, exit costs with offer credits, household breakeven with one-time net costs.'
    ]
  },
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

/* ROADMAP — version numbers are intentionally omitted here.
   ChangelogView computes them dynamically from CHANGELOG[0].version so they
   auto-advance with every release and can never go stale.
   tier 1 → current minor+1 (Next), tier 2 → minor+2 (Soon), tier 3 → major+1 (Later). */
const ROADMAP = [
  {
    tier: 1, horizon: 'Next',
    title: 'More provinces + spouse offer input',
    items: [
      'Remaining provinces: MB, SK, NS, NB, NL, PE',
      'Separate spouse USD salary input — currently assumes parity with CA take-home when work-auth allows; many couples have a real different US offer',
      'TFSA wind-down PFIC liability projection (noted in copy, not yet modeled as a dollar line item)'
    ]
  },
  {
    tier: 2, horizon: 'Soon',
    title: 'Equity, itemized deductions, multi-state',
    items: [
      'RSU and stock option cross-border treatment — vesting in both countries triggers separate tax events',
      'Itemized deductions: mortgage interest, SALT cap ($10k), charitable giving — matters for high earners in high-tax states',
      'Multi-state partial-year allocation for people who move mid-year',
      'AMT comparison on the US side for incomes above $130k',
      'Downloadable PDF summary for accountant or offer negotiation'
    ]
  },
  {
    tier: 3, horizon: 'Later',
    title: 'Persona variants + preset scenarios',
    items: [
      'Healthcare worker variant — NCLEX path, malpractice insurance, hospital signing bonuses',
      'Preset scenario cards: GTA-to-Austin family of four, BC-to-Seattle couple, QC-to-NYC single',
      'Cross-border accountant + immigration lawyer referral integration (booking flow, not just a link)',
      'Mobile app (native iOS/Android) with push alerts for FX rate moves'
    ]
  }
];
