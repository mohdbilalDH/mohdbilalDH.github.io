# Register Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild mohdbilaldh.github.io from scratch as an Astro 5 static site on the "Register" design system (Newsreader + Source Sans 3 + IBM Plex Mono, paper-white, vermilion accent), preserving every page, all content, the validated data, and the explore instrument.

**Architecture:** One tokens file and one base stylesheet; Astro components with scoped styles that only reference tokens; typed data files for prose-free content; vanilla `<script>` islands for the menu, register, timeline, and dialog; Python Playwright scripts (webapp-testing skill) as the test suite against `astro preview`.

**Tech Stack:** Astro 5, @fontsource (Newsreader variable, Source Sans 3 variable, IBM Plex Mono, Noto Serif KR, Noto Sans KR), vanilla CSS/JS, Python 3 + Playwright in `tests/.venv`, headless Chrome for the CV PDF.

**Spec:** `docs/superpowers/specs/2026-09-13-register-rebuild-design.md`

## Global Constraints

- Work in `/Users/mohdbilal/Documents/Website Projects/website` on branch `rebuild/register-2026-09`. Never push.
- Reference source for content and chart geometry: commit `cf3eba4` (`git show cf3eba4:src/<path>`). Copy prose verbatim.
- Colours only via tokens in `src/styles/tokens.css`; the only other hex allowed is inside chart components using `--b1…--b6`/`--void` tokens (no raw hex there either).
- Fonts: `--f-display` Newsreader, `--f-body` Source Sans 3, `--f-mono` IBM Plex Mono, Noto KR fallbacks. Headings ≤ weight 500. Radius 2px on buttons/inputs, 0 elsewhere. No `box-shadow`, no gradients, no entrance animations. Transitions 150ms ease-out on colour/background/border/opacity only.
- Official name "Mohd Bilal"; citation form "Bilal, Mohd". Forthcoming article citation verbatim: Mohd Bilal. "Relic, Axis, and Adaptation: Selective Symbolic Preservation from the Indian Stūpa to the East Asian Pagoda." *남아시아연구* (Journal of South Asian Studies) 32, no. 2 (2026). Forthcoming.
- Keep untouched: `public/janghan/`, `public/data/`, `public/favicon.svg`, `public/robots.txt`, `scripts/make-cv-pdf.mjs`, `.github/workflows/deploy.yml`, `src/data/*.json`.
- Tests: `tests/run.sh [script]` builds, serves `dist/` with `astro preview` on port 4321 through the webapp-testing helper, and runs the named Python script (or all). A script passes when it exits 0.
- Commit after every task with trailer `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.

## File structure

```
src/styles/tokens.css          all custom properties
src/styles/base.css            fonts, reset, type roles, utilities, print
src/layouts/Base.astro         head + chrome; Project.astro adds citation meta
src/components/SiteHeader.astro, SiteFooter.astro, Button.astro, Eyebrow.astro,
  ProjectTable.astro, StatusMark.astro, PubList.astro, Factsheet.astro,
  FigureFrame.astro, ChartFrame.astro, EmptyState.astro, DataTable.astro, PersonDialog.astro
src/components/figures/*.astro  the twelve figure ports
src/data/site.ts, projects.ts, publications.ts, cv.ts  + existing JSON
src/pages/...                   eleven routes
tests/run.sh, tests/e2e/*.py, tests/screenshots/
```

---

### Task 1: Branch, test harness, design foundation, home shell

**Files:**
- Create: `tests/run.sh`, `tests/e2e/_lib.py`, `tests/e2e/test_home.py`, `tests/e2e/test_menu.py`
- Create: `src/styles/tokens.css`, `src/styles/base.css`, `src/layouts/Base.astro`, `src/components/SiteHeader.astro`, `src/components/SiteFooter.astro`, `src/components/Button.astro`, `src/components/Eyebrow.astro`, `src/data/site.ts`, `src/pages/index.astro`
- Delete: everything under `src/` except `src/data/*.json`

**Interfaces:**
- Produces: tokens listed in spec §2; `Base` props `{ title?: string; description?: string; current?: string }` with a `head` slot; `Button` props `{ href?: string; variant?: 'primary'|'secondary'; download?: boolean; type?: 'button'|'submit'; id?: string; class?: string }`; `site` export from `site.ts`.

- [ ] **Step 1: Branch and clear the old source**

```bash
cd "/Users/mohdbilal/Documents/Website Projects/website" && git checkout -b rebuild/register-2026-09 && mkdir -p /tmp/keepdata && cp src/data/*.json /tmp/keepdata/ && rm -rf src && mkdir -p src/styles src/layouts src/components/figures src/data src/pages/projects/buddhist-bridges src/pages/projects/janghan tests/e2e tests/screenshots && cp /tmp/keepdata/*.json src/data/ && ls src/data
```
Expected: the nine JSON files listed.

- [ ] **Step 2: Install fonts and the test environment**

```bash
cd "/Users/mohdbilal/Documents/Website Projects/website" && npm install @fontsource-variable/newsreader@5.3.0 @fontsource-variable/source-sans-3@5.3.0 @fontsource/ibm-plex-mono@5.3.0 @fontsource/noto-serif-kr@5.3.0 @fontsource/noto-sans-kr@5.3.0 && npm uninstall @fontsource-variable/source-serif-4 @fontsource/geist-mono @fontsource/ibm-plex-sans @fontsource/inter && ls node_modules/@fontsource-variable/newsreader/*.css | head && python3 -m venv tests/.venv && tests/.venv/bin/pip install -q playwright && tests/.venv/bin/playwright install chromium && grep -q "tests/.venv" .gitignore || printf "tests/.venv/\ntests/screenshots/\n" >> .gitignore
```
Expected: `full.css`, `full-italic.css` (or `wght.css`/`opsz.css`) listed for newsreader; playwright installed.

- [ ] **Step 3: Test harness**

`tests/run.sh`:
```bash
#!/usr/bin/env bash
# Build, serve dist/ on :4321, run one or all e2e scripts. Usage: tests/run.sh [test_name.py]
set -euo pipefail
cd "$(dirname "$0")/.."
npm run build >/dev/null
PY=tests/.venv/bin/python
HELPER="$HOME/.claude/skills/webapp-testing/scripts/with_server.py"
if [ $# -gt 0 ]; then SCRIPTS=("tests/e2e/$1"); else SCRIPTS=(tests/e2e/test_*.py); fi
for s in "${SCRIPTS[@]}"; do
  echo "== $s"
  $PY "$HELPER" --server "npx astro preview --host 127.0.0.1 --port 4321" --port 4321 -- $PY "$s"
done
echo "ALL PASSED"
```
Run `chmod +x tests/run.sh`.

`tests/e2e/_lib.py`:
```python
from playwright.sync_api import sync_playwright
BASE = "http://127.0.0.1:4321"
ROUTES = ["/", "/projects/", "/projects/janghan/", "/projects/buddhist-bridges/",
          "/projects/buddhist-bridges/explore/", "/projects/hallyu-indian-press/",
          "/publications/", "/visualizations/", "/cv/", "/contact/", "/no-such-page/"]

class Browser:
    def __enter__(self):
        self._p = sync_playwright().start()
        self.browser = self._p.chromium.launch()
        self.errors = []
        return self
    def page(self, width=1280, height=900):
        ctx = self.browser.new_context(viewport={"width": width, "height": height})
        pg = ctx.new_page()
        pg.on("console", lambda m: self.errors.append(f"{pg.url}: {m.text}") if m.type == "error" else None)
        pg.on("pageerror", lambda e: self.errors.append(f"{pg.url}: {e}"))
        return pg
    def __exit__(self, *a):
        self.browser.close(); self._p.stop()

def check(cond, msg):
    if not cond:
        raise SystemExit(f"FAIL: {msg}")
    print(f"ok: {msg}")
```

`tests/e2e/test_home.py`:
```python
from _lib import Browser, BASE, check
with Browser() as b:
    p = b.page(); p.goto(BASE + "/"); p.wait_for_load_state("networkidle")
    check(p.title() == "Mohd Bilal — Korean Studies & Digital Humanities", "home title")
    check(p.locator("h1").inner_text().strip() == "Mohd Bilal", "display name h1")
    check(p.locator("a.btn--primary[href='/projects/']").count() == 1, "primary action to projects")
    check(p.locator("a.btn--secondary[href='/files/mohd-bilal-cv.pdf'][download]").count() == 1, "CV download action")
    check(p.locator("header nav a[aria-current='page']").count() == 0, "home has no current nav item")
    check(p.locator("main .prose p").count() >= 3, "bio paragraphs rendered")
    check(b.errors == [], f"no console errors: {b.errors}")
```

`tests/e2e/test_menu.py`:
```python
from _lib import Browser, BASE, check
with Browser() as b:
    p = b.page(375, 812); p.goto(BASE + "/"); p.wait_for_load_state("networkidle")
    t = p.locator("button.nav-toggle"); nav = p.locator("#site-nav")
    check(t.is_visible(), "toggle visible on phone")
    check(not nav.is_visible(), "nav hidden before toggle")
    t.click(); check(t.get_attribute("aria-expanded") == "true" and nav.is_visible(), "opens")
    check(nav.locator("a").first.bounding_box()["height"] >= 44, "44px tap targets")
    p.keyboard.press("Escape")
    check(t.get_attribute("aria-expanded") == "false" and not nav.is_visible(), "Escape closes")
    check(p.evaluate("document.activeElement.classList.contains('nav-toggle')"), "focus returns to toggle")
    t.click(); p.mouse.click(200, 700)
    check(t.get_attribute("aria-expanded") == "false", "outside click closes")
    d = b.page(1280, 900); d.goto(BASE + "/")
    check(not d.locator("button.nav-toggle").is_visible() and d.locator("#site-nav").is_visible(), "desktop nav inline")
    check(b.errors == [], f"no console errors: {b.errors}")
```

- [ ] **Step 4: Run the tests to see them fail**

Run: `tests/run.sh test_home.py`
Expected: build fails (no pages) or FAIL lines. Either counts as red.

- [ ] **Step 5: tokens.css**

```css
:root {
  color-scheme: light;
  --paper: #fdfcfa; --surface: #f4f1ea; --ink: #1c1a17; --text: #2c2924; --muted: #5a554c;
  --hairline: #d9d4ca; --rule: var(--ink);
  --accent: #c8321f; --accent-deep: #a3281a; --accent-tint: #fbe9e6; --negative: #8a1c1c;
  /* validated cohort palette — charts only */
  --b1: #eda100; --b2: #008878; --b4: #2a78d6; --b5: #a8509d; --b6: #c2551c; --void: #b5af9f;
  --f-display: 'Newsreader Variable', 'Noto Serif KR', Georgia, serif;
  --f-body: 'Source Sans 3 Variable', 'Noto Sans KR', system-ui, sans-serif;
  --f-mono: 'IBM Plex Mono', ui-monospace, Menlo, monospace;
  --t-display: 4.5rem; --t-h1: 3rem; --t-h2: 1.75rem; --t-h3: 1.25rem; --t-lede: 1.5rem;
  --t-body: 1.0625rem; --t-small: 0.9375rem; --t-label: 0.75rem; --t-meta: 0.8125rem; --t-button: 0.9375rem;
  --s-1: 0.5rem; --s-2: 1rem; --s-3: 1.5rem; --s-4: 2rem; --s-5: 3rem; --s-6: 4rem; --s-7: 6rem; --s-8: 8rem;
  --w-page: 75rem; --w-prose: 42rem; --w-wide: 66rem;
  --radius: 2px; --rule-w: 1.5px; --ease: 150ms ease-out;
}
@media (max-width: 639px) { :root { --t-display: 2.75rem; --t-h1: 2.25rem; --t-lede: 1.25rem; } }
```
(Check the exact family names fontsource registers: `grep font-family node_modules/@fontsource-variable/newsreader/full.css | head -1` and `…/source-sans-3/index.css`; use those strings.)

- [ ] **Step 6: base.css**

```css
@import '@fontsource-variable/newsreader/full.css';
@import '@fontsource-variable/newsreader/full-italic.css';
@import '@fontsource-variable/source-sans-3/index.css';
@import '@fontsource-variable/source-sans-3/wght-italic.css';
@import '@fontsource/ibm-plex-mono/400.css';
@import '@fontsource/ibm-plex-mono/500.css';
@import '@fontsource/noto-serif-kr/400.css';
@import '@fontsource/noto-sans-kr/400.css';
@import '@fontsource/noto-sans-kr/500.css';

