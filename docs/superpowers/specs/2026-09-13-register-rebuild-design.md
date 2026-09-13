# Register rebuild — design spec

Date: 2026-09-13
Site: mohdbilaldh.github.io (Astro 5, static, GitHub Pages)
Status: design approved in chat on 2026-09-13 (direction B "Register" layout with
direction A typography, vermilion accent). Supersedes `../DESIGN.md` (Aug 2026 "Letters"
theme layer) for the rebuilt site.

## 1. Goal

Rebuild the personal academic site from scratch on a new design system, using the current
site only as the reference for concept, information architecture, content, data, and
functionality. Same seven pages plus the explore view; bio, project prose, publications,
and CV entries carried over verbatim; UI copy rewritten. The result must read as a
professionally designed scholarly site, not a template: typographic, ruled, light, with
one accent and no decorative effects.

**Design read** (design-taste-frontend §0.B): academic portfolio and research index for
hiring committees, fellow researchers, and students; editorial "register" language,
leaning toward native CSS, self-hosted type, and restrained motion. Dials:
`DESIGN_VARIANCE 5 · MOTION_INTENSITY 3 · VISUAL_DENSITY 4`.

## 2. Design system

All tokens live in `src/styles/tokens.css` as custom properties on `:root`. No other file
declares a colour, font family, or radius.

### 2.1 Colour

| Token | Value | Role |
|---|---|---|
| `--paper` | `#fdfcfa` | page ground (only background) |
| `--surface` | `#f4f1ea` | frames for empty/loading/error states, code blocks, table header tint |
| `--ink` | `#1c1a17` | display, headings, wordmark, strong rules |
| `--text` | `#2c2924` | body copy |
| `--muted` | `#5a554c` | metadata, mono labels, captions (6.9:1 on paper) |
| `--hairline` | `#d9d4ca` | 1px row and section rules |
| `--rule` | `var(--ink)` | 1.5px structural rules (header, table head, section starts) |
| `--accent` | `#c8321f` | one accent: primary button, active nav index, status "frozen", focus ring, links on hover |
| `--accent-deep` | `#a3281a` | primary button hover/active |
| `--accent-tint` | `#fbe9e6` | selection background, sorted-column tint |
| `--negative` | `#8a1c1c` | uncertainty grammar "unresolved" only |
| `--b1 … --b6, --void` | unchanged from current site | validated cohort palette, charts only |

Links in prose are `--ink` with a 1px hairline underline offset 3px; hover switches
colour to `--accent`. No colour appears anywhere except through these tokens.

### 2.2 Type

Self-hosted through `@fontsource-variable/newsreader` (upright + italic),
`@fontsource-variable/source-sans-3`, `@fontsource/ibm-plex-mono` (400, 500),
`@fontsource/noto-serif-kr` (400), `@fontsource/noto-sans-kr` (400, 500).

| Token | Family | Use |
|---|---|---|
| `--f-display` | Newsreader, "Noto Serif KR", Georgia, serif | display name, h1–h3, lede, project titles, pull figures |
| `--f-body` | "Source Sans 3", "Noto Sans KR", system-ui, sans-serif | body, buttons, table cells, forms |
| `--f-mono` | "IBM Plex Mono", ui-monospace, Menlo, monospace | nav index, eyebrows, status, table headers, dates, figure numbers |

Scale (rem; base 16px):

| Role | Size / line | Weight / notes |
|---|---|---|
| display | 4.5 / 0.95, letter-spacing −0.025em, `font-variation-settings: "opsz" 72` | 400; 2.75rem below 640px |
| h1 | 3 / 1.05, −0.02em | 400 |
| h2 | 1.75 / 1.2, −0.01em | 400 |
| h3 | 1.25 / 1.3 | 500 |
| lede | 1.5 / 1.38 | 300, display family; 1.25rem below 640px |
| body | 1.0625 / 1.6 | 400 |
| small | 0.9375 / 1.5 | 400 |
| mono-label | 0.75 / 1.4, +0.1em, uppercase | 400 |
| mono-meta | 0.8125 / 1.5 | 400, tabular numerals |
| button | 0.9375 / 1.2, +0.01em | 600 |

Korean and Hanja strings inherit the role's family and fall through to the Noto face.
Headings never exceed weight 500.

### 2.3 Space, rules, shape, motion

- 8px grid: `--s-1` 0.5rem · `--s-2` 1rem · `--s-3` 1.5rem · `--s-4` 2rem · `--s-5` 3rem · `--s-6` 4rem · `--s-7` 6rem · `--s-8` 8rem.
- Container `--w-page 75rem` (1200px); reading measure `--w-prose 42rem`; wide instrument `--w-wide 66rem`.
- Rules: `1.5px solid var(--rule)` opens every major block; `1px solid var(--hairline)` separates rows.
- Radius `2px` on buttons and inputs, `0` elsewhere. No shadows. No gradients. No borders around cards; there are no cards, only ruled rows and framed figures.
- Motion: `150ms ease-out` on colour, background, border, opacity; `120ms` on `:active` scale(0.98) for buttons; no entrance animations; `prefers-reduced-motion` removes all transitions.
- Breakpoints: `640px`, `900px`, `1200px`.

