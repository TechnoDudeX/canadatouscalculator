# North×South

A cross-border honesty audit for Canadians weighing a US job offer. A joint project by [Mazin Kanuga](https://github.com/TechnoDudeX) and [Copilot Tax](https://copilottax.ca/) — the napkin math meets the actual cross-border CPA.

Models the household — primary salary + spouse work-auth, housing on both sides, cost of living, departure tax, and what the employer is actually putting on the table — not just the salary delta.

Live: https://canadatouscalculator.netlify.app/

## What it does

A single-page calculator that compares a current Canadian compensation package against a hypothetical US offer over a 3–5 year horizon. Surfaces the costs that recruiter pitches usually skip:

- US federal + state income tax
- Healthcare premiums and out-of-pocket exposure
- Childcare costs by state
- **Spouse work-authorization** — TN/H1B/O1 trailing spouses can't legally work, so dual-income households take an immediate income shock
- **Housing** on both sides — own vs. rent, sell vs. keep, monthly carrying cost, US security deposit
- **Cost of living** premium vs. Toronto baseline
- **Canadian departure tax** estimator (unrealized gains × 50% × marginal rate)
- **The offer side** — sign-on bonus and relocation coverage net against exit costs
- 5-year household breakeven projection

## Stack

- Two pages:
  - `index.html` — marketing landing page (dark fintech, Inter + JetBrains Mono, `landing.css`)
  - `wizard.html` — the calculator (cream/night/lime/pink, Fraunces + Space Grotesk + Geist Mono, `style.css`)
- Shared: `calc.js` (tax data + pure functions) + `changelog.js`
- React 18 + Babel standalone (in-browser JSX) on both pages
- Tailwind via CLI (`npm run build:css` regenerates `style.css` from `src.css` + `tailwind.config.js`) — only used by `wizard.html`
- One Netlify Function (`netlify/functions/explain.js`) wrapping Anthropic's API for the optional "Generate explanation" feature
- Deployed on Netlify (root publish, see `netlify.toml`)

## AI explanation feature (optional)

The "Generate explanation" button in the verdict section calls a Netlify Function that wraps the Anthropic API to produce a tight 3-5 sentence plain-English read on the user's specific scenario. The numerical calculator is unaffected — it still runs entirely in the browser. The AI feature is opt-in per click.

**To enable on your Netlify deployment**, set the env var:

```
ANTHROPIC_API_KEY=sk-ant-...
```

Without the env var the function returns a 500 with a clear error message; the calculator itself continues to work. The function defaults to `claude-sonnet-4-6` (~$0.015 per call) — swap `MODEL` in `netlify/functions/explain.js` to `claude-haiku-4-5` (~$0.005 per call) if you want sub-cent calls.

## Local development

Open `index.html` in a browser, or serve the directory with any static server:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Deploy

Netlify auto-deploys from `main`. Config is in `netlify.toml`:

```toml
[build]
  publish = "."
```

## Versioning

Semver tracked via commit messages. See `git log` for the changelog. Current: v4.1.3.

## Tests

```bash
npm install
npm test
```

Vitest covers the pure calc functions in `calc.js` (bracket math, CPP/EI, US/Canada take-home, breakeven).