*, *::before, *::after { box-sizing: border-box; }
html { scroll-behavior: smooth; -webkit-text-size-adjust: 100%; }
body { margin: 0; background: var(--paper); color: var(--text); font: 400 var(--t-body)/1.6 var(--f-body); -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; }
img, svg { max-width: 100%; height: auto; }
::selection { background: var(--accent-tint); }
:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

h1, h2, h3 { font-family: var(--f-display); color: var(--ink); text-wrap: balance; margin: 0; }
h1 { font-size: var(--t-h1); line-height: 1.05; letter-spacing: -0.02em; font-weight: 400; font-variation-settings: 'opsz' 72; }
h2 { font-size: var(--t-h2); line-height: 1.2; letter-spacing: -0.01em; font-weight: 400; margin-top: var(--s-6); margin-bottom: var(--s-2); font-variation-settings: 'opsz' 36; }
h3 { font-size: var(--t-h3); line-height: 1.3; font-weight: 500; margin-top: var(--s-4); margin-bottom: var(--s-1); }
p { margin: 0 0 var(--s-2); }
a { color: var(--ink); text-decoration: underline; text-decoration-color: var(--hairline); text-decoration-thickness: 1px; text-underline-offset: 3px; transition: color var(--ease), text-decoration-color var(--ease); }
a:hover { color: var(--accent); text-decoration-color: var(--accent); }
em { font-style: italic; }
code { font: 0.85em var(--f-mono); background: var(--surface); padding: 0.1em 0.35em; border-radius: var(--radius); }
[lang='ko'] { font-family: var(--f-body); }