## 3. Pages

All pages use `src/layouts/Base.astro` (head, header, main, footer, JSON-LD Person).
Project pages use `src/layouts/Project.astro` (adds Scholar meta and Dataset JSON-LD
where provided).

| Route | Content source | Layout notes |
|---|---|---|
| `/` | `src/data/site.ts` (name, role, lede, bio paragraphs), `projects.ts`, `publications.ts`, `presentations.json` | display name, mono role line, serif lede, action row (primary "View projects", secondary "Download CV (PDF)"), bio in the reading measure, ProjectTable (3 rows), Recent list (forthcoming article, 2024 article, two latest presentations) |
| `/projects/` | `projects.ts` | h1, lede, ProjectTable with description column, closing paragraph |
| `/projects/janghan/` | current page prose verbatim, `janghan.json`, four Janghan figures | title block, ruled sections with mono section marks, cover plates, figures, edition link list, limits, citation |
| `/projects/buddhist-bridges/` | current prose verbatim, `core.json`, `story.json`, figures | title block, meta line, Chronology, three "act" sections, method frame, dataset downloads, citation |
| `/projects/buddhist-bridges/explore/` | `people.json`, `timeline.json` (runtime) | back link, presets, zoom, advanced filters, timeline instrument, sortable searchable register |
| `/projects/hallyu-indian-press/` | current prose verbatim, `hallyu.json` | title block, status, growth chart, findings, factsheet, method, citation |
| `/publications/` | `publications.ts`, `presentations.json` | Journal articles, Forthcoming, Under review, Conference presentations by year |
| `/visualizations/` | figures | intro, Buddhist Bridges figures, Hallyu chart, method note |
| `/cv/` | `cv.ts`, `publications.ts`, `presentations.json` | header block, primary "Download PDF", ruled sections, two-column entries, print stylesheet |
| `/contact/` | `site.ts` | h1, lede, Factsheet (email, affiliation, code & data, ORCID), note |
| `/404` | — | eyebrow, h1, line, route list |

Redirect stubs in `astro.config.mjs` stay (`/about`, `/notes`, `/projects/hallyu-press`).

## 4. Components (`src/components/`)

One file, one job. Props are typed in the frontmatter.

| Component | Props | Responsibility |
|---|---|---|
| `SiteHeader` | `current: string` | wordmark, numbered mono nav, Menu toggle < 900px (aria-expanded, Escape, outside click, focus return, works without JS) |
| `SiteFooter` | — | affiliation line, footer nav, email/GitHub/ORCID, licence line |
| `Button` | `href?`, `variant: 'primary' \| 'secondary'`, `download?` | renders `<a>` or `<button>`; states: hover, focus-visible, active, disabled |
| `Eyebrow` | slot | mono-label paragraph |
| `ProjectTable` | `projects`, `detailed: boolean` | ruled table: Project (title + one-line), Method, State; stacks to rows < 640px; whole row is the link |
| `StatusMark` | `state: 'frozen' \| 'in-progress'`, label | filled or hollow mark plus mono label |
| `PubList` | `items` | ruled list; title, venue, meta |
| `Factsheet` | `rows: {term, html}[]` | ruled definition list; stacks < 640px |
| `FigureFrame` | `number`, `title`, `caption`, slot, optional table slot | figure kicker, takeaway title, chart, caption, `<details>` data table |
| `ChartFrame` | `id`, `loadingText`, `errorText` | runtime chart host with loading/error/retry region (used by explore timeline) |
| `EmptyState` | `message`, optional action slot | surface-tinted block, centred |
| `DataTable` | `columns`, rows slot, `sortable` | table shell with sortable headers (`aria-sort`), horizontal scroll wrapper |
| `PersonDialog` | — | `<dialog>` record card; `window.showPerson(id)`; close button, backdrop close, focus return |
| `CohortStrip`, `Chronology`, `DirectionChart`, `MechanismChart`, `Corridor`, `Residents`, `JikongCircle`, `HallyuGrowthChart`, `JanghanWitnesses`, `JanghanLevels`, `JanghanRegisters`, `JanghanBylines` | data from `src/data` | figures. **Port policy:** re-implemented as new files inside `FigureFrame`; the data reading and geometry code from the current components is carried over line-for-line where it encodes validated findings; every colour, font, size, label style, and container is new and tokenised. No third-party chart library. |

## 5. Data (`src/data/`)

