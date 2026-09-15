# mohdbilalDH.github.io

Academic website and Digital Humanities research portfolio of Mohd Bilal —
Korean Studies, The Academy of Korean Studies.

Built with [Astro](https://astro.build) as a fully static site. Tokens live in
`src/styles/tokens.css`; nothing else declares a colour or a typeface. The design system and every
structural decision are documented in `../DESIGN.md`, which is binding.

## Project pages

The site shell (seven-item navigation, home, projects index, publications, CV, contact) is the
one documented in `../DESIGN.md`. The three project pages follow a shared pattern, benchmarked
from the DHI, Northwestern and Kentucky DH project directories:

1. **Identity** — `ProjectHeader.astro`: kind and date span, title, a subtitle naming the resource
   and its extent, a **scale line** counting the corpus in its own units, status, dataset version,
   build date, and a Korean summary.
2. **Significance**, then **evidence figures**. Every figure carries a kicker, a title stating the
   finding as a sentence, a caption explaining its encoding and its reach, and its data as a table
   inside the frame.
3. **Method**, **limits**, and an **explore door** into the evidence layer.
4. **Project facts** — `ProjectFacts.astro`: resources beside the page including data downloads,
   duration, status, version, people and roles, split licensing, persistent identifier, and a
   citation that fills in the reader's own access date.

Each project also has `/projects/<slug>/data/` for method, coding, versions, limits and citation,
and Buddhist Bridges generates one page per mediator at
`/projects/buddhist-bridges/people/<id>/`.

`tests/e2e/test_contract.py` asserts that apparatus exists and is populated on all three pages;
`tests/e2e/test_figures.py` exercises the interactive figures. There is no word ceiling: these are
project pages, not articles.

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
npm run edition        # post-process public/janghan/: five-item nav, per-record citations, sitemap
npm run romanise       # apply the McCune-Reischauer display layer to the JSON copies in src/data and public/data
npm run janghan:views  # derive src/data/janghan-{corpus,places}.json from the edition's published JSON
npm run art            # public/art/*.png card backgrounds, rendered from the site's own figures
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