.display { font: 400 var(--t-display)/0.95 var(--f-display); letter-spacing: -0.025em; color: var(--ink); font-variation-settings: 'opsz' 72; margin: 0; }
.lede { font: 300 var(--t-lede)/1.38 var(--f-display); color: var(--text); text-wrap: pretty; margin: 0 0 var(--s-3); }
.small { font-size: var(--t-small); line-height: 1.5; }
.muted { color: var(--muted); }
.mono { font: 400 var(--t-meta)/1.5 var(--f-mono); font-variant-numeric: tabular-nums; }
.label { font: 400 var(--t-label)/1.4 var(--f-mono); letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); }
.rule { border: 0; border-top: var(--rule-w) solid var(--rule); margin: var(--s-5) 0 var(--s-3); }
.hairline { border: 0; border-top: 1px solid var(--hairline); margin: var(--s-3) 0; }
.wrap { max-width: var(--w-page); margin: 0 auto; padding: 0 var(--s-3); }
.prose { max-width: var(--w-prose); }
.wide { max-width: var(--w-wide); }
.visually-hidden { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.skip-link { position: absolute; left: -999px; top: 0; z-index: 100; background: var(--ink); color: var(--paper); padding: var(--s-1) var(--s-2); font-family: var(--f-body); }
.skip-link:focus { left: var(--s-2); }
.page-head { padding: var(--s-6) 0 var(--s-4); border-bottom: 1px solid var(--hairline); margin-bottom: var(--s-4); }
.page-head .lede { margin-top: var(--s-2); margin-bottom: 0; }
.section { border-top: var(--rule-w) solid var(--rule); padding-top: var(--s-2); margin-top: var(--s-6); }
.section > h2 { margin-top: 0; }
.mark { font: 400 var(--t-label)/1.4 var(--f-mono); letter-spacing: 0.1em; text-transform: uppercase; color: var(--accent); display: block; margin-bottom: var(--s-1); }
.cite { font: 400 var(--t-meta)/1.65 var(--f-mono); background: var(--surface); padding: var(--s-2) var(--s-3); overflow-x: auto; margin: var(--s-2) 0 var(--s-6); }
.tablewrap { overflow-x: auto; margin: var(--s-2) 0 var(--s-4); }
table { border-collapse: collapse; width: 100%; font-size: var(--t-small); }
th { text-align: left; font: 400 var(--t-label)/1.4 var(--f-mono); letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); border-bottom: var(--rule-w) solid var(--rule); padding: 0 var(--s-2) var(--s-1) 0; }
td { border-bottom: 1px solid var(--hairline); padding: var(--s-1) var(--s-2) var(--s-1) 0; vertical-align: top; }
.num { font-variant-numeric: tabular-nums; }
.badge { display: inline-block; font: 500 0.6875rem/1.4 var(--f-mono); letter-spacing: 0.06em; text-transform: uppercase; padding: 0.1rem 0.4rem; border: 1px solid var(--hairline); border-radius: var(--radius); color: var(--muted); }
.badge.high { color: #33684a; } .badge.medium { color: #8a5a00; } .badge.low, .badge.speculative { color: var(--negative); }
@media (max-width: 639px) { .page-head { padding-top: var(--s-5); } }
@media (prefers-reduced-motion: reduce) { html { scroll-behavior: auto; } *, *::before, *::after { transition: none !important; animation: none !important; } }
@media print { header, footer, .no-print { display: none !important; } body { background: #fff; color: #111; font-size: 10.5pt; } .wrap { max-width: 100%; padding: 0; } a { color: inherit; text-decoration: none; } }
```
(The two badge hexes `#33684a` and `#8a5a00` are the existing uncertainty-grammar greens/ambers; add them to tokens as `--grade-high` and `--grade-medium` and reference the tokens instead of literals.)

- [ ] **Step 7: site.ts**

```ts
export const site = {
  name: 'Mohd Bilal',
  title: 'Mohd Bilal — Korean Studies & Digital Humanities',
  description: 'Mohd Bilal — Korean Studies and Digital Humanities. Modern Korean history, colonial-era cultural history, gender, kisaeng studies, and computational research on Korea and India.',
  url: 'https://mohdbilaldh.github.io',
  role: 'Korean Studies · Digital Humanities',
  affiliation: 'Division of Global Korean Studies, The Academy of Korean Studies, Seongnam, Republic of Korea',
  affiliationShort: 'The Academy of Korean Studies',
  email: 'mohdbilalkhan2017@gmail.com',
  github: 'https://github.com/mohdbilalDH',
  orcid: 'https://orcid.org/0009-0007-8367-4690',
  orcidId: '0009-0007-8367-4690',
  lede: 'M.A. student in Korean Studies at The Academy of Korean Studies, working on modern Korean history and its cultural afterlives — between the colonial period and the contemporary moment, and between archival and computational methods.',
  bio: [
    'My research centres on gender and cultural history in modern Korea, with a particular interest in how women appear — and are made to appear — in the print culture of colonial Korea. Much of my current work concerns <em>kisaeng</em>, and how the periodical press of the 1920s and 1930s framed them as both objects of nostalgia and figures of modern anxiety. The sources are uneven, censored, and often hostile to the people they describe, which makes reading them a methodological problem as much as a historical one.',
    'I also work on the Korean Wave — particularly how Korean popular culture has been received and reframed in Indian media — and on comparisons between Korea and South Asia: colonial modernity, gendered performance traditions, and the uneven ways cultural forms travel between the two regions.',
    'The computational side of this work runs through corpus construction from historical newspapers, text analysis of Hangul–Hanja mixed sources, historical GIS, and network analysis. Colonial-era sources are fragmentary and full of uncertainty about dates, names, and authorship; most computational work smooths that uncertainty away. I would rather represent it — building projects that show the limits of what the archive can support, alongside what it reveals.',
  ],
  nav: [
    { href: '/projects/', label: 'Projects', key: 'projects' },
    { href: '/publications/', label: 'Publications', key: 'publications' },
    { href: '/visualizations/', label: 'Visualizations', key: 'visualizations' },
    { href: '/cv/', label: 'CV', key: 'cv' },
    { href: '/contact/', label: 'Contact', key: 'contact' },
  ],
} as const;
```

- [ ] **Step 8: Base.astro**

```astro
---
import '../styles/tokens.css';
import '../styles/base.css';
import SiteHeader from '../components/SiteHeader.astro';
import SiteFooter from '../components/SiteFooter.astro';
import { site } from '../data/site';
interface Props { title?: string; description?: string; current?: string }
const { title, description = site.description, current = '' } = Astro.props;
const pageTitle = title ? `${title} · ${site.name}` : site.title;
const canonical = new URL(Astro.url.pathname, Astro.site);
const person = { '@context': 'https://schema.org', '@type': 'Person', name: site.name, url: site.url, email: `mailto:${site.email}`, affiliation: { '@type': 'CollegeOrUniversity', name: site.affiliationShort }, sameAs: [site.github, site.orcid] };
---
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>{pageTitle}</title>
  <meta name="description" content={description} />
  <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
  <link rel="canonical" href={canonical} />
  <meta property="og:title" content={title ?? site.title} />
  <meta property="og:description" content={description} />
  <meta property="og:type" content="website" />
  <meta property="og:url" content={canonical} />
  <meta property="og:site_name" content={site.name} />
  <meta property="og:image" content={new URL('/og.png', Astro.site)} />
  <meta property="og:image:width" content="1200" /><meta property="og:image:height" content="630" />
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="theme-color" content="#fdfcfa" />
  <link rel="sitemap" href="/sitemap-index.xml" />
  <script type="application/ld+json" set:html={JSON.stringify(person)} />
  <slot name="head" />
</head>
<body>
  <a class="skip-link" href="#main">Skip to content</a>
  <SiteHeader current={current} />
  <main id="main"><slot /></main>
  <SiteFooter />
</body>
</html>
```

- [ ] **Step 9: SiteHeader.astro**

```astro
---
import { site } from '../data/site';
interface Props { current?: string }
const { current = '' } = Astro.props;
---
<header class="site-header" id="site-header">
  <div class="wrap inner">
    <a class="wordmark" href="/">{site.name}</a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav">Menu</button>
    <nav class="site-nav" id="site-nav" aria-label="Main">
      {site.nav.map((n, i) => (
        <a href={n.href} aria-current={n.key === current ? 'page' : undefined}>
          <span class="idx" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>{n.label}
        </a>
      ))}
    </nav>
  </div>
</header>
<style>
  .site-header { position: sticky; top: 0; z-index: 50; background: var(--paper); border-bottom: var(--rule-w) solid var(--rule); }
  .inner { display: flex; align-items: center; gap: var(--s-4); padding-top: var(--s-2); padding-bottom: var(--s-2); flex-wrap: wrap; }
  .wordmark { font: 400 1.25rem/1 var(--f-display); color: var(--ink); text-decoration: none; letter-spacing: -0.01em; }
  .wordmark:hover { color: var(--accent); }
  .site-nav { display: flex; gap: var(--s-3); margin-left: auto; }
  .site-nav a { font: 400 var(--t-label)/1 var(--f-mono); letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); text-decoration: none; padding: var(--s-1) 0; transition: color var(--ease); }
  .site-nav a .idx { color: var(--accent); margin-right: 0.45em; }
  .site-nav a:hover { color: var(--ink); }
  .site-nav a[aria-current='page'] { color: var(--ink); border-bottom: var(--rule-w) solid var(--accent); }
  .nav-toggle { display: none; margin-left: auto; font: 400 var(--t-label)/1 var(--f-mono); letter-spacing: 0.1em; text-transform: uppercase; color: var(--ink); background: transparent; border: var(--rule-w) solid var(--ink); border-radius: var(--radius); padding: 0.7rem 0.9rem; min-height: 44px; cursor: pointer; transition: background var(--ease), color var(--ease); }
  .nav-toggle:hover, .nav-toggle[aria-expanded='true'] { background: var(--ink); color: var(--paper); }
  .site-header:not([data-js]) .nav-toggle { display: none !important; }
  @media (max-width: 899px) {
    .nav-toggle { display: inline-flex; }
    .site-header[data-js] .site-nav { display: none; }
    .site-header[data-js].is-open .site-nav { display: flex; }
    .site-nav { flex-basis: 100%; flex-direction: column; gap: 0; margin: var(--s-1) 0 0; border-top: 1px solid var(--hairline); }
    .site-nav a { display: flex; align-items: center; min-height: 48px; padding: 0; font-size: var(--t-meta); border-bottom: 1px solid var(--hairline); }
    .site-nav a:last-child { border-bottom: 0; }
    .site-nav a[aria-current='page'] { border-bottom: 1px solid var(--hairline); color: var(--accent); }
  }
</style>
<script>
  const header = document.getElementById('site-header');
  const toggle = header?.querySelector<HTMLButtonElement>('.nav-toggle');
  const nav = document.getElementById('site-nav');
  if (header && toggle && nav) {
    header.dataset.js = '';
    const isOpen = () => header.classList.contains('is-open');
    const setOpen = (open: boolean) => { header.classList.toggle('is-open', open); toggle.setAttribute('aria-expanded', String(open)); toggle.textContent = open ? 'Close' : 'Menu'; };
    toggle.addEventListener('click', () => setOpen(!isOpen()));
    nav.addEventListener('click', (e) => { if ((e.target as HTMLElement).closest('a')) setOpen(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && isOpen()) { setOpen(false); toggle.focus(); } });
    document.addEventListener('click', (e) => { if (isOpen() && !header.contains(e.target as Node)) setOpen(false); });
  }
</script>
```

- [ ] **Step 10: SiteFooter.astro, Button.astro, Eyebrow.astro**

`SiteFooter.astro`:
```astro
---
import { site } from '../data/site';
const year = new Date().getFullYear();
---
<footer class="site-footer">
  <div class="wrap inner">
    <p class="who"><span class="name">{site.name}</span><span class="aff">{site.affiliation}</span></p>
    <nav aria-label="Footer" class="links">{site.nav.map((n) => <a href={n.href}>{n.label}</a>)}</nav>
    <p class="meta mono"><a href={`mailto:${site.email}`}>{site.email}</a> · <a href={site.github}>GitHub</a> · <a href={site.orcid}>ORCID</a> · © {year} {site.name}. Data CC-BY-4.0 and code MIT where projects state so.</p>
  </div>
</footer>
<style>
  .site-footer { margin-top: var(--s-8); border-top: var(--rule-w) solid var(--rule); }
  .inner { padding-top: var(--s-4); padding-bottom: var(--s-6); display: grid; gap: var(--s-2); }
  .who { margin: 0; display: flex; flex-wrap: wrap; gap: 0 var(--s-2); align-items: baseline; }
  .name { font: 400 1.125rem/1.3 var(--f-display); color: var(--ink); }
  .aff { color: var(--muted); font-size: var(--t-small); }
  .links { display: flex; flex-wrap: wrap; gap: var(--s-2) var(--s-3); }
  .links a, .meta a { color: var(--muted); text-decoration: none; }
  .links a:hover, .meta a:hover { color: var(--accent); }
  .meta { margin: 0; color: var(--muted); }
</style>
```

`Button.astro`:
```astro
---
interface Props { href?: string; variant?: 'primary' | 'secondary'; download?: boolean; type?: 'button' | 'submit'; id?: string; class?: string; disabled?: boolean }
const { href, variant = 'secondary', download = false, type = 'button', id, class: cls = '', disabled = false } = Astro.props;
const classes = `btn btn--${variant} ${cls}`.trim();
---
{href ? <a class={classes} href={href} download={download || undefined} id={id} aria-disabled={disabled || undefined}><slot /></a>
      : <button class={classes} type={type} id={id} disabled={disabled}><slot /></button>}
<style is:global>
  .btn { display: inline-flex; align-items: center; justify-content: center; gap: 0.5em; min-height: 44px; padding: 0.6rem 1.1rem; border-radius: var(--radius); border: var(--rule-w) solid var(--ink); background: transparent; color: var(--ink); font: 600 var(--t-button)/1.2 var(--f-body); letter-spacing: 0.01em; text-decoration: none; cursor: pointer; transition: background var(--ease), color var(--ease), border-color var(--ease), transform 120ms ease-out; }
  .btn:hover { background: var(--ink); color: var(--paper); }
  .btn:active { transform: scale(0.98); }
  .btn--primary { background: var(--accent); border-color: var(--accent); color: #fff; }
  .btn--primary:hover { background: var(--accent-deep); border-color: var(--accent-deep); color: #fff; }
  .btn[disabled], .btn[aria-disabled='true'] { opacity: 0.5; pointer-events: none; }
  .btn-row { display: flex; flex-wrap: wrap; gap: var(--s-1); margin: var(--s-3) 0 0; }
  @media (max-width: 639px) { .btn-row .btn { flex: 1 1 100%; } }
</style>
```
(`#fff` on the primary button is the one literal allowed outside tokens; add `--on-accent: #ffffff` to tokens instead and use it.)

`Eyebrow.astro`:
```astro
<p class="label eyebrow"><slot /></p>
<style>.eyebrow { margin: 0 0 var(--s-2); }</style>
```

- [ ] **Step 11: Home page shell (`src/pages/index.astro`)**

```astro
---
import Base from '../layouts/Base.astro';
import Button from '../components/Button.astro';
import Eyebrow from '../components/Eyebrow.astro';
import { site } from '../data/site';
---
<Base current="">
  <div class="wrap">
    <section class="hero">
      <Eyebrow>{site.role}</Eyebrow>
      <h1 class="display">{site.name}</h1>
      <p class="mono muted role">{site.affiliation}</p>
      <div class="hero-grid">
        <div>
          <p class="lede">{site.lede}</p>
          <div class="btn-row no-print">
            <Button href="/projects/" variant="primary">View projects</Button>
            <Button href="/files/mohd-bilal-cv.pdf" download>Download CV (PDF)</Button>
          </div>
        </div>
        <div class="hero-side" id="hero-projects"><!-- ProjectTable arrives in Task 2 --></div>
      </div>
    </section>
    <section class="prose bio">
      {site.bio.map((p) => <p set:html={p} />)}
    </section>
  </div>
</Base>
<style>
  .hero { padding: var(--s-6) 0 var(--s-5); border-bottom: var(--rule-w) solid var(--rule); }
  .role { margin: var(--s-2) 0 var(--s-4); }
  .hero-grid { display: grid; gap: var(--s-5); }
  @media (min-width: 1200px) { .hero-grid { grid-template-columns: 1fr 1fr; align-items: start; } }
  .bio { padding-top: var(--s-5); }
</style>
```

- [ ] **Step 12: Build and run the two tests**

Run: `tests/run.sh test_home.py && tests/run.sh test_menu.py`
Expected: every `ok:` line, `ALL PASSED`. If fontsource family names differ from `--f-display`/`--f-body`, fix tokens.css to the names found in Step 5.

- [ ] **Step 13: Commit**

```bash
git add -A && git commit -m "Rebuild foundation: tokens, base styles, layout, header, footer, home shell, e2e harness

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 2: Content data, list components, and the simple pages

**Files:**
- Create: `src/data/projects.ts`, `src/data/publications.ts`, `src/components/ProjectTable.astro`, `src/components/StatusMark.astro`, `src/components/PubList.astro`, `src/components/Factsheet.astro`, `src/pages/projects/index.astro`, `src/pages/publications.astro`, `src/pages/contact.astro`, `src/pages/404.astro`
- Modify: `src/pages/index.astro` (fill `#hero-projects`, add Recent)
- Test: `tests/e2e/test_nav.py`, extend `tests/e2e/test_home.py`

**Interfaces:**
- Produces: `projects: Project[]` with `{ slug, href, title, hanja?, subtitle, description, method, state: 'frozen'|'in-progress', stateLabel, tags: string[] }`; `articles: Article[]` with `{ title, venue, coauthors?, volume?, issue?, pages?, year, status: 'published'|'forthcoming'|'under-review', note?, doi? }`; `ProjectTable` props `{ projects: Project[]; detailed?: boolean }`; `PubList` props `{ items: {title: string; venue: string; meta?: string}[] }`; `Factsheet` props `{ rows: {term: string; html: string}[] }`.

- [ ] **Step 1: Tests**

`tests/e2e/test_nav.py`:
```python
from _lib import Browser, BASE, ROUTES, check
CURRENT = {"/projects/": "Projects", "/publications/": "Publications", "/visualizations/": "Visualizations", "/cv/": "CV", "/contact/": "Contact",
           "/projects/janghan/": "Projects", "/projects/buddhist-bridges/": "Projects", "/projects/buddhist-bridges/explore/": "Projects", "/projects/hallyu-indian-press/": "Projects"}
with Browser() as b:
    p = b.page()
    for r in ROUTES:
        resp = p.goto(BASE + r); p.wait_for_load_state("networkidle")
        expected = 404 if r == "/no-such-page/" else 200
        check(resp.status == expected, f"{r} -> {expected}")
        check(p.locator("h1").count() == 1, f"{r} has one h1")
        check(p.locator("a.skip-link").count() == 1 and p.locator("main#main").count() == 1, f"{r} landmarks")
        if r in CURRENT:
            check(p.locator("header nav a[aria-current='page']").inner_text().strip().endswith(CURRENT[r]), f"{r} current nav = {CURRENT[r]}")
    check(b.errors == [], f"no console errors: {b.errors}")
```
Append to `tests/e2e/test_home.py` before the console check:
```python
    check(p.locator(".project-table tbody tr").count() == 3, "three project rows on home")
    check("Relic, Axis, and Adaptation" in p.locator("main").inner_text(), "forthcoming article in Recent")
```
Run `tests/run.sh test_nav.py` → FAIL on missing routes.

- [ ] **Step 2: projects.ts** (descriptions verbatim from `git show cf3eba4:src/pages/projects/index.astro`)

```ts
export type Project = { slug: string; href: string; title: string; hanja?: string; subtitle: string; description: string; method: string; state: 'frozen' | 'in-progress'; stateLabel: string; tags: string[] };
export const projects: Project[] = [
  { slug: 'janghan', href: '/projects/janghan/', title: '長恨 (1927)', subtitle: 'The magazine the gisaeng made', method: 'digital edition', state: 'frozen', stateLabel: 'Issue 1 corpus frozen',
    description: 'For two issues in 1927, women registered as gisaeng edited and largely wrote their own magazine. A digital scholarly edition of both issues, reconstructed from four independent witnesses that disagree about what the magazine contained — with every item, contributor and place opening to the evidence behind it.',
    tags: ['Digital edition', 'structural encoding', 'spatial coding', 'Korean colonial print culture'] },
  { slug: 'buddhist-bridges', href: '/projects/buddhist-bridges/', title: 'Buddhist Bridges', subtitle: 'Five bridges, one silence', method: 'prosopography', state: 'frozen', stateLabel: 'Dataset frozen · V3.0',
    description: 'Who actually mediated Buddhist exchange between India and Korea, 300–2026? A source-graded prosopography of 43 documented mediators, with a frozen, checksummed dataset and an interactive chronology.',
    tags: ['Prosopography', 'timeline', 'network', 'Python + Astro', 'data CC-BY-4.0'] },
  { slug: 'hallyu-indian-press', href: '/projects/hallyu-indian-press/', title: 'Framing Hallyu in the Indian Press', subtitle: '2000–2026', method: 'corpus study', state: 'in-progress', stateLabel: 'Pilot complete · corpus in progress',
    description: 'How did Indian English-language newspapers represent and frame Hallyu as Korean popular culture became visible in India? A reproducible corpus project; the 2000–2010 pilot is complete and has already produced a publishable-grade negative finding.',
    tags: ['Web archives', 'SQLite + FTS5', 'Python', 'metadata-only publishing'] },
];
```

- [ ] **Step 3: publications.ts**

```ts
export type Article = { title: string; venue: string; coauthors?: string; volume?: string; issue?: string; pages?: string; year: number; status: 'published' | 'forthcoming' | 'under-review'; note?: string };
export const articles: Article[] = [
  { title: 'Hybridizing Culture and Linguistics: A Case Study of K-Dramas’ Impact in India', venue: 'The Myanmar Journal', coauthors: 'With Santosh Kumar Ranjan', volume: '11', issue: '1', pages: '165–188', year: 2024, status: 'published' },
  { title: 'Relic, Axis, and Adaptation: Selective Symbolic Preservation from the Indian Stūpa to the East Asian Pagoda', venue: '남아시아연구 (Journal of South Asian Studies)', volume: '32', issue: '2', year: 2026, status: 'forthcoming', note: 'Accepted · in proofs' },
  { title: 'The Role of Remakes and Adaptations in Activating Indian Agency', venue: 'Asian Communication Research', year: 2026, status: 'under-review', note: 'Special issue “Circuits of K-content: Co-productions, Collaborations, and Connections.” Manuscript under review' },
];
export const venueLine = (a: Article) => `${a.coauthors ? a.coauthors + '. ' : ''}<em>${a.venue}</em>${a.volume ? ` ${a.volume}` : ''}${a.issue ? `, no. ${a.issue}` : ''} (${a.year})${a.pages ? `: ${a.pages}` : ''}.${a.status === 'forthcoming' ? ' Forthcoming.' : ''}`;
```

- [ ] **Step 4: StatusMark, ProjectTable, PubList, Factsheet**

`StatusMark.astro`:
```astro
---
interface Props { state: 'frozen' | 'in-progress'; label: string }
const { state, label } = Astro.props;
---
<span class={`status status--${state}`}><span class="dot" aria-hidden="true"></span>{label}</span>
<style>
  .status { display: inline-flex; align-items: center; gap: 0.5em; font: 400 var(--t-label)/1.4 var(--f-mono); letter-spacing: 0.08em; text-transform: uppercase; color: var(--muted); white-space: nowrap; }
  .dot { width: 0.55em; height: 0.55em; border-radius: 50%; border: 1.5px solid var(--accent); }
  .status--frozen .dot { background: var(--accent); }
</style>
```

`ProjectTable.astro`:
```astro
---
import type { Project } from '../data/projects';
import StatusMark from './StatusMark.astro';
interface Props { projects: Project[]; detailed?: boolean }
const { projects, detailed = false } = Astro.props;
---
<table class={`project-table ${detailed ? 'is-detailed' : ''}`}>
  <thead><tr><th scope="col">Project</th><th scope="col">Method</th><th scope="col">State</th></tr></thead>
  <tbody>
    {projects.map((p) => (
      <tr>
        <td class="t"><a href={p.href}><span class="title">{p.title}</span><span class="sub">{p.subtitle}</span></a>{detailed && <p class="desc">{p.description}</p>}{detailed && <p class="tags mono muted">{p.tags.join(' · ')}</p>}</td>
        <td class="m mono muted">{p.method}</td>
        <td class="s"><StatusMark state={p.state} label={p.stateLabel} /></td>
      </tr>
    ))}
  </tbody>
</table>
<style>
  .project-table td { padding: var(--s-2) var(--s-2) var(--s-2) 0; }
  .project-table td.t a { text-decoration: none; display: block; }
  .project-table .title { display: block; font: 500 1.375rem/1.2 var(--f-display); letter-spacing: -0.01em; color: var(--ink); transition: color var(--ease); }
  .project-table td.t a:hover .title { color: var(--accent); }
  .project-table .sub { display: block; color: var(--muted); font-size: var(--t-small); margin-top: 0.2rem; }
  .project-table .desc { margin: var(--s-1) 0 0; max-width: 40rem; font-size: var(--t-small); }
  .project-table .tags { margin: var(--s-1) 0 0; font-size: var(--t-label); }
  .project-table td.m { padding-top: calc(var(--s-2) + 0.35rem); white-space: nowrap; }
  .project-table td.s { padding-top: calc(var(--s-2) + 0.35rem); }
  @media (max-width: 639px) {
    .project-table thead { display: none; }
    .project-table tr { display: block; border-bottom: 1px solid var(--hairline); padding: var(--s-2) 0; }
    .project-table td { display: block; border: 0; padding: 0; }
    .project-table td.m, .project-table td.s { display: inline-block; padding-top: var(--s-1); margin-right: var(--s-2); }
  }
</style>
```

`PubList.astro`:
```astro
---
interface Props { items: { title: string; venue: string; meta?: string }[] }
const { items } = Astro.props;
---
<ul class="pub-list">
  {items.map((i) => <li><span class="title">“{i.title}.”</span> <span class="venue" set:html={i.venue} />{i.meta && <span class="meta mono muted">{i.meta}</span>}</li>)}
</ul>
<style>
  .pub-list { list-style: none; margin: 0 0 var(--s-4); padding: 0; }
  .pub-list li { border-bottom: 1px solid var(--hairline); padding: var(--s-2) 0; }
  .pub-list li:first-child { border-top: var(--rule-w) solid var(--rule); }
  .title { font-weight: 600; }
  .venue { color: var(--text); }
  .meta { display: block; margin-top: 0.3rem; font-size: var(--t-label); letter-spacing: 0.06em; text-transform: uppercase; }
</style>
```

`Factsheet.astro`:
```astro
---
interface Props { rows: { term: string; html: string }[] }
const { rows } = Astro.props;
---
<dl class="factsheet">{rows.map((r) => <div><dt class="label">{r.term}</dt><dd set:html={r.html} /></div>)}</dl>
<style>
  .factsheet { margin: var(--s-3) 0; border-top: var(--rule-w) solid var(--rule); }
  .factsheet > div { display: grid; grid-template-columns: 10rem 1fr; gap: 0 var(--s-2); border-bottom: 1px solid var(--hairline); padding: var(--s-1) 0; }
  .factsheet dt { margin: 0; padding-top: 0.2rem; }
  .factsheet dd { margin: 0; font-size: var(--t-small); }
  @media (max-width: 639px) { .factsheet > div { grid-template-columns: 1fr; } }
</style>
```

- [ ] **Step 5: Pages**

`index.astro`: import `projects`, `articles`, `venueLine`, `ProjectTable`, `PubList`, `presentations.json`; replace the `#hero-projects` placeholder with `<ProjectTable projects={projects} />` inside a `.hero-side` div; after the bio add:
```astro
    <section class="section">
      <h2>Recent</h2>
      <PubList items={[
        ...articles.filter((a) => a.status !== 'under-review').sort((a, b) => b.year - a.year).map((a) => ({ title: a.title, venue: venueLine(a), meta: a.status === 'forthcoming' ? 'Journal article · forthcoming' : 'Journal article' })),
        ...presentations.slice(0, 2).map((p) => ({ title: p.title, venue: `${p.venue}${p.place ? `, ${p.place}` : ''}.`, meta: `Conference presentation · ${p.when}` })),
      ]} />
      <p class="no-print"><a href="/publications/">All publications and presentations →</a></p>
    </section>
```

`projects/index.astro`:
```astro
---
import Base from '../../layouts/Base.astro';
import Eyebrow from '../../components/Eyebrow.astro';
import ProjectTable from '../../components/ProjectTable.astro';
import { projects } from '../../data/projects';
---
<Base title="Projects" current="projects" description="Digital Humanities research projects by Mohd Bilal: a digital scholarly edition of the 1927 gisaeng magazine 長恨, the Buddhist Bridges prosopography of India–Korea exchange, and a corpus study of Hallyu in the Indian press.">
  <div class="wrap">
    <div class="page-head"><Eyebrow>Research projects</Eyebrow><h1>Projects</h1><p class="lede prose">Digital Humanities projects built on documented sources, graded evidence, and reproducible pipelines. Each project publishes its data, its method, and its limits.</p></div>
    <ProjectTable projects={projects} detailed />
    <p class="prose muted small" style="margin-top: var(--s-4);">All three projects follow the same discipline: raw sources cached with provenance, analysis separated from presentation, and only claims the sources can carry. Code and data are released under open licences as each project reaches a citable state.</p>
  </div>
</Base>
```

`publications.astro`: head slot keeps the Google Scholar `citation_*` meta and ScholarlyArticle JSON-LD for the 2024 article exactly as in `git show cf3eba4:src/pages/publications.astro`; body:
```astro
  <div class="wrap">
    <div class="page-head"><Eyebrow>Scholarship</Eyebrow><h1>Publications</h1></div>
    <section class="section"><h2>Journal articles</h2><PubList items={articles.filter(a => a.status === 'published').map(a => ({ title: a.title, venue: venueLine(a) }))} /></section>
    <section class="section"><h2>Forthcoming</h2><PubList items={articles.filter(a => a.status === 'forthcoming').map(a => ({ title: a.title, venue: venueLine(a), meta: a.note }))} /></section>
    <section class="section"><h2>Under review</h2><PubList items={articles.filter(a => a.status === 'under-review').map(a => ({ title: a.title, venue: `<em>${a.venue}</em>, ${a.note}.` }))} /></section>
    <section class="section"><h2>Conference presentations</h2>
      {years.map((y) => (<><p class="label year">{y}</p><PubList items={presentations.filter(p => p.year === y).map(p => ({ title: p.title, venue: `${p.venue}${p.place ? `, ${p.place}` : ''}, ${p.when}.` }))} /></>))}
    </section>
    <p class="muted small">A complete academic record, including training and awards, is on the <a href="/cv/">CV</a>.</p>
  </div>
```
with `const years = [...new Set(presentations.map(p => p.year))].sort((a, b) => b - a);` and `.year { margin: var(--s-4) 0 var(--s-1); }`.

`contact.astro`: page-head (Eyebrow "Get in touch", h1 Contact, lede verbatim from cf3eba4), `<Factsheet rows=[Email mailto, Affiliation with `<br>`s, Code & data GitHub, ORCID]>` in a `.prose` div, closing paragraph verbatim.

`404.astro`: `<Base title="Page not found">`, Eyebrow "404", h1 "Page not found", lede "This page doesn't exist — or, like much of the archive, it once did and left no record.", paragraph with links to home, projects, publications.

- [ ] **Step 6: Run tests**

Run: `tests/run.sh test_home.py && tests/run.sh test_nav.py`
Expected: test_home passes fully; test_nav passes for `/`, `/projects/`, `/publications/`, `/contact/`, `/no-such-page/` and fails only on routes built in later tasks (acceptable until Task 6).

- [ ] **Step 7: Commit**

```bash
git add -A && git commit -m "Content data, project table, publication list, factsheet; projects, publications, contact, 404 pages

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 3: CV page and PDF

**Files:**
- Create: `src/data/cv.ts`, `src/pages/cv.astro`
- Test: `tests/e2e/test_cv.py`

**Interfaces:**
- Produces: `cv` export `{ profile: string; education: Entry[]; experience: Entry[]; training: Entry[]; awards: Entry[]; memberships: string; languages: string }` where `Entry = { when: string; role: string; org?: string; detail?: string }`.

- [ ] **Step 1: Test**

```python
from _lib import Browser, BASE, check
with Browser() as b:
    p = b.page(); p.goto(BASE + "/cv/"); p.wait_for_load_state("networkidle")
    check(p.locator("a.btn--primary[href='/files/mohd-bilal-cv.pdf'][download]").count() == 1, "one primary download button")
    check(p.locator("a.btn--primary").count() == 1, "exactly one primary button on the page")
    r = p.request.get(BASE + "/files/mohd-bilal-cv.pdf"); check(r.status == 200 and r.headers.get("content-type", "").startswith("application/pdf"), "PDF served")
    txt = p.locator("main").inner_text()
    for s in ["Research profile", "Education", "Publications", "Conference presentations", "Academic training", "Awards", "Languages", "Relic, Axis, and Adaptation", "Jawaharlal Nehru University"]:
        check(s in txt, f"CV contains {s}")
    check("Khan" not in txt, "no Khan")
    check(b.errors == [], f"no console errors: {b.errors}")
```
Run `tests/run.sh test_cv.py` → FAIL (404).

- [ ] **Step 2: cv.ts** — every entry copied verbatim from `git show cf3eba4:src/pages/cv.astro` (research profile paragraph; Education 3 entries; Experience 3 entries with details; Training 4; Awards 2; memberships line; languages line).

- [ ] **Step 3: cv.astro**

Structure: `.page-head` with Eyebrow "Curriculum vitae", `h1` name, `.lede` "Korean Studies · Modern Korean History · Gender &amp; Cultural History · Digital Humanities", mono affiliation line with email/GitHub/ORCID links, `.btn-row.no-print` with `<Button href="/files/mohd-bilal-cv.pdf" variant="primary" download>Download PDF</Button>`. Then sections (each `<section class="cv-section">` with `h2`): Research profile (paragraph), Education, Research & professional experience, Publications (articles: forthcoming first then published, then under review, via `venueLine`), Conference presentations (grouped by year, year shown once), Academic training, Awards & fellowships, Professional memberships, Languages. Entry markup:
```astro
<div class="cv-item"><div class="cv-when mono muted">{e.when}</div><div class="cv-what"><div class="role">{e.role}</div>{e.org && <div class="org muted">{e.org}</div>}{e.detail && <div class="detail small muted">{e.detail}</div>}</div></div>
```
Styles: `.cv-section { border-top: var(--rule-w) solid var(--rule); padding-top: var(--s-2); margin-top: var(--s-5); } .cv-section h2 { margin-top: 0; font-size: 1.375rem; } .cv-item { display: grid; grid-template-columns: 9rem 1fr; gap: 0 var(--s-3); margin-bottom: var(--s-2); } .role { font-weight: 600; } @media (max-width: 639px) { .cv-item { grid-template-columns: 1fr; } .cv-when { margin-bottom: 0.2rem; } } @media print { .cv-section { break-inside: avoid-page; } }`.

- [ ] **Step 4: Regenerate the PDF and test**

```bash
npm run build && npm run cv:pdf && npm run build && tests/run.sh test_cv.py
```
Expected: `wrote …/mohd-bilal-cv.pdf`, test passes.

- [ ] **Step 5: Commit** — `git add -A && git commit -m "CV page from typed data; regenerate PDF" -m "Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"`

---

### Task 4: Figure system, Buddhist Bridges figures, person dialog, project page, visualizations

**Files:**
- Create: `src/components/FigureFrame.astro`, `src/components/PersonDialog.astro`, `src/layouts/Project.astro`, `src/components/figures/{CohortStrip,Chronology,DirectionChart,MechanismChart,Corridor,Residents,JikongCircle}.astro`, `src/pages/projects/buddhist-bridges/index.astro`, `src/pages/visualizations.astro`
- Test: `tests/e2e/test_dialog.py`

**Interfaces:**
- `FigureFrame` props `{ number: string; title: string; caption?: string; wide?: boolean }`, default slot = chart, named slot `table` = data table.
- `PersonDialog` exposes `window.showPerson(id: string): void`; dialog id `person-dialog`.
- `Project` layout props `{ title: string; description?: string; citationTitle?: string; jsonld?: object }`.

- [ ] **Step 1: Test**

```python
from _lib import Browser, BASE, check
with Browser() as b:
    p = b.page(); p.goto(BASE + "/projects/buddhist-bridges/"); p.wait_for_load_state("networkidle")
    btn = p.locator("button[data-person]").first; btn.focus(); btn.press("Enter")
    d = p.locator("dialog#person-dialog")
    check(p.evaluate("document.getElementById('person-dialog').open"), "dialog opens")
    check(d.locator("h2, h3").first.inner_text().strip() != "", "record has a name")
    check(d.locator("button.close").inner_text().strip() == "Close", "Close button")
    p.keyboard.press("Escape")
    check(not p.evaluate("document.getElementById('person-dialog').open"), "Escape closes")
    check(p.evaluate("document.activeElement === document.querySelector('button[data-person]')"), "focus returns to opener")
    check(p.locator("figure").count() >= 4, "figures on the project page")
    check(b.errors == [], f"no console errors: {b.errors}")
```

- [ ] **Step 2: FigureFrame.astro**

```astro
---
interface Props { number: string; title: string; caption?: string; wide?: boolean }
const { number, title, caption, wide = false } = Astro.props;
---
<figure class={`fig ${wide ? 'fig--wide' : ''}`}>
  <div class="fig-head"><span class="label">Figure {number}</span><p class="fig-title">{title}</p></div>
  <div class="fig-body"><slot /></div>
  {caption && <figcaption class="small muted">{caption}</figcaption>}
  {Astro.slots.has('table') && <details class="fig-table"><summary>Data table</summary><slot name="table" /></details>}
</figure>
<style>
  .fig { margin: var(--s-5) 0; border-top: 1px solid var(--hairline); padding-top: var(--s-2); }
  .fig-head { margin-bottom: var(--s-2); }
  .fig-title { font: 500 var(--t-h3)/1.3 var(--f-display); margin: 0.2rem 0 0; text-wrap: balance; }
  .fig-body :global(svg) { display: block; width: 100%; height: auto; }
  figcaption { margin-top: var(--s-1); max-width: var(--w-prose); }
  .fig-table { margin-top: var(--s-1); } .fig-table summary { cursor: pointer; font-size: var(--t-small); color: var(--muted); }
  .fig--wide { width: min(calc(100vw - 3rem), var(--w-wide)); margin-left: calc(50% - min(calc(100vw - 3rem), var(--w-wide)) / 2); }
  @media (max-width: 700px) { .fig-body { overflow-x: auto; -webkit-overflow-scrolling: touch; } .fig-body :global(svg) { min-width: 620px; } }
</style>
```

- [ ] **Step 3: Port the seven figures**

For each of `CohortStrip, Chronology, DirectionChart, MechanismChart, Corridor, Residents, JikongCircle`: `git show cf3eba4:src/components/<Name>.astro > /tmp/ref-<Name>.astro`, create `src/components/figures/<Name>.astro`, and apply exactly these transformations:
1. Keep the frontmatter data reading and every coordinate/geometry computation unchanged.
2. Replace the old `<figure>…<div class="fig-head">…</div>` / `<figcaption>` / `<details class="chart-table">` wrapper with `<FigureFrame number="…" title="…" caption="…" wide>` around the `<svg>`, moving the data table into `<div slot="table">`.
3. Inside the SVG, replace every `var(--sans)`/`var(--serif)`/`var(--mono)` with `var(--f-body)`/`var(--f-display)`/`var(--f-mono)`; `var(--faint)`→`var(--muted)`; `var(--rule)` used as a hairline→`var(--hairline)`; `var(--card)`→`var(--surface)`; `var(--accent)`→`var(--ink)`; `var(--link)`→`var(--accent)`; `var(--paper)` stays; cohort tokens stay.
4. Chronology keeps its era tabs and the era panel script; tabs become mono pills using the `.btn`-like styles (`border: var(--rule-w) solid var(--ink); border-radius: var(--radius)`), pressed = ink background; open-record calls `window.showPerson(id)` (renamed from `__bbShowPerson`).
5. Delete every `<style>` rule that set a colour or font literal; re-express needed layout rules with tokens.

- [ ] **Step 4: PersonDialog.astro** — take `git show cf3eba4:src/components/PersonCard.astro`, rename ids (`bb-person`→`person-dialog`), function to `window.showPerson`, keep the `slim` mapping and the record template; styles: dialog `border: var(--rule-w) solid var(--ink); border-radius: 0; background: var(--paper); width: min(680px, 92vw); max-height: 84vh; padding: 0`, backdrop `background: rgba(28,26,23,0.5)` (add token `--scrim: rgba(28, 26, 23, 0.5)`), close button markup `<button class="btn btn--secondary close" type="button">Close</button>`, focus return via `opener = document.activeElement` on open and `close` event listener, as in the current site.

- [ ] **Step 5: Project.astro layout**

```astro
---
import Base from './Base.astro';
interface Props { title: string; description?: string; citationTitle?: string; jsonld?: object }
const { title, description = 'A Digital Humanities research project by Mohd Bilal.', citationTitle, jsonld } = Astro.props;
---
<Base title={title} description={description} current="projects">
  <Fragment slot="head">
    {citationTitle && (<><meta name="citation_title" content={citationTitle} /><meta name="citation_author" content="Bilal, Mohd" /><meta name="citation_publication_date" content="2026" /></>)}
    {jsonld && <script type="application/ld+json" set:html={JSON.stringify(jsonld)} />}
  </Fragment>
  <slot />
</Base>
```

- [ ] **Step 6: Buddhist Bridges page** — prose verbatim from `git show cf3eba4:src/pages/projects/buddhist-bridges/index.astro`; structure: `.wrap` → `.page-head` (Eyebrow "Digital humanities · Korean Buddhist history", h1 "Five bridges, one silence", lede, mono meta line with counts from `core.json`) → `<Chronology />` → three `<section class="section">` each with `<span class="mark">Part I</span>` inside the h2, paragraphs, the DirectionChart / MechanismChart / Residents figures, and the two "evidence, close up" asides as `<aside class="capsule">` (`border-left: var(--rule-w) solid var(--ink); padding-left: var(--s-3)`), with `<button class="linklike" data-person="P-0001">Open his record</button>` → "Why it matters" → "Data and method" (`.method` frame = `background: var(--surface); padding: var(--s-3)`, download links row, `<h3 id="cite">Cite</h3>` and `.cite` block reading `Bilal, Mohd (2026). Five Bridges, One Silence…`). Dataset JSON-LD passed via `jsonld` with `creator.name = 'Mohd Bilal'`. `<PersonDialog />` and the `data-person` click script at the end.

- [ ] **Step 7: visualizations.astro** — page-head (Eyebrow "Research instruments", h1, lede verbatim), section "Buddhist Bridges — India–Korea exchange, 300–2026" with the paragraph, `CohortStrip`, `Chronology`, `DirectionChart`, `Corridor`, explore link; section "Hallyu in the Indian press" renders `HallyuGrowthChart` (created in Task 6 — until then leave a comment and add it in Task 6); closing method note verbatim; `<PersonDialog />`.

- [ ] **Step 8: Run** `tests/run.sh test_dialog.py` → passes. **Step 9: Commit** `"Figure frame, Buddhist Bridges figures, person dialog, project page, visualizations"` with trailer.

---

### Task 5: Explore page — sortable register, timeline with states

**Files:**
- Create: `src/components/DataTable.astro`, `src/components/ChartFrame.astro`, `src/components/EmptyState.astro`, `src/pages/projects/buddhist-bridges/explore.astro`
- Test: `tests/e2e/test_register.py`, `tests/e2e/test_timeline.py`

**Interfaces:**
- `DataTable` props `{ id: string; columns: { key: string; label: string; sortable?: boolean; numeric?: boolean }[] }`; rows come through the default slot as `<tr data-<key>="sortvalue">`; header buttons carry `data-sort="<key>"`; the component's script sorts `tbody tr` by `dataset[key]` (numeric when `numeric`), toggles `aria-sort` `ascending|descending|none`, and re-appends rows.
- `ChartFrame` props `{ id: string; loading: string; error: string }` renders `<div id={id} class="chart-frame"><div id={id}-status class="chart-status" role="status"><p>{loading}</p></div><div id={id}-tip class="tip" role="status"></div></div>` and exposes `data-error={error}`.
- `EmptyState` props `{ id?: string }`, slots: default message, `action`.

- [ ] **Step 1: Tests**

`test_register.py`:
```python
from _lib import Browser, BASE, check
with Browser() as b:
    p = b.page(); p.goto(BASE + "/projects/buddhist-bridges/explore/"); p.wait_for_load_state("networkidle")
    count = p.locator("#reg-count"); inp = p.locator("#reg-search")
    check(count.inner_text().strip() == "43 of 43 mediators", "initial count")
    inp.fill("hye"); check(count.inner_text().startswith("5 of 43"), "filtered count")
    inp.fill("zzzz"); check(p.locator("#reg-empty").is_visible() and "zzzz" in p.locator("#reg-empty").inner_text(), "empty state names the query")
    p.locator("#reg-clear").click(); check(count.inner_text().strip() == "43 of 43 mediators" and p.evaluate("document.activeElement.id") == "reg-search", "clear restores and refocuses")
    first = lambda: p.locator("#reg-table tbody tr:not([hidden]) td.name").first.inner_text().strip()
    a = first(); p.locator("#reg-table th button[data-sort='name']").click(); asc = first()
    p.locator("#reg-table th button[data-sort='name']").click(); desc = first()
    check(asc != desc and p.locator("#reg-table th[aria-sort='descending']").count() == 1, "name sort toggles with aria-sort")
    p.locator("#reg-table th button[data-sort='start']").click(); check(p.locator("#reg-table th[aria-sort='ascending']").count() == 1, "date sort ascending")
    p.locator("#reg-table tbody tr:not([hidden])").first.click(); check(p.evaluate("document.getElementById('person-dialog').open"), "row opens record")
    check(b.errors == [], f"no console errors: {b.errors}")
```

`test_timeline.py`:
```python
from _lib import Browser, BASE, check
with Browser() as b:
    p = b.page(); p.goto(BASE + "/projects/buddhist-bridges/explore/"); p.wait_for_load_state("networkidle")
    check(p.locator("#tl-chart svg").count() == 1 and not p.locator("#tl-chart-status").is_visible(), "timeline renders")
    p.locator("button.preset[data-preset='moved']").click(); check(p.locator("button.preset[data-preset='moved']").get_attribute("aria-pressed") == "true", "preset pressed")
    p.locator(".zoombar button[data-zoom='B1']").click(); check("marks shown" in p.locator("#tl-count").inner_text(), "count line")
    e = b.page(); e.route("**/data/timeline.json", lambda r: r.abort()); e.goto(BASE + "/projects/buddhist-bridges/explore/"); e.wait_for_timeout(800)
    check(e.locator("#tl-chart-status").is_visible() and "could not be loaded" in e.locator("#tl-chart-status").inner_text(), "error state")
    e.unroute("**/data/timeline.json"); e.locator("#tl-retry").click(); e.wait_for_selector("#tl-chart svg", timeout=5000)
    check(e.locator("#tl-chart svg").count() == 1, "retry renders")
    check(all("timeline.json" in x for x in b.errors), f"only the aborted fetch may log: {b.errors}")
```

- [ ] **Step 2: EmptyState, ChartFrame, DataTable**

`EmptyState.astro`:
```astro
---
interface Props { id?: string; hidden?: boolean }
const { id, hidden = false } = Astro.props;
---
<div class="empty" id={id} hidden={hidden}><p class="msg"><slot /></p><slot name="action" /></div>
<style>.empty { background: var(--surface); padding: var(--s-4) var(--s-3); text-align: center; color: var(--muted); font-size: var(--t-small); } .msg { margin: 0 0 var(--s-2); }</style>
```

`ChartFrame.astro`:
```astro
---
interface Props { id: string; loading: string; error: string }
const { id, loading, error } = Astro.props;
---
<div id={id} class="chart" data-error={error}>
  <div id={`${id}-status`} class="status" role="status"><p>{loading}</p></div>
  <div id={`${id}-tip`} class="tip" role="status"></div>
</div>
<style>
  .chart { position: relative; }
  .chart :global(svg) { display: block; width: 100%; height: auto; }
  .status { background: var(--surface); min-height: 14rem; display: grid; place-content: center; gap: var(--s-2); text-align: center; color: var(--muted); font-size: var(--t-small); padding: var(--s-3); }
  .status p { margin: 0; }
  .tip { position: absolute; display: none; pointer-events: none; z-index: 20; background: var(--paper); border: 1px solid var(--ink); padding: var(--s-1) var(--s-2); max-width: 330px; font: 400 var(--t-meta)/1.5 var(--f-body); }
  .tip :global(h4) { margin: 0 0 0.15rem; font: 500 0.9rem/1.3 var(--f-display); }
  @media (max-width: 700px) { .chart { overflow-x: auto; } .chart :global(svg) { min-width: 620px; } }
</style>
```

`DataTable.astro`:
```astro
---
interface Props { id: string; columns: { key: string; label: string; sortable?: boolean; numeric?: boolean }[] }
const { id, columns } = Astro.props;
---
<div class="tablewrap">
  <table id={id} class="data-table">
    <thead><tr>{columns.map((c) => <th scope="col" aria-sort={c.sortable ? 'none' : undefined}>{c.sortable ? <button type="button" data-sort={c.key} data-numeric={c.numeric ? '1' : undefined}>{c.label}<span class="arrow" aria-hidden="true"></span></button> : c.label}</th>)}</tr></thead>
    <tbody><slot /></tbody>
  </table>
</div>
<style>
  th button { all: unset; cursor: pointer; font: inherit; letter-spacing: inherit; text-transform: inherit; color: inherit; display: inline-flex; gap: 0.4em; align-items: center; min-height: 32px; }
  th button:hover { color: var(--ink); } th button:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }
  th[aria-sort='ascending'] .arrow::after { content: '↑'; } th[aria-sort='descending'] .arrow::after { content: '↓'; }
  th[aria-sort='ascending'], th[aria-sort='descending'] { color: var(--ink); }
  .data-table :global(tr[tabindex]) { cursor: pointer; } .data-table :global(tr[tabindex]:hover td), .data-table :global(tr[tabindex]:focus-visible td) { background: var(--surface); }
  .data-table :global(td) { transition: background var(--ease); }
  @media (max-width: 767px) { .data-table :global(td) { padding-top: 0.75rem; padding-bottom: 0.75rem; } }
</style>
<script>
  document.querySelectorAll<HTMLTableElement>('table.data-table').forEach((table) => {
    const body = table.tBodies[0];
    table.querySelectorAll<HTMLButtonElement>('th button[data-sort]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.dataset.sort!; const numeric = btn.dataset.numeric === '1'; const th = btn.closest('th')!;
        const dir = th.getAttribute('aria-sort') === 'ascending' ? 'descending' : 'ascending';
        table.querySelectorAll('th[aria-sort]').forEach((h) => h.setAttribute('aria-sort', 'none'));
        th.setAttribute('aria-sort', dir);
        const rows = [...body.querySelectorAll<HTMLTableRowElement>('tr[data-row]')];
        const val = (r: HTMLTableRowElement) => r.dataset[key] ?? '';
        rows.sort((a, b) => { const x = val(a), y = val(b); const c = numeric ? Number(x) - Number(y) : x.localeCompare(y, undefined, { sensitivity: 'base' }); return dir === 'ascending' ? c : -c; });
        rows.forEach((r) => body.appendChild(r));
        const empty = body.querySelector('tr.empty-row'); if (empty) body.appendChild(empty);
      });
    });
  });
