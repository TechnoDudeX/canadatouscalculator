# North×South

A cross-border honesty audit for Canadians weighing a US job offer. Models the household — primary salary + spouse work-auth, housing on both sides, cost of living, departure tax, and what the employer is actually putting on the table — not just the salary delta.

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

- `index.html` + `calc.js` (tax data + pure functions) + `changelog.js` + built `style.css`
- React 18 + Babel standalone (in-browser JSX)
- Tailwind via CLI (`npm run build:css` regenerates `style.css` from `src.css` + `tailwind.config.js`)
- Deployed on Netlify (root publish, see `netlify.toml`)

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

Semver tracked via commit messages. See `git log` for the changelog. Current: v4.0.0.

## Tests

```bash
npm install
npm test
```

Vitest covers the pure calc functions in `calc.js` (bracket math, CPP/EI, US/Canada take-home, breakeven).
