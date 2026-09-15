# mohdbilalDH.github.io

Academic website and Digital Humanities research portfolio of Mohd Bilal —
Korean Studies, The Academy of Korean Studies.

Built with [Astro](https://astro.build) as a fully static site. Tokens live in
`src/styles/tokens.css`; nothing else declares a colour or a typeface. The design system and every
structural decision are documented in `../DESIGN.md`, which is binding.

## The project contract

Every project resolves to exactly three routes, in the same order, with the same slots. A new
project is one entry in `src/data/projects.ts` plus three files.

| Route | Job | Budget |
|---|---|---|
| `/projects/<slug>/` | The argument. Five slots: Claim · Evidence · Explore · Limits · Cite. | 700–1,000 words of prose, at most 4 figures |
| `/projects/<slug>/explore/` | The evidence layer: an edition, an instrument or a register. | one instrument |
| `/projects/<slug>/data/` | Method, coding, versions, limits, licence, downloads, citation. | no limit |
| `/projects/<slug>/<entity>/<id>/` | One citable page per entity, generated, never hand-written. | as many as the data has |

Each project declares a **kind** (`edition` · `argument` · `investigation`) and a **state**
(`in-progress` · `frozen` · `released`). Nothing goes on the site until it has a question written
as a question, a versioned dataset, one figure whose takeaway title is a sentence with a verb, and
one stated limit.

Site navigation is four items: Projects · Method · Writing · About. `/method/` states the shared
uncertainty grammar, the reproducibility discipline and the romanisation policy, and every project
page points at it.

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

Scripts cover: the four-item navigation, landmarks and the redirect stubs for retired routes; the
collapsing menu below 1024px; the home page as a router (thesis, featured project, word budget);
the projects index as a list; the project contract on all three projects and their data pages; the
method page and its grammar; the 43 person pages, their citations and the links into them; the
edition's five-item nav, inherited typefaces, per-record citations and sitemap; the register
(search, empty state, sorting, navigation); the timeline (load, error, retry); the CV and its PDF;
responsive overflow and tap targets with full-page screenshots in `tests/screenshots/`; and console
errors on every route.

## Maintenance scripts

```bash
npm run edition     # post-process public/janghan/: five-item nav, per-record citations, sitemap
npm run romanise    # apply the McCune-Reischauer display layer to the JSON copies in src/data and public/data
npm run og          # public/og.png
npm run build && npm run cv:pdf && npm run build    # public/files/mohd-bilal-cv.pdf
```

`edition` and `romanise` are idempotent and must be re-run after any regeneration or re-export
from a project repository. Neither ever writes to frozen research data: `romanise` rewrites only
the display copies, never the frozen CSVs, and never touches source citations or URLs. Person-name
mappings are listed explicitly in `scripts/romanise.mjs` so every change is reviewable.

## Data

- `src/data/{core,people,story,timeline,network,sources}.json` — the Buddhist Bridges web-JSON
  tier, copied (never symlinked) from that repository's `outputs/web/`; `public/data/` holds the
  runtime copies the explore page fetches.
- `src/data/hallyu.json` — verified counts from the `hallyu-indian-press` pilot.
- `src/data/janghan.json` — written only by the Janghan `build_site.py --to-website`.
- `src/data/presentations.json` — conference presentations.
- `src/data/{site,projects,publications,cv}.ts` — typed site content (identity and nav, project
  cards with category, year label, art and overlay, articles with status, CV entries).
- `public/janghan/` — the static 長恨 edition, generated from the frozen corpus by
  `build_site.py` in the 장한 repository, then finished by `npm run edition`.

Deployment: GitHub Actions builds `master` and publishes to GitHub Pages.