</script>
```

- [ ] **Step 3: explore.astro** — take `git show cf3eba4:src/pages/projects/buddhist-bridges/explore.astro` as the geometry source. New page:
  - `.wrap.wide`: back link (`← Five bridges, one silence`), `h1` "Explore the evidence", lede verbatim.
  - `h2` "Timeline, 300–2026"; presets group (buttons `.preset` with `aria-pressed`, styled as ink-bordered pills, pressed = accent background, min-height 44px); zoombar (mono, underlined buttons, `aria-pressed`); `<details class="adv">` advanced filters unchanged in structure; `<ChartFrame id="tl-chart" loading="Loading the timeline…" error="The timeline could not be loaded." />`; `<p class="small muted" id="tl-count" aria-live="polite">`; legend paragraph verbatim.
  - `h2` "The register"; helper sentence; `<input class="reg-search" id="reg-search" type="search" placeholder="Search the 43 mediators…" aria-label="Search register">` (`min-height: 44px; border: 1px solid var(--ink); border-radius: var(--radius); background: var(--paper); padding: 0 var(--s-2); font: inherit; width: min(320px, 100%)`), `<p class="mono muted" id="reg-count" aria-live="polite">`; `<DataTable id="reg-table" columns={[{key:'name',label:'Name',sortable:true},{key:'hangul',label:''},{key:'band',label:'Era',sortable:true},{key:'start',label:'Dates',sortable:true,numeric:true},{key:'typology',label:'Mediation'},{key:'confidence',label:'Confidence',sortable:true}]}>` with rows:
    ```astro
    {people.people.map((p) => (
      <tr class="reg-row" data-row data-person={p.id} data-name={p.name} data-band={p.band} data-start={p.birth ?? p.floruit?.[0] ?? 9999} data-confidence={{HIGH: 1, MEDIUM: 2, LOW: 3, SPECULATIVE: 4}[p.confidence] ?? 5} data-search={`${p.name} ${p.hangul} ${p.band} ${TYPO[p.typology] ?? p.typology}`.toLowerCase()} tabindex="0">
        <td class="name" style="font-weight: 600;">{p.name}</td><td class="muted">{p.hangul}</td><td><span class="badge" style={`color: var(--${p.band.toLowerCase()});`}>{p.band}</span></td><td class="num">{life(p)}</td><td>{TYPO[p.typology] ?? p.typology.toLowerCase()}</td><td><span class={`badge ${p.confidence.toLowerCase()}`}>{p.confidence}</span>{p.single_source && <span class="badge">1 src</span>}</td>
      </tr>
    ))}
    <tr class="empty-row" id="reg-empty-row" hidden><td colspan="6"><EmptyState id="reg-empty"><span id="reg-empty-msg"></span><button slot="action" type="button" class="btn btn--secondary" id="reg-clear">Clear search</button></EmptyState></td></tr>
    ```
    (Note: `data-confidence` uses `{ … }[p.confidence]` computed in frontmatter as a helper `grade(p)` to keep the template readable.)
  - `<PersonDialog />`.
  - Script: register block exactly as in the current site (`filterRegister`, count text `"43 of 43 mediators"` / `"N of 43 mediators match “q”"`, empty row toggling `#reg-empty-row`, clear button), then the timeline block from the reference file with these edits: `STATUS = document.getElementById('tl-chart-status')`, `loadTimeline()` with `.catch` writing `<p>${root.dataset.error}</p><button type="button" class="btn btn--secondary" id="tl-retry">Try again</button>`, `if (!data) return;` at the top of `render()`, lane-listener attached once, tooltip element `#tl-chart-tip`, `window.showPerson` instead of `__bbShowPerson`, and all `var(--sans|serif|mono|faint|card|link|accent)` remapped as in Task 4 Step 3.

