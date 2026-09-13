# mohdbilalDH.github.io

Academic website and Digital Humanities research portfolio of Mohd Bilal —
Korean Studies, The Academy of Korean Studies.

Built with [Astro](https://astro.build) as a fully static site. The design system reproduces the
structure, layout, typography, and interaction patterns of the HKUST Digital Humanities
Initiative site (measured, not copied: no reference assets or copy are used) with this site's
own content, data, and images; it is documented in `../DESIGN.md`. Tokens live in
`src/styles/tokens.css`; nothing else declares a colour or a typeface.

## Develop

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # static build in dist/
npm run preview    # serve dist/
```

## Test

End-to-end tests are Python Playwright scripts (from the `webapp-testing` skill) run against
`astro preview`:

```bash
python3 -m venv tests/.venv && tests/.venv/bin/pip install playwright && tests/.venv/bin/playwright install chromium
tests/run.sh                 # build + every script in tests/e2e/
tests/run.sh test_cards.py   # one script
```

Scripts cover navigation and landmarks, the collapsing menu (below 1024px), the home bands, the
project cards (columns at 1440 / 768 / 375, labels, links, fade-up, art), the CV and PDF, the
person dialog, the register (search, empty state, sorting), the timeline (load, error, retry),
responsive overflow and tap targets with full-page screenshots in `tests/screenshots/`, and
console errors on every route.

## Assets

```bash
npm run build && npm run art                        # public/art/*.png card backgrounds from the site's own figures
npm run build && npm run cv:pdf && npm run build    # public/files/mohd-bilal-cv.pdf
npm run og                                          # public/og.png
```

All three use headless Chrome. Card art is rendered from the 1927 長恨 cover and the site's own
SVG figures; run `art` after any change to those figures.

## Data

- `src/data/{core,people,story,timeline,network,sources}.json` — the Buddhist Bridges web-JSON
  tier, copied (never symlinked) from that repository's `outputs/web/`; `public/data/` holds the
  runtime copies the explore page fetches.
- `src/data/hallyu.json` — verified counts from the `hallyu-indian-press` pilot.
- `src/data/janghan.json` — written only by the Janghan `build_site.py --to-website`.
- `src/data/presentations.json` — conference presentations.
- `src/data/{site,projects,publications,cv}.ts` — typed site content (identity and nav, project
  cards with category, year label, art and overlay, articles with status, CV entries).
- `public/janghan/` — the static 長恨 digital edition, generated from the frozen corpus.

Deployment: GitHub Actions builds `master` and publishes to GitHub Pages.
