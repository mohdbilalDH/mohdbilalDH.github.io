# mohdbilalDH.github.io

Academic website and Digital Humanities research portfolio of Mohd Bilal —
Korean Studies, The Academy of Korean Studies.

Built with [Astro](https://astro.build) as a fully static site on the "Register" design
system documented in `../DESIGN.md` (paper-white ground, Newsreader + Source Sans 3 +
IBM Plex Mono, one vermilion accent, ruled layout, no cards or shadows). Tokens live in
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
tests/run.sh test_menu.py    # one script
```

Scripts cover navigation and landmarks, the mobile menu, the home page, the CV and PDF, the
person dialog, the register (search, empty state, sorting), the timeline (load, error, retry),
responsive overflow and tap targets at 375 / 768 / 1280 with screenshots in `tests/screenshots/`,
and console errors on every route.

## Assets

```bash
npm run build && npm run cv:pdf && npm run build   # regenerate public/files/mohd-bilal-cv.pdf
npm run og                                          # regenerate public/og.png from the tokens
```

Both use headless Chrome. The first build renders the CV page, `cv:pdf` prints it, and the
second build copies the fresh PDF into `dist/`.

## Data

- `src/data/{core,people,story,timeline,network,sources}.json` — the Buddhist Bridges web-JSON
  tier, copied (never symlinked) from that repository's `outputs/web/`; `public/data/` holds the
  runtime copies the explore page fetches.
- `src/data/hallyu.json` — verified counts from the `hallyu-indian-press` pilot.
- `src/data/janghan.json` — written only by the Janghan `build_site.py --to-website`.
- `src/data/presentations.json` — conference presentations.
- `src/data/{site,projects,publications,cv}.ts` — typed site content (identity, project rows,
  articles with status, CV entries).
- `public/janghan/` — the static 長恨 digital edition, generated from the frozen corpus.

Deployment: GitHub Actions builds `master` and publishes to GitHub Pages.