- Kept as-is: `core.json`, `people.json`, `story.json`, `timeline.json`, `network.json`, `sources.json`, `hallyu.json`, `janghan.json`, `presentations.json`; `public/data/*` for runtime fetch.
- New typed files: `site.ts` (identity, role, lede, bio paragraphs, contact rows, affiliations), `projects.ts` (slug, title, subtitle, description, method, state, tags, href), `publications.ts` (articles with status: published / forthcoming / under-review), `cv.ts` (education, experience, training, awards, memberships, languages).
- Content in these files is copied verbatim from the current pages; the pages render data, they do not hard-code prose except long project narratives, which stay inline in their page.

## 6. Interactions and states

- **Menu**: described under SiteHeader. Link tap closes it.
- **Register (explore)**: search input filters rows on `input`; live count "43 of 43 mediators" / "N of 43 match “q”"; zero matches shows EmptyState with the query and a Clear search button that refocuses the input; column headers Name, Era, Dates, Confidence sort ascending/descending with `aria-sort` and a mono arrow; sort persists while filtering.
- **Timeline**: ChartFrame shows "Loading the timeline…" until `timeline.json` arrives; on failure shows "The timeline could not be loaded." and a Try again button; presets, zoom and lane filters ignore input until data is present; lane-checkbox listener attached once; tooltip is a hairline-bordered surface, no shadow.
- **PersonDialog**: opens from register rows, timeline marks and inline "Open record" buttons; remembers `document.activeElement` and restores it on close; Escape and backdrop close.
- **Buttons and links**: hover (accent or ink shift), focus-visible (2px accent ring, 2px offset), active (scale 0.98), disabled (muted, no pointer).
- **Download**: CV links carry `download`; PDF regenerated with `scripts/make-cv-pdf.mjs` after the CV page is built.
- No forms. Contact is a mailto link; a form without a backend would be fake.

## 7. Responsive behaviour

| Width | Header | Home | Tables | CV | Figures |
|---|---|---|---|---|---|
| ≥ 1200 | inline numbered nav | lede + actions left, ProjectTable right (2 columns) | full | date column + entry | in reading measure, may break out to `--w-wide` |
| 900–1199 | inline nav | single column, table below | full | same | same |
| 640–899 | Menu toggle | single column | full, horizontal scroll if needed | same | scroll inside frame |
| < 640 | Menu toggle | display 2.75rem, stacked actions full width | ProjectTable becomes stacked rows; register keeps table with scroll wrapper | stacked, date above entry | scroll inside frame, `min-width` on svg |

Tap targets ≥ 44px on touch widths. No horizontal page overflow at any width.

## 8. Accessibility

Skip link; `header/nav/main/footer` landmarks; one h1 per page; heading order; `aria-current="page"`; menu `aria-expanded`/`aria-controls`; dialog `aria-labelledby`; live regions for register count and timeline count; `aria-sort` on sortable headers; charts carry `role="img"` and an `aria-label`, with the data table as the text alternative; contrast ≥ 4.5:1 for all text tokens on paper; keyboard operable everywhere; `prefers-reduced-motion` respected; `lang="en"` with `lang="ko"` on Korean spans where practical.

## 9. Testing

- `npm run build` passes; page count 11 plus redirect stubs.
- Playwright (webapp-testing skill) scripts in `tests/e2e/`, run against `astro preview`: `test_nav.py` (every route 200, header current state), `test_menu.py` (toggle, Escape, focus), `test_register.py` (search count, empty state, clear, sort), `test_timeline.py` (loads; error branch by blocking `**/timeline.json`; retry), `test_dialog.py` (open, close, focus return), `test_cv.py` (download link exists and PDF served), `test_responsive.py` (no horizontal overflow at 375/768/1280 on every route; screenshots saved to `tests/screenshots/`), `test_console.py` (zero console errors on every route).
- `web-design-guidelines` review over `src/**/*.astro` and `src/styles/*.css`; findings fixed before completion.
- `emil-design-eng` review table for motion and state details.
- Build-level greps: no `Khan`, no `box-shadow`, no hard-coded hex outside `tokens.css` and chart palettes.

## 10. Delivery

- Branch `rebuild/register-2026-09`, forked from `master`.
- Delete `src/` and rebuild it; keep `public/janghan/`, `public/data/`, `public/files/`, `public/favicon.svg`, `public/og.png`, `public/robots.txt`, `astro.config.mjs` (update as needed), `scripts/make-cv-pdf.mjs`, `.github/workflows/deploy.yml`.
- New `../DESIGN.md` written from this spec; its decision log starts at row 1: "Register system supersedes the August 2026 Letters theme layer; owner approved direction B + A type + vermilion on 2026-09-13." Old file archived as `../DESIGN-2026-08-letters.md`.
- Regenerate `public/og.png` in the new system (1200×630, name, role, wordmark rule).
- No push until the owner says so.

## 11. Out of scope

The static 長恨 edition under `public/janghan/` (own stylesheet), dark mode, a blog or notes section, a contact form, analytics, headshot (no file supplied), prose rewrites.