- [ ] **Step 4: Run** `tests/run.sh test_register.py && tests/run.sh test_timeline.py` → pass. **Step 5: Commit** `"Explore: sortable searchable register, timeline with loading and error states"` with trailer.

---

### Task 6: Hallyu page and chart; Janghan page and figures

**Files:**
- Create: `src/components/figures/HallyuGrowthChart.astro`, `src/pages/projects/hallyu-indian-press.astro`, `src/components/figures/{JanghanWitnesses,JanghanLevels,JanghanRegisters,JanghanBylines}.astro`, `src/pages/projects/janghan/index.astro`
- Modify: `src/pages/visualizations.astro` (add HallyuGrowthChart)

- [ ] **Step 1:** Port `HallyuGrowthChart` and the four Janghan figures with the Task 4 Step 3 transformation rules (`git show cf3eba4:src/components/<Name>.astro`).
- [ ] **Step 2:** `hallyu-indian-press.astro`: prose verbatim from `git show cf3eba4:src/pages/projects/hallyu-indian-press.astro`; page-head (Eyebrow "Digital humanities · Corpus study", h1, lede, `<StatusMark state="in-progress" label="Pilot complete · full corpus in progress" />`), intro paragraph, chart, sections "What the pilot found", "Data" (`<Factsheet rows=…>` four rows verbatim), "Method", "Status & next steps", "Cite" (`.cite` block "Bilal, Mohd. Framing Hallyu in the Indian Press, 2000–2026. …").
- [ ] **Step 3:** `janghan/index.astro`: prose verbatim from `git show cf3eba4:src/pages/projects/janghan/index.astro` (394 lines; keep every paragraph, list, note, plate, and link; keep the `NOTE_DISPLAY`-style data usage). Structure: page-head (Eyebrow "Digital humanities · Colonial Korean print culture", h1 "長恨 (1927): the magazine the gisaeng made" with `<span lang="ko">`, lede, the gisaeng note as `<aside class="capsule">`), cover plates as a two-up `<div class="plates">` (`display: grid; grid-template-columns: 1fr 1fr; gap: var(--s-2)` → one column < 640), then sections in the original order each with `<span class="mark">` from the original `.act-no` text, the four figures where the original placed them, the edition link list as a ruled `<ul class="edition-links">`, "Limits", "Methods, data & citation" with the `.cite` block.
- [ ] **Step 4:** Add `<HallyuGrowthChart />` to `visualizations.astro`.
- [ ] **Step 5:** Run `tests/run.sh test_nav.py` → all eleven routes pass. Commit `"Hallyu and Janghan project pages with ported figures"` with trailer.

