# HKUST-Pattern Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Re-skin and re-structure the site so it closely reproduces the HKUST DH site's system (measured in the spec) with the owner's content, adding an About page, a card-based Projects page, and a banded home.

**Architecture:** Keep the Astro 5 codebase, data files, tests, figures, and the explore instrument from the Register build. Replace `tokens.css`/`base.css`, the chrome components, and the page shells; add ProjectCard, CardRow, Tile, PageTitle components and a card-art renderer. Content stays in `src/data/*.ts`.

**Tech Stack:** Astro 5, fontsource (Playfair Display Variable, Mulish Variable, Open Sans Variable, IBM Plex Mono, Noto KR), vanilla CSS/JS, Python Playwright suite in `tests/`, headless Chrome for card art, OG, and PDF.

**Spec:** `docs/superpowers/specs/2026-09-14-hkust-system-design.md`

## Global Constraints

- Branch `rebuild/hkust-2026-09` from `master`; never push without the owner's explicit OK.
- Exact reference values from spec §2 are the target: header 124px (73px < 768px), nav Open Sans 15px uppercase `#003366` active `#ffb100`, container 1359px + 20px padding, ground `#f8f7f3`, body Mulish 15px/22.5px `#30383b`, intro Open Sans 16px/30px, page title Playfair 55px/600 `#54595f` (45px ≤ 768px), section heading Playfair 32px/700 `#4b4f58` (25px ≤ 768, 20px ≤ 375), card 24px radius, padding 230px 30px 30px (190px 20px 20px ≤ 640px), card title Playfair 32px/700 white, year label Mulish 15px/500 white, button Mulish 14px/500 +0.5px black on `#f9c349` padding 16px 30px radius 56px.
- Colours only via tokens; no reference assets or copy; official name "Mohd Bilal", citation "Bilal, Mohd".
- Tests: `tests/run.sh [script]`; a script passes when it exits 0. Commit after every task with trailer `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.

## File structure

```
src/styles/tokens.css, base.css                 replaced
src/components/SiteHeader.astro, SiteFooter.astro, Button.astro   replaced
src/components/PageTitle.astro, SectionHeading.astro, ProjectCard.astro, CardRow.astro, Tile.astro   new
src/components/FigureFrame.astro, ChartFrame.astro, EmptyState.astro, DataTable.astro, PersonDialog.astro, Factsheet.astro, PubList.astro, StatusMark.astro   re-tokenised
src/data/projects.ts (add category, yearLabel, art, overlay), site.ts (nav gains Home/About)
src/pages/index.astro, about.astro (new), projects/index.astro       rebuilt
other pages                                       title band + measure
scripts/make-card-art.mjs, scripts/make-og.mjs    new / updated
tests/e2e/test_cards.py (new), _lib.py (ROUTES + /about/), test_home.py, test_menu.py, test_nav.py (updated)
```

---

### Task 1: Tokens, base, chrome (header, footer, button), test updates

**Files:** replace `src/styles/tokens.css`, `src/styles/base.css`, `src/components/SiteHeader.astro`, `src/components/SiteFooter.astro`, `src/components/Button.astro`; create `src/components/PageTitle.astro`, `src/components/SectionHeading.astro`; modify `src/data/site.ts` (nav), `tests/e2e/_lib.py`, `tests/e2e/test_menu.py`, `tests/e2e/test_nav.py`.

**Interfaces:** tokens per spec §3; `Button` props `{ href?, variant?: 'primary'|'ghost', download?, type?, id?, class? }` rendering `.btn.btn--primary|.btn--ghost`; `PageTitle` props `{ title, eyebrow?, lede? }` renders `<section class="band band--title">`; `SectionHeading` slot → `<h2 class="section-heading">`; nav from `site.nav` = Home, About, Projects, Publications, Visualizations, CV, Contact with keys `home, about, projects, …`.

- [ ] Step 1: `git checkout -b rebuild/hkust-2026-09`. Update `tests/e2e/_lib.py` ROUTES to include `"/about/"` after `"/"`. In `test_menu.py` use `b.page(900, 900)` for the collapsed check (nav collapses below 1024) and keep 375 checks; expect `.nav-toggle` visible at 900 and hidden at 1280. In `test_nav.py` CURRENT add `"/about/": "About"` and `"/": "Home"`. Run `tests/run.sh test_nav.py` → fails on `/about/`.
- [ ] Step 2: tokens.css

```css
:root {
  color-scheme: light;
  --ground: #f8f7f3; --white: #ffffff; --navy: #003366; --navy-deep: #0a2a4d;
  --yellow: #ffb100; --button: #f9c349; --button-hover: #f0b62e;
  --text: #30383b; --title: #54595f; --heading: #4b4f58; --muted: #6b7075; --hairline: #e3e1db; --link: #2a6ebb;
  --card-overlay-1: rgba(179, 87, 67, 0.78); --card-overlay-2: rgba(48, 40, 34, 0.78); --card-overlay-3: rgba(0, 51, 102, 0.78); --card-overlay-4: rgba(160, 151, 141, 0.85);
  --scrim: rgba(10, 42, 77, 0.55); --negative: #8a1c1c; --grade-high: #33684a; --grade-medium: #8a5a00;
  --b1: #eda100; --b2: #008878; --b4: #2a78d6; --b5: #a8509d; --b6: #c2551c; --void: #b5af9f;
  --f-title: 'Playfair Display Variable', 'Noto Serif KR', Georgia, serif;
  --f-body: 'Mulish Variable', 'Noto Sans KR', system-ui, sans-serif;
  --f-ui: 'Open Sans Variable', 'Noto Sans KR', Helvetica, Arial, sans-serif;
  --f-mono: 'IBM Plex Mono', ui-monospace, Menlo, monospace;
  --t-page: 55px; --t-section: 32px; --t-card: 32px; --t-body: 15px; --t-intro: 16px; --t-small: 13px; --t-nav: 15px; --t-button: 14px;
  --header-h: 124px; --strip-h: 8px; --w-page: 1359px; --pad: 20px; --w-measure: 1060px;
  --card-pad: 230px 30px 30px; --card-h: 650px;
  --r-card: 24px; --r-pill: 56px; --r-tile: 16px; --ease: 200ms ease-out; --fade: 600ms ease-out;
}
@media (max-width: 768px) { :root { --t-page: 45px; --t-section: 25px; --t-card: 25px; --card-h: 685px; } }
@media (max-width: 640px) { :root { --t-section: 20px; --t-card: 20px; --card-pad: 190px 20px 20px; --card-h: 420px; --header-h: 73px; } }
```

- [ ] Step 3: base.css — imports (`@fontsource-variable/playfair-display/index.css`, `/wght-italic.css`, `@fontsource-variable/mulish/index.css`, `@fontsource-variable/open-sans/index.css`, plex mono 400/500, noto kr), reset, `body { background: var(--ground); color: var(--text); font: 400 var(--t-body)/1.5 var(--f-body); }`, `h1,h2,h3 { font-family: var(--f-title); }`, `.page-title { font: 600 var(--t-page)/1.5 var(--f-title); color: var(--title); margin: 0; }`, `.section-heading { font: 700 var(--t-section)/1.4 var(--f-title); color: var(--heading); margin: 55px 0 20px; }`, `.intro { font: 400 var(--t-intro)/30px var(--f-ui); max-width: var(--w-measure); }`, `.wrap { max-width: var(--w-page); margin: 0 auto; padding: 0 var(--pad); }`, `.band { padding: 60px 0; } .band--white { background: var(--white); } .band--title { padding-top: 100px; padding-bottom: 20px; }`, links `color: var(--link)`, `.caption { font-size: 13px; color: var(--muted); }`, tables/badges/cite/capsule/linklike rules carried from the Register base with the new tokens, `.fade-up { opacity: 0; transform: translateY(30px); transition: opacity var(--fade), transform var(--fade); } .fade-up.is-in { opacity: 1; transform: none; }` and `@media (prefers-reduced-motion: reduce) { .fade-up { opacity: 1; transform: none; transition: none; } }`, focus-visible `outline: 2px solid var(--navy)`, print rules.
- [ ] Step 4: SiteHeader — markup: `<div class="strip"></div><header class="site-header"><div class="wrap inner"><a class="lockup" href="/"><span class="lockup-name">Mohd Bilal</span><span class="lockup-rule"></span><span class="lockup-mark">Korean Studies<br>Digital Humanities</span></a><button class="nav-toggle" aria-expanded="false" aria-controls="site-nav">≡<span class="visually-hidden">Menu</span></button><nav id="site-nav" class="site-nav">…links…</nav></div></header>`. Styles: strip `height: var(--strip-h); background: var(--navy)`; header `background: var(--white); height: var(--header-h)`; lockup name Playfair 22px/600 navy; `.lockup-rule` 1px × 44px hairline; `.lockup-mark` Open Sans 13px uppercase letter-spacing 0.2em navy line-height 1.25; nav links `font: 400 var(--t-nav)/var(--header-h) var(--f-ui); text-transform: uppercase; color: var(--navy); padding: 0 15px; transition: color var(--ease)`; hover and `[aria-current=page]` → `color: var(--yellow)`; toggle: 44px navy "≡" glyph button visible ≤ 1023px; collapsed nav is a white full-width panel under the header with 48px rows and hairlines. Script identical in behaviour to the Register header (data-js, Escape, outside click, link close, focus return).
- [ ] Step 5: SiteFooter — `<footer><div class="wrap"><p class="contact intro">If you work on adjacent questions — Korean Studies, digital humanities, or comparative colonial history — write to <a href="mailto:…">mohdbilalkhan2017@gmail.com</a> or find the code and data on <a href="https://github.com/mohdbilalDH">GitHub</a>.</p><hr class="hairline"><p class="note">This site and its research outputs are published openly; data is CC-BY-4.0 and code MIT where each project states so. Source texts remain with their rights holders.</p></div><div class="wrap copy"><span>Copyright © {year} Mohd Bilal</span><span>Division of Global Korean Studies, The Academy of Korean Studies</span></div><div class="bar"><div class="wrap bar-inner"><span class="bar-mark">Mohd Bilal</span><span class="bar-links"><span class="label">Find me on</span><a class="icon" href=github aria-label="GitHub">…svg…</a><a class="icon" href=orcid aria-label="ORCID">…</a><a class="icon" href=mailto aria-label="Email">…</a></span></div></div></footer>` with bar `background: var(--navy); color: var(--white); min-height: 80px`; icons 32px circles with 1.5px white border; note italic 13px; copy row 13px muted.
- [ ] Step 6: Button — `.btn { display:inline-flex; align-items:center; min-height:46px; padding:16px 30px; border-radius:var(--r-pill); font:500 var(--t-button)/1 var(--f-body); letter-spacing:.5px; text-decoration:none; transition: background var(--ease), color var(--ease), transform 120ms ease-out; } .btn--primary { background: var(--button); color: #000; } .btn--primary:hover { background: var(--button-hover); } .btn--ghost { border: 1.5px solid var(--navy); color: var(--navy); background: transparent; } .btn--ghost:hover { background: var(--navy); color: var(--white); } .btn:active { transform: scale(.98); }` (add `--on-button: #000000` to tokens instead of the literal).
- [ ] Step 7: PageTitle.astro (`<section class="band band--title"><div class="wrap">{eyebrow && <p class="label">}<h1 class="page-title">{title}</h1>{lede && <p class="intro">{lede}</p>}</div></section>`), SectionHeading.astro (`<h2 class="section-heading"><slot/></h2>`). Update `site.ts` nav. Build; run `tests/run.sh test_menu.py` and `test_nav.py` (about still 404 until Task 3). Commit `"HKUST system: tokens, base, header, footer, buttons"`.

### Task 2: Project cards, card art, Projects page

**Files:** create `src/components/ProjectCard.astro`, `src/components/CardRow.astro`, `scripts/make-card-art.mjs`, `tests/e2e/test_cards.py`; modify `src/data/projects.ts`, `src/pages/projects/index.astro`, `package.json` (`"art": "node scripts/make-card-art.mjs"`).

**Interfaces:** `Project` gains `category: 'editions'|'networks'|'corpora'`, `yearLabel: string`, `art: string` (path under `/art/`), `overlay: 1|2|3|4`; `ProjectCard` props `{ project: Project }`; `CardRow` props `{ cols?: 2|3 }` default slot.

- [ ] Step 1: test_cards.py

```python
from _lib import Browser, BASE, check
with Browser() as b:
    for w, cols in [(1440, 3), (768, 3), (375, 1)]:
        p = b.page(w, 900); p.goto(BASE + "/projects/"); p.wait_for_load_state("networkidle")
        cards = p.locator(".project-card"); check(cards.count() == 3, f"{w}: three cards")
        xs = p.evaluate("[...document.querySelectorAll('.project-card')].map(c => Math.round(c.getBoundingClientRect().left))")
        check(len(set(xs)) == cols, f"{w}: {cols} column(s) ({xs})")
        c = cards.first
        check(c.locator(".card-year").inner_text().strip() != "", f"{w}: year label")
        check(c.locator("h3 a").count() == 1 and c.locator("a.btn").inner_text().strip() == "View project", f"{w}: title link + button")
        check(p.evaluate("getComputedStyle(document.querySelector('.project-card')).borderRadius") == "24px", f"{w}: 24px radius")
        p.evaluate("window.scrollTo(0, 600)"); p.wait_for_timeout(900)
        check(p.evaluate("[...document.querySelectorAll('.fade-up')].every(e => e.classList.contains('is-in'))"), f"{w}: cards faded in")
        check(p.evaluate("document.querySelector('.section-heading').textContent.trim()") == "Digital editions", f"{w}: first section heading")
    check(b.errors == [], f"no console errors: {b.errors}")
```

- [ ] Step 2: projects.ts — add to each project: janghan `category:'editions', yearLabel:'1927 · Issue 1 frozen', art:'/art/janghan.jpg', overlay:1`; buddhist-bridges `category:'networks', yearLabel:'300–2026 · Dataset V3.0', art:'/art/buddhist-bridges.jpg', overlay:3`; hallyu `category:'corpora', yearLabel:'2000–2026 · Pilot complete', art:'/art/hallyu.jpg', overlay:2`. Export `categories = [{ key:'editions', title:'Digital editions' }, { key:'networks', title:'Prosopography and networks' }, { key:'corpora', title:'Press corpora' }]`.
- [ ] Step 3: make-card-art.mjs — like make-og.mjs: serves project root, renders three 1100×1400 pages and screenshots each to `public/art/<slug>.jpg` (`--screenshot` writes PNG; keep `.png` and name the data accordingly): janghan = `<img src="/public/janghan/assets/jh01-cover.png">` cover-fit; buddhist-bridges = the built `dist/visualizations/index.html` cohort strip SVG extracted by reading the file and injecting the first `<svg` … `</svg>` whose aria-label starts with "Timeline of India–Korea"; hallyu = the SVG whose aria-label mentions "Hallyu" from `dist/projects/hallyu-indian-press/index.html`; both drawn at 900px wide centred on `--ground` with the tokens stylesheet inlined. Run `npm run build && npm run art`; confirm three PNGs exist and are > 20 KB.
- [ ] Step 4: ProjectCard.astro

```astro
---
import type { Project } from '../data/projects';
import Button from './Button.astro';
interface Props { project: Project }
const { project: p } = Astro.props;
---
<article class={`project-card fade-up overlay-${p.overlay}`} style={`--art: url('${p.art}')`}>
  <div class="card-body">
    <p class="card-year">{p.yearLabel}</p>
    <h3 class="card-title"><a href={p.href}>{p.title}</a></h3>
    <Button href={p.href} variant="primary">View project</Button>
  </div>
</article>
<style>
  .project-card { position: relative; min-height: var(--card-h); border-radius: var(--r-card); overflow: hidden; background: var(--art) center/cover no-repeat, var(--navy); display: flex; align-items: flex-end; isolation: isolate; }
  .project-card::before { content: ''; position: absolute; inset: 0; z-index: 0; transition: opacity var(--ease); }
  .overlay-1::before { background: var(--card-overlay-1); } .overlay-2::before { background: var(--card-overlay-2); } .overlay-3::before { background: var(--card-overlay-3); } .overlay-4::before { background: var(--card-overlay-4); }
  .project-card:hover::before { opacity: 0.88; }
  .card-body { position: relative; z-index: 1; padding: var(--card-pad); width: 100%; }
  .card-year { font: 500 15px/1.5 var(--f-body); color: var(--white); margin: 0 0 4px; }
  .card-title { font: 700 var(--t-card)/1.4 var(--f-title); margin: 0 0 24px; }
  .card-title a { color: var(--white); text-decoration: none; }
  .card-title a::after { content: ''; position: absolute; inset: 0; }
  .project-card:hover .card-title a { text-decoration: underline; text-underline-offset: 4px; }
  .card-body :global(.btn) { position: relative; z-index: 2; }
</style>
```
(The `::after` stretched link makes the whole card clickable while the button stays a real link on top.)

- [ ] Step 5: CardRow.astro — `<div class={`card-row cols-${cols}`}><slot/></div>` with `.card-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; } .cols-2 { grid-template-columns: repeat(2, 1fr); } @media (max-width: 640px) { .card-row, .cols-2 { grid-template-columns: 1fr; } }`, and a global script (in CardRow) `const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } }), { threshold: 0.15 }); document.querySelectorAll('.fade-up').forEach((el) => io.observe(el));` guarded so elements already in view on load get `is-in` immediately.
- [ ] Step 6: projects/index.astro — `<PageTitle title="Explore My Projects" lede="Digital Humanities projects built on documented sources, graded evidence, and reproducible pipelines. Each project publishes its data, its method, and its limits." />` then `<section class="band"><div class="wrap">{categories.map(c => (<><SectionHeading>{c.title}</SectionHeading><CardRow>{projects.filter(p => p.category === c.key).map(p => <ProjectCard project={p} />)}</CardRow></>))}</div></section>`. Run `tests/run.sh test_cards.py` → pass. Commit `"Project cards, card art, projects page"`.

### Task 3: Home and About

**Files:** create `src/components/Tile.astro`, `src/pages/about.astro`; rebuild `src/pages/index.astro`; modify `tests/e2e/test_home.py`.

- [ ] Step 1: test_home.py — assert title; `h1.page-title` text "Mohd Bilal"; `a.btn--primary[href='/about/']` text starts "More details"; hero image `img[alt*='長恨']` present with a `.caption`; `.band` count ≥ 4; `.project-card` count == 3; a `a.btn[href='/projects/']` reading "View all projects »"; `.tile` count ≥ 6; no console errors.
- [ ] Step 2: Tile.astro — props `{ href?, date, title, meta? }` → `<a|div class="tile">` with `.tile { display:block; background: var(--white); border: 1px solid var(--hairline); border-radius: var(--r-tile); padding: 24px; text-decoration: none; color: inherit; min-height: 160px; transition: border-color var(--ease), transform var(--ease); } .tile:hover { border-color: var(--yellow); transform: translateY(-2px); } .tile-date { font: 500 13px/1.4 var(--f-body); color: var(--muted); text-transform: uppercase; letter-spacing: .06em; } .tile-title { font: 700 18px/1.35 var(--f-title); color: var(--heading); margin: 8px 0; } .tile-meta { font-size: 13px; color: var(--muted); }` and a `.tile-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }` → 2 cols ≤ 1024, 1 col ≤ 640.
- [ ] Step 3: index.astro — hero band (`.hero { display:grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: center; padding: 100px 0 60px; }` → 1 col ≤ 900): left `h1.page-title` "Mohd Bilal", `p.intro` = site.lede, `<Button href="/about/" variant="primary">More details »</Button>`; right `<figure class="hero-fig"><img src="/janghan/assets/jh01-cover.png" width="900" height="1470" alt="Cover of 長恨 issue 1, January 1927" fetchpriority="high"><figcaption class="caption">長恨 창간호, 10 January 1927 — the magazine the gisaeng made. Yonsei University Library copy.</figcaption></figure>` (image max-height 520px, radius 24px). White band "What's New": three Tiles (forthcoming article → /publications/, latest presentation, "Buddhist Bridges dataset V3.0 frozen · 17 August 2026" → project). Ground band "Explore my Projects" with `p.intro` line, CardRow of three ProjectCards, `<Button href="/projects/" variant="primary">View all projects »</Button>`. White band "Talks and Presentations": tile-grid of the six latest presentations (date = when, title, meta = venue, place), then `<Button href="/publications/">View all »</Button>` (primary). Footer follows.
- [ ] Step 4: about.astro — `<PageTitle title="About" lede={site.lede} />`, band with the three bio paragraphs in `.intro`, `<Factsheet>` (affiliation, research areas: four items from CONTEXT, email, ORCID), `<Button href="/files/mohd-bilal-cv.pdf" variant="primary" download>Download CV (PDF)</Button>`. Run `tests/run.sh test_home.py && tests/run.sh test_nav.py` → pass. Commit `"Home bands and About page"`.

### Task 4: Re-skin remaining pages and components, regenerate assets

**Files:** modify `FigureFrame.astro` (white panel `background: var(--white); border-radius: var(--r-card); padding: 30px`), `ChartFrame.astro`, `EmptyState.astro`, `DataTable.astro`, `PersonDialog.astro` (radius 24px, navy border), `Factsheet.astro`, `PubList.astro`, `StatusMark.astro`, all pages under `src/pages/` to use `<PageTitle>` + `<section class="band"><div class="wrap">` + `.intro`/`.measure` (max-width 1060px), explore presets as ghost pills (`.btn--ghost`, pressed = navy fill), CV download primary, `scripts/make-og.mjs` (Playfair title on ground, navy strip top, yellow rule), README.

- [ ] Step 1: apply edits page by page; `npm run build` after each; `tests/run.sh` must stay green (register, timeline, dialog, cv).
- [ ] Step 2: `npm run build && npm run cv:pdf && npm run build && npm run og`. Commit `"Re-skin remaining pages; regenerate PDF and OG"`.

### Task 5: Sweeps, review, DESIGN.md, finish

- [ ] Step 1: `tests/run.sh` (all, including responsive at 375/768/1280 and console) → fix every failure at the source. Read screenshots for 1280-home, 375-home, 1280-projects, 768-projects, 375-projects, 1280-explore.
- [ ] Step 2: web-design-guidelines pass over changed files; fix findings.
- [ ] Step 3: Final greps: no `Khan` outside `/janghan/`, no hex outside `tokens.css` (print block excepted). Write `../DESIGN.md` v3 (HKUST-pattern system; decision log row 1 records the supersession, then rows for every judgment call: art rendering, About page, category names, breakpoints, reduced-motion fade). Archive the Register DESIGN.md as `../DESIGN-2026-09-13-register.md`. Update README. Commit.
- [ ] Step 4: finishing-a-development-branch: full suite, merge to master locally, ask before pushing.
