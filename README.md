# North×South

A cross-border honesty audit for Canadians weighing a US job offer. Reveals what's actually left after state tax, healthcare, childcare, departure tax, and the TFSA trap.

Live: https://canadatouscalculator.netlify.app/

## What it does

A single-page calculator that compares a current Canadian compensation package against a hypothetical US offer over a 3–5 year horizon. Surfaces the costs that recruiter pitches usually skip:

- US federal + state income tax
- Healthcare premiums and out-of-pocket exposure
- Childcare costs by metro
- Canadian departure tax on unrealized gains
- Loss of TFSA tax shelter for US tax residents
- Moving and relocation overhead
- 5-year breakeven projection

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

Semver tracked via commit messages. See `git log` for the changelog. Current: v3.4.0.

## Tests

```bash
npm install
npm test
```

Vitest covers the pure calc functions in `calc.js` (bracket math, CPP/EI, US/Canada take-home, breakeven).