---

### Task 7: Responsive and console sweep

**Files:**
- Test: `tests/e2e/test_responsive.py`, `tests/e2e/test_console.py`
- Modify: whatever the sweep reveals.

- [ ] **Step 1: Tests**

`test_responsive.py`:
```python
from _lib import Browser, BASE, ROUTES, check
import os
os.makedirs("tests/screenshots", exist_ok=True)
with Browser() as b:
    for w, h in [(375, 812), (768, 1024), (1280, 900)]:
        p = b.page(w, h)
        for r in ROUTES:
            p.goto(BASE + r); p.wait_for_load_state("networkidle")
            sw, iw = p.evaluate("[document.documentElement.scrollWidth, window.innerWidth]")
            check(sw <= iw, f"{r} @ {w}px no horizontal overflow ({sw} <= {iw})")
            small = p.evaluate("[...document.querySelectorAll('a, button')].filter(e => e.offsetParent && e.getBoundingClientRect().height < 24).map(e => e.textContent.trim().slice(0,30))")
            check(len(small) == 0 or w >= 900, f"{r} @ {w}px no tiny tap targets: {small[:5]}")
            p.screenshot(path=f"tests/screenshots/{w}{r.strip('/').replace('/', '-') or 'home'}.png", full_page=True)
    check(b.errors == [], f"no console errors: {b.errors}")
```

`test_console.py`:
```python
from _lib import Browser, BASE, ROUTES, check
with Browser() as b:
    p = b.page()
    for r in ROUTES:
        p.goto(BASE + r); p.wait_for_load_state("networkidle")
    errs = [e for e in b.errors if "no-such-page" not in e]
    check(errs == [], f"zero console errors across routes: {errs}")
```

- [ ] **Step 2:** Run `tests/run.sh test_responsive.py && tests/run.sh test_console.py`; fix every failure at the source (never by loosening the test), re-run until green. Look at each screenshot in `tests/screenshots/` at 375 and 768 and fix anything that reads as shrunken desktop rather than designed for the width.
- [ ] **Step 3:** Commit `"Responsive and console sweep fixes"` with trailer.

---

### Task 8: Design reviews, DESIGN.md, OG image, final gate

**Files:**
- Modify: per review findings
- Create: `../DESIGN.md` (new), `../DESIGN-2026-08-letters.md` (archive of the old file), `public/og.png`, `scripts/make-og.mjs`

- [ ] **Step 1: web-design-guidelines review.** Invoke the `web-design-guidelines` skill over `src/**/*.astro src/styles/*.css`; fix every finding; re-run `tests/run.sh`.
- [ ] **Step 2: emil-design-eng review.** Invoke `emil-design-eng` on `Button.astro`, `SiteHeader.astro`, `DataTable.astro`, `PersonDialog.astro`; apply the Before/After table where it improves the spec's states without adding motion beyond the dials.
- [ ] **Step 3: Final greps**

```bash
npm run build && (grep -rl "Khan" dist --include=index.html | grep -v /janghan/ || echo "no Khan") && (grep -rc "box-shadow" dist/_astro/*.css) ; grep -rnE "#[0-9a-fA-F]{3,6}\b" src --include=*.astro --include=*.css | grep -v "styles/tokens.css" || echo "no stray hex"
```
Expected: `no Khan`, every css count `0`, `no stray hex` (chart files use tokens only).

- [ ] **Step 4: OG image.** `scripts/make-og.mjs` renders a 1200×630 HTML (name in Newsreader 96px, role line in Plex Mono, top rule in ink, paper ground) with headless Chrome `--screenshot` the same way `make-cv-pdf.mjs` serves `dist/`; add `"og": "node scripts/make-og.mjs"` to package.json; run it; commit the PNG.
- [ ] **Step 5: DESIGN.md.** `git mv ../DESIGN.md ../DESIGN-2026-08-letters.md` is outside this repo; do `mv` in the parent folder. Write the new `../DESIGN.md` from spec §2 and §4 with a decision log starting: `| 1 | 2026-09-13 | Register system supersedes the August 2026 Letters theme layer; owner approved direction B + A type + vermilion on 2026-09-13. | Owner asked for a from-scratch rebuild on 2026-09-13; previous log archived in DESIGN-2026-08-letters.md. |`, then one row per notable choice made during Tasks 1–8 (fonts loaded, primary-button rule, table stacking rule, sort affordance, dialog scrim token, OG generator).
- [ ] **Step 6: Full suite** `tests/run.sh` → `ALL PASSED`. Update `README.md` (fonts, tests, og script). Commit `"Design review fixes, new DESIGN.md, OG image"` with trailer.
