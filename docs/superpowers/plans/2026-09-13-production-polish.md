# Production Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the Astro academic site feel finished: sticky header with a mobile menu, real button styles, home actions, empty/loading/error states, focus handling, name and publication fixes, and cleanup, all inside the existing DESIGN.md system.

**Architecture:** Static Astro 5 site. All styling lives in `src/styles/global.css` (tokens + components) plus small per-page `<style>` blocks. Interactivity is plain inline `<script>` in components; no framework. Changes are additive CSS classes and small script edits; no new dependencies.

**Tech Stack:** Astro 5, vanilla CSS and JS, headless Chrome for the CV PDF (`scripts/make-cv-pdf.mjs`), GitHub Pages via Actions.

**Spec:** `docs/superpowers/specs/2026-09-13-production-polish-design.md`

## Global Constraints

- DESIGN.md is binding: light canvas only; no shadows; no gradients on chrome; headings weight 400; fonts Inter / Geist Mono / Noto Sans KR only; card and input radius `var(--radius)` (8px); button radius `9999px` (pill); accent blues only inside figures.
- No new colour values. Derived tints use `color-mix()` on existing tokens or the DESIGN.md button border `rgba(7, 7, 9, 0.22)`.
- At most one `.btn.primary` per page.
- Transitions 150ms, on `color`, `background-color`, `border-color`, `opacity` only. The global `prefers-reduced-motion` rule already disables them; do not remove it.
- Official name everywhere: "Mohd Bilal"; citation form "Bilal, Mohd". Never "Khan".
- Forthcoming article citation, verbatim: Mohd Bilal. "Relic, Axis, and Adaptation: Selective Symbolic Preservation from the Indian Stūpa to the East Asian Pagoda." *남아시아연구* (Journal of South Asian Studies) 32, no. 2 (2026). Forthcoming.
- Do not touch `public/janghan/`.
- There is no test runner. Each task's test is `npm run build` plus a `grep` assertion on `dist/`, and for behaviour, a browser check with the stated expected result. Run every command from `/Users/mohdbilal/Documents/Website Projects/website`.
- Commit after every task with the trailer `Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>`.

---

### Task 1: Global CSS — buttons, sticky header, menu rules, state transitions, frames

**Files:**
- Modify: `src/styles/global.css` (chrome block lines 375–402; add new blocks after line 402 and after the project-card block)

**Interfaces:**
- Produces CSS classes used by later tasks: `.btn`, `.btn.primary`, `.btn-row`, `.nav-toggle`, `.site-header.is-open`, `.site-header[data-js]`, `.site-footer .who`, `.site-footer .links`, `.empty-state`, `.chart-frame`, `.result-count`.

- [ ] **Step 1: Replace the header block**

In `src/styles/global.css`, replace the block from `.site-header { border-bottom...` through the `@media (max-width: 560px)` header rule (lines 375–397) with:

```css
.site-header {
  position: sticky; top: 0; z-index: 50;
  border-bottom: 1px solid var(--rule); background: var(--paper);
}
.site-header .inner {
  max-width: 66rem; margin: 0 auto; padding: 0.75rem 1.25rem;
  display: flex; align-items: center; gap: 1.6rem; flex-wrap: wrap;
}
.brand {
  font-family: var(--serif); font-size: 1.02rem; font-weight: 600;
  color: var(--ink); text-decoration: none; letter-spacing: -0.01em;
  transition: color 150ms ease;
}
.brand:hover { color: var(--accent); }
.site-nav { display: flex; gap: 1.15rem; flex-wrap: wrap; margin-left: auto; }
.site-nav a {
  font: 500 var(--t-ui)/1.4 var(--sans); color: var(--muted); text-decoration: none;
  padding: 0.35rem 0; transition: color 150ms ease;
}
.site-nav a:hover { color: var(--accent); }
.site-nav a[aria-current='page'] {
  color: var(--ink);
  border-bottom: 2px solid var(--accent); padding-bottom: calc(0.35rem - 2px);
}
.nav-toggle { display: none; margin-left: auto; }
.site-header:not([data-js]) .nav-toggle { display: none !important; }
@media (max-width: 767px) {
  .site-header .inner { gap: 0.6rem 1rem; }
  .nav-toggle { display: inline-flex; }
  .site-header[data-js] .site-nav { display: none; }
  .site-header[data-js].is-open .site-nav { display: flex; }
  .site-nav {
    flex-basis: 100%; flex-direction: column; gap: 0;
    margin: 0.35rem 0 0.25rem; border-top: 1px solid var(--rule);
  }
  .site-nav a {
    display: block; min-height: 2.75rem; line-height: 2.75rem; padding: 0;
    font-size: 1rem; border-bottom: 1px solid var(--rule);
  }
  .site-nav a:last-child { border-bottom: none; }
  .site-nav a[aria-current='page'] {
    border-bottom: 1px solid var(--rule); padding-bottom: 0;
    text-decoration: underline; text-decoration-color: var(--accent);
    text-underline-offset: 6px; text-decoration-thickness: 2px;
  }
  .site-nav a:last-child[aria-current='page'] { border-bottom: none; }
}
```

- [ ] **Step 2: Add buttons and frames after the footer rules**

Directly after the line `.site-footer a:hover { color: var(--accent); }` add:

```css
.site-footer a { transition: color 150ms ease; }
.site-footer .who { margin: 0; color: var(--muted); }
.site-footer .who strong { color: var(--ink); font-family: var(--serif); font-size: 0.95rem; font-weight: 600; }
.site-footer .links { margin: 0; }

/* ---- buttons (DESIGN.md §4: outline pill by default, one filled pill per page) ---- */
.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 0.4rem;
  min-height: 2.5rem; padding: 0.5rem 1.05rem; border-radius: 9999px;
  border: 1px solid rgba(7, 7, 9, 0.22); background: transparent; color: var(--ink);
  font: 500 var(--t-ui)/1.2 var(--sans); text-decoration: none; cursor: pointer;
  transition: border-color 150ms ease, background-color 150ms ease, color 150ms ease, opacity 150ms ease;
}
.btn:hover { border-color: var(--ink); color: var(--ink); }
.btn:active { opacity: 0.85; }
.btn.primary { background: var(--accent); border-color: var(--accent); color: var(--paper); }
.btn.primary:hover { background: color-mix(in srgb, var(--accent) 82%, var(--paper)); border-color: color-mix(in srgb, var(--accent) 82%, var(--paper)); color: var(--paper); }
.btn-row { display: flex; flex-wrap: wrap; gap: 0.6rem; margin: var(--s-5) 0 0; }

/* ---- empty, loading, and error frames ---- */
.empty-state {
  background: var(--card); border: 1px solid var(--rule); border-radius: var(--radius);
  padding: var(--s-5) var(--s-4); font: 0.92rem/1.55 var(--sans); color: var(--muted);
  text-align: center;
}
.empty-state p { margin: 0 0 var(--s-3); }
.chart-frame {
  background: var(--card); border: 1px solid var(--rule); border-radius: var(--radius);
  min-height: 14rem; display: grid; place-content: center; gap: var(--s-3);
  padding: var(--s-5); font: 0.9rem/1.5 var(--sans); color: var(--muted); text-align: center;
}
.chart-frame p { margin: 0; }
.result-count { font: var(--t-caption)/1.6 var(--sans); color: var(--muted); margin: 0.5rem 0 0; }
```

- [ ] **Step 3: Add transitions to links, cards, and link-like buttons**

Change `a { color: var(--link); ...` (line 269) to:

```css
a { color: var(--link); text-decoration-thickness: 1px; text-underline-offset: 2.5px; transition: color 150ms ease; }
```

Change `.project-card .visual {` block to include `transition: border-color 150ms ease;` and `.project-card h3 {` to include `transition: color 150ms ease;`. Add after `.linklike:hover { color: var(--accent); }`:

```css
.linklike { transition: color 150ms ease; }
```

- [ ] **Step 4: Build and assert**

Run:
```bash
npm run build 2>&1 | tail -3 && grep -o "position:sticky" dist/_astro/*.css | head -1 && grep -c "\.btn\.primary" dist/_astro/*.css
```
Expected: `[build] Complete!`, one `position:sticky` hit, count ≥ 1.

- [ ] **Step 5: Commit**

```bash
git add src/styles/global.css
git commit -m "Add button classes, sticky header, menu rules, state transitions, and state frames

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 2: Site header — mobile menu toggle

**Files:**
- Modify: `src/components/SiteHeader.astro` (whole file)

**Interfaces:**
- Consumes: `.nav-toggle`, `.site-header[data-js]`, `.site-header.is-open` from Task 1.
- Produces: `#site-header`, `#site-nav`, toggle button with `aria-expanded`.

- [ ] **Step 1: Replace the file**

```astro
---
const { current = '' } = Astro.props;
const nav = [
  ['/projects/', 'Projects', 'projects'],
  ['/publications/', 'Publications', 'publications'],
  ['/visualizations/', 'Visualizations', 'visualizations'],
  ['/cv/', 'CV', 'cv'],
  ['/contact/', 'Contact', 'contact'],
];
---
<header class="site-header" id="site-header">
  <div class="inner">
    <a class="brand" href="/">Mohd Bilal</a>
    <button class="btn nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav">Menu</button>
    <nav class="site-nav" id="site-nav" aria-label="Main">
      {nav.map(([href, label, key]) => (
        <a href={href} aria-current={key === current ? 'page' : undefined}>{label}</a>
      ))}
    </nav>
  </div>
</header>

<script>
  const header = document.getElementById('site-header');
  const toggle = header?.querySelector<HTMLButtonElement>('.nav-toggle');
  const nav = document.getElementById('site-nav');
  if (header && toggle && nav) {
    header.dataset.js = '';
    const isOpen = () => header.classList.contains('is-open');
    const setOpen = (open: boolean) => {
      header.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.textContent = open ? 'Close' : 'Menu';
    };
    toggle.addEventListener('click', () => setOpen(!isOpen()));
    nav.addEventListener('click', (e) => {
      if ((e.target as HTMLElement).closest('a')) setOpen(false);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen()) { setOpen(false); toggle.focus(); }
    });
    document.addEventListener('click', (e) => {
      if (isOpen() && !header.contains(e.target as Node)) setOpen(false);
    });
  }
</script>
```

- [ ] **Step 2: Build and assert**

Run:
```bash
npm run build 2>&1 | tail -1 && grep -c 'aria-controls="site-nav"' dist/index.html dist/cv/index.html
```
Expected: `Complete!`, and `1` for each file.

- [ ] **Step 3: Browser check**

With the `academic-site` preview running, set viewport to mobile (375px), load `/`. Expected: one "Menu" button visible, no nav links visible. Click Menu: five links stacked, button reads "Close", `aria-expanded="true"`. Press Escape: links hidden, focus on the button. Set viewport back to desktop: links inline, no button.

- [ ] **Step 4: Commit**

```bash
git add src/components/SiteHeader.astro
git commit -m "Collapse the nav behind a Menu toggle below 768px

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 3: Footer classes and home action row

**Files:**
- Modify: `src/components/SiteFooter.astro` (lines 6–16)
- Modify: `src/pages/index.astro` (page-head block lines 18–27, and the Recent list lines 97–103)

**Interfaces:**
- Consumes: `.btn`, `.btn.primary`, `.btn-row`, `.site-footer .who`, `.site-footer .links` from Task 1.

- [ ] **Step 1: Footer**

Replace the two `<p style=...>` paragraphs in `SiteFooter.astro` with:

```astro
    <p class="who">
      <strong>Mohd Bilal</strong>
      · Division of Global Korean Studies, The Academy of Korean Studies, Seongnam, Republic of Korea
    </p>
    <nav aria-label="Footer">
      <a href="/projects/">Projects</a>
      <a href="/publications/">Publications</a>
      <a href="/visualizations/">Visualizations</a>
      <a href="/cv/">CV</a>
      <a href="/contact/">Contact</a>
    </nav>
    <p class="links">
      <a href="mailto:mohdbilalkhan2017@gmail.com">mohdbilalkhan2017@gmail.com</a>
      · <a href="https://github.com/mohdbilalDH">GitHub</a>
      · <a href="https://orcid.org/0009-0007-8367-4690">ORCID</a>
      · © {year} Mohd Bilal. Data CC-BY-4.0 and code MIT where projects state so.
    </p>
```

- [ ] **Step 2: Home action row**

In `src/pages/index.astro`, directly after the closing `</p>` of the `.lede` paragraph (inside `.page-head`), insert:

```astro
      <p class="btn-row no-print">
        <a class="btn primary" href="/projects/">View projects</a>
        <a class="btn" href="/files/mohd-bilal-cv.pdf" download>Download CV (PDF)</a>
      </p>
```

- [ ] **Step 3: Home Recent list — forthcoming article first**

In the `<ul class="pub-list">` under `<h2>Recent</h2>`, insert as the first `<li>`:

```astro
      <li>
        <span class="pub-title">“Relic, Axis, and Adaptation: Selective Symbolic Preservation from the Indian Stūpa to the East Asian Pagoda.”</span>
        <span class="pub-venue"><em>남아시아연구</em> (Journal of South Asian Studies) 32, no. 2 (2026).</span>
        <p class="pub-meta">Journal article · forthcoming</p>
      </li>
```

Change `const recent = presentations.slice(0, 3);` to `const recent = presentations.slice(0, 2);` so the list stays four items long.

- [ ] **Step 4: Build and assert**

Run:
```bash
npm run build 2>&1 | tail -1 && grep -c 'class="btn primary"' dist/index.html && grep -c "Relic, Axis, and Adaptation" dist/index.html && grep -c 'class="who"' dist/contact/index.html
```
Expected: `Complete!`, `1`, `1`, `1`.

- [ ] **Step 5: Commit**

```bash
git add src/components/SiteFooter.astro src/pages/index.astro
git commit -m "Home: add project and CV actions, list the forthcoming article; footer classes

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 4: Publications and CV — forthcoming article, CV button

**Files:**
- Modify: `src/pages/publications.astro` (after the Journal articles list, line 40)
- Modify: `src/pages/cv.astro` (download link lines 72–77; Publications section lines 160–176)

- [ ] **Step 1: Publications page**

After the closing `</ul>` of the "Journal articles" list and before `<h2>Under review</h2>`, insert:

```astro
    <h2>Forthcoming</h2>
    <ul class="pub-list">
      <li>
        <span class="pub-title">“Relic, Axis, and Adaptation: Selective Symbolic Preservation from the Indian Stūpa to the East Asian Pagoda.”</span>
        <span class="pub-venue"><em>남아시아연구</em> (Journal of South Asian Studies) 32, no. 2 (2026).</span>
        <p class="pub-meta">Accepted · in proofs</p>
      </li>
    </ul>
```

- [ ] **Step 2: CV download button**

Replace the `<p class="no-print" style="margin-top: var(--s-4);"> ... </p>` block containing the download link with:

```astro
      <p class="btn-row no-print">
        <a class="btn primary" href="/files/mohd-bilal-cv.pdf" download>Download PDF</a>
      </p>
```

- [ ] **Step 3: CV publications entry**

In the `<h2>Publications</h2>` section, insert before the 2024 `.cv-item`:

```astro
      <div class="cv-item">
        <div class="cv-when">Forthcoming</div>
        <div class="cv-what">
          <div class="role">“Relic, Axis, and Adaptation: Selective Symbolic Preservation from the Indian Stūpa to the East Asian Pagoda.”</div>
          <div class="org"><em>남아시아연구</em> (Journal of South Asian Studies) 32, no. 2 (2026). Accepted, in proofs.</div>
        </div>
      </div>
```

- [ ] **Step 4: Build and assert**

Run:
```bash
npm run build 2>&1 | tail -1 && grep -c "Relic, Axis, and Adaptation" dist/publications/index.html dist/cv/index.html && grep -c 'class="btn primary"' dist/cv/index.html
```
Expected: `Complete!`, `1` per file, `1`.

- [ ] **Step 5: Commit**

```bash
git add src/pages/publications.astro src/pages/cv.astro
git commit -m "List the forthcoming stūpa article; CV download as a button

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 5: Official name in citation metadata

**Files:**
- Modify: `src/layouts/Project.astro:27`
- Modify: `src/pages/projects/buddhist-bridges/index.astro:16` and `:190`

- [ ] **Step 1: Edit the three strings**

- `Project.astro`: `content="Khan, Mohd Bilal"` → `content="Bilal, Mohd"`.
- `buddhist-bridges/index.astro` line 16: `name: 'Mohd Bilal Khan'` → `name: 'Mohd Bilal'`.
- `buddhist-bridges/index.astro` line 190: `Khan, Mohd Bilal (2026).` → `Bilal, Mohd (2026).`

- [ ] **Step 2: Build and assert**

Run:
```bash
npm run build 2>&1 | tail -1 && grep -rl "Khan" dist --include=index.html | grep -v "/janghan/" ; echo "exit=$?"
```
Expected: `Complete!`, no file paths printed, `exit=1` (grep found nothing).

- [ ] **Step 3: Commit**

```bash
git add src/layouts/Project.astro src/pages/projects/buddhist-bridges/index.astro
git commit -m "Use the official name in Buddhist Bridges citation metadata

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 6: Explore page — register count, empty state, timeline loading and error

**Files:**
- Modify: `src/pages/projects/buddhist-bridges/explore.astro` (style block lines 20–38; markup lines 72–99; script lines 108–145; `render()` line 220)

**Interfaces:**
- Consumes: `.btn`, `.empty-state`, `.chart-frame`, `.result-count` from Task 1.

- [ ] **Step 1: Style block**

Replace these rules inside the page `<style>`:

```css
    .preset {
      font: 500 0.8rem/1.2 var(--sans); min-height: 2.5rem; padding: 0.4rem 0.9rem;
      border: 1px solid rgba(7, 7, 9, 0.22); border-radius: 9999px; background: transparent;
      color: var(--ink); cursor: pointer;
      transition: border-color 150ms ease, background-color 150ms ease, color 150ms ease;
    }
    .preset:hover { border-color: var(--ink); }
    .preset[aria-pressed="true"] { background: var(--accent); color: var(--paper); border-color: var(--accent); }
    .zoombar button { font: 0.76rem var(--sans); min-height: 2rem; border: none; background: none; color: var(--link); cursor: pointer; padding: 0; text-decoration: underline; text-underline-offset: 2px; transition: color 150ms ease; }
    #tl-tip { position: absolute; pointer-events: none; display: none; z-index: 20; background: var(--card); border: 1px solid var(--rule); border-radius: var(--radius); padding: 0.55rem 0.7rem; max-width: 330px; font: 0.78rem/1.5 var(--sans); }
    .reg-search { font: 0.9rem var(--sans); min-height: 2.5rem; padding: 0.45rem 0.7rem; border: 1px solid var(--rule); border-radius: var(--radius); background: var(--paper); color: var(--ink); width: min(320px, 100%); transition: border-color 150ms ease; }
    .reg-search:hover { border-color: var(--ink); }
    .reg-row { cursor: pointer; }
    .reg-row td { transition: background-color 150ms ease; }
    .reg-row:hover td, .reg-row:focus-visible td { background: var(--card); }
    @media (max-width: 767px) { .reg-row td { padding-top: 0.75rem; padding-bottom: 0.75rem; } }
```

(The old `#tl-tip` rule had a `box-shadow`; it is gone because DESIGN.md forbids shadows.)

- [ ] **Step 2: Markup**

Replace `<div id="tl-chart" data-base={base}><div id="tl-tip" role="status"></div></div>` with:

```astro
    <div id="tl-chart" data-base={base}>
      <div id="tl-status" class="chart-frame" role="status"><p>Loading the timeline…</p></div>
      <div id="tl-tip" role="status"></div>
    </div>
```

After the `<input class="reg-search" ... />` line add:

```astro
    <p class="result-count" id="reg-count" aria-live="polite"></p>
```

Inside `<tbody>`, after the `{people.people.map(...)}` block, add:

```astro
          <tr id="reg-empty" hidden>
            <td colspan="6">
              <div class="empty-state">
                <p id="reg-empty-msg"></p>
                <button type="button" class="btn" id="reg-clear">Clear search</button>
              </div>
            </td>
          </tr>
```

- [ ] **Step 3: Register script**

Replace the `document.getElementById('reg-search').addEventListener('input', ...)` block with:

```js
    const regInput = document.getElementById('reg-search');
    const regRows = [...document.querySelectorAll('.reg-row')];
    const regCount = document.getElementById('reg-count');
    const regEmpty = document.getElementById('reg-empty');
    const regEmptyMsg = document.getElementById('reg-empty-msg');
    function filterRegister() {
      const raw = regInput.value.trim();
      const q = raw.toLowerCase();
      let shown = 0;
      regRows.forEach((r) => {
        const hit = !q || r.dataset.search.includes(q);
        r.hidden = !hit;
        if (hit) shown++;
      });
      regCount.textContent = q
        ? `${shown} of ${regRows.length} mediators match “${raw}”`
        : `${regRows.length} of ${regRows.length} mediators`;
      regEmpty.hidden = shown > 0;
      if (shown === 0) {
        regEmptyMsg.textContent = `No mediators match “${raw}”. Try a name, an era code (B1–B5), or a mediation type such as pilgrim or student.`;
      }
    }
    regInput.addEventListener('input', filterRegister);
    document.getElementById('reg-clear').addEventListener('click', () => {
      regInput.value = '';
      filterRegister();
      regInput.focus();
    });
    filterRegister();
```

- [ ] **Step 4: Timeline load with status, retry, and one-time lane listener**

Replace the `fetch(...)` block and `buildAdvancedLanes` function with:

```js
    const STATUS = document.getElementById('tl-status');
    function loadTimeline() {
      STATUS.hidden = false;
      STATUS.innerHTML = '<p>Loading the timeline…</p>';
      fetch(`${BASE}/data/timeline.json`)
        .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
        .then((d) => {
          data = d;
          STATUS.hidden = true;
          buildAdvancedLanes();
          render();
        })
        .catch(() => {
          STATUS.hidden = false;
          STATUS.innerHTML = '<p>The timeline could not be loaded.</p><button type="button" class="btn" id="tl-retry">Try again</button>';
          document.getElementById('tl-retry').addEventListener('click', loadTimeline);
        });
    }
    loadTimeline();

    function buildAdvancedLanes() {
      const box = document.getElementById('adv-lanes');
      box.innerHTML = Object.entries(LANE_LABELS).map(([k, v]) =>
        `<label><input type="checkbox" data-lane="${k}" ${state.lanes.has(k) ? 'checked' : ''}> ${v}</label>`).join('');
    }
    document.getElementById('adv-lanes').addEventListener('change', (e) => {
      const lane = e.target.dataset.lane;
      if (!lane) return;
      e.target.checked ? state.lanes.add(lane) : state.lanes.delete(lane);
      clearPresetPressed(); render();
    });
```

(The old code re-attached the change listener on every preset click; it is now attached once.)

At the top of `function render() {` add as the first line:

```js
      if (!data) return;
```

- [ ] **Step 5: Build and assert**

Run:
```bash
npm run build 2>&1 | tail -1 && grep -c 'id="reg-empty"' dist/projects/buddhist-bridges/explore/index.html && grep -c "box-shadow" dist/projects/buddhist-bridges/explore/index.html
```
Expected: `Complete!`, `1`, `0`.

- [ ] **Step 6: Browser check**

Load `/projects/buddhist-bridges/explore/`. Expected: count reads "43 of 43 mediators"; `document.getElementById('tl-status').hidden` is `true` and an `svg` exists inside `#tl-chart`. Type `hye`: count reads "N of 43 mediators match “hye”" with N ≥ 1. Type `zzzz`: the empty row shows the message and a "Clear search" button; clicking it restores all rows and focuses the input.

Error branch: the dev server has no request blocking, so exercise it by temporarily renaming the data file, reloading, and restoring it:

```bash
mv public/data/timeline.json public/data/timeline.json.bak
```
Reload the page. Expected: the frame reads "The timeline could not be loaded." with a "Try again" button; the register still filters. Then:
```bash
mv public/data/timeline.json.bak public/data/timeline.json
```
Click "Try again". Expected: the SVG renders and the frame hides.

- [ ] **Step 7: Commit**

```bash
git add src/pages/projects/buddhist-bridges/explore.astro
git commit -m "Explore: result count, empty state, timeline loading and error states

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 7: Person dialog — close button and focus return

**Files:**
- Modify: `src/components/PersonCard.astro` (style lines 19–36; script lines 39–81)

**Interfaces:**
- Consumes: `.btn` from Task 1.
- Keeps: `window.__bbShowPerson(id)` signature unchanged (called from explore, project page, timeline marks).

- [ ] **Step 1: Style**

Change `#bb-person { border: 1px solid var(--rule); border-radius: 10px; ...` to `border-radius: var(--radius);`. Replace the `#bb-person .close { ... }` rule with:

```css
  #bb-person .close { float: right; margin: 0 0 0.6rem 0.8rem; }
```

- [ ] **Step 2: Script**

Replace `<button class="close" aria-label="Close">✕ close</button>` with `<button class="btn close" type="button">Close</button>`.

After `const escapeHtml = ...` line add:

```js
  let opener = null;
```

Inside `window.__bbShowPerson`, directly after `if (!p) return;` add:

```js
    opener = document.activeElement;
```

After the existing backdrop-click listener add:

```js
  document.getElementById('bb-person').addEventListener('close', () => {
    if (opener && typeof opener.focus === 'function' && document.contains(opener)) opener.focus();
    opener = null;
  });
```

- [ ] **Step 3: Build and browser check**

Run `npm run build 2>&1 | tail -1` → `Complete!`. Load `/projects/buddhist-bridges/`, Tab to "Open his record", Enter. Expected: dialog opens with a pill "Close" button top right. Press Escape. Expected: focus is back on "Open his record" (`document.activeElement.textContent` → `Open his record`).

- [ ] **Step 4: Commit**

```bash
git add src/components/PersonCard.astro
git commit -m "Person dialog: pill close button, return focus to the opener

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 8: Cleanup and DESIGN.md decision log

**Files:**
- Delete: `_includes/`, `images/`, all `.DS_Store`
- Modify: `../DESIGN.md` (append rows after row 41)

- [ ] **Step 1: Remove empty folders and Finder files**

```bash
rm -rf _includes images && find . -name .DS_Store -not -path "./node_modules/*" -delete && ls
```
Expected listing has no `_includes` or `images`.

- [ ] **Step 2: Append decision rows to `../DESIGN.md`**

Insert before the line `*(Add new rows below as decisions are made during the build.)*`:

```markdown
| 43 | 2026-09-13 | Header is sticky; below 768px the nav collapses behind a "Menu" pill toggle (Escape, outside click, and link activation close it; focus returns to the toggle on Escape; without JS the nav stays visible). | DESIGN.md §4 already specified sticky + hamburger; the shipped header wrapped five links onto two lines on phones. |
| 44 | 2026-09-13 | `.btn` (outline pill) and `.btn.primary` (filled pill) added to `global.css`, one filled pill per page. Used for the home actions, CV download, menu toggle, register "Clear search", timeline "Try again", dialog "Close", and explore presets. | §4 named the two button forms but no class existed; each page had improvised inline styles. |
| 45 | 2026-09-13 | Home gains an action row under the lede: "View projects" (filled) and "Download CV (PDF)" (outline). Structure otherwise unchanged. | CONTEXT.md §5 names these two visitor goals; the page offered neither as an action. |
| 46 | 2026-09-13 | Hover, focus-visible, and active states with 150ms colour/border/opacity transitions on links, nav, cards, buttons, and register rows. `prefers-reduced-motion` still disables all of them. | Feedback on interactive elements was inconsistent; motion stays minimal per §4 Don'ts. |
| 47 | 2026-09-13 | Mediator register shows a live result count and an empty state ("No mediators match …") with a Clear search button. Rows use `hidden` instead of inline display. | A non-matching query left a blank table with no explanation. |
| 48 | 2026-09-13 | Timeline shows a loading frame while `timeline.json` loads and an error frame with "Try again" if the fetch fails; presets are ignored until data arrives; the lane-checkbox listener is attached once. Tooltip shadow removed. | The fetch had no error path and a preset click before load threw; the shadow contradicted §3 "no shadows". |
| 49 | 2026-09-13 | Person dialog: pill "Close" button, 8px radius, focus returns to the opening element on close. | Keyboard users lost their place after closing a record. |
| 50 | 2026-09-13 | Citation metadata, dataset JSON-LD, and the citation block use "Bilal, Mohd" / "Mohd Bilal". | Row 19 (official name) had not been applied to the Buddhist Bridges citation strings. |
| 51 | 2026-09-13 | "Relic, Axis, and Adaptation: Selective Symbolic Preservation from the Indian Stūpa to the East Asian Pagoda", 남아시아연구 32(2), 2026, listed as forthcoming on Publications, CV, and the home Recent list. No pages or DOI until published. | Owner confirmed the article is in first proofs; row 21's "Publications waits" no longer applies since the page already lists the 2024 article. |
| 52 | 2026-09-13 | Empty `_includes/` and `images/` removed; footer and CV inline styles moved to classes. | Housekeeping; nothing referenced them. |
```

- [ ] **Step 3: Commit** (DESIGN.md lives in the parent folder, outside this git repo, so only the deletions are committed here)

```bash
git add -A && git commit -m "Remove empty asset folders

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```

---

### Task 9: Regenerate the CV PDF and run the full verification

**Files:**
- Regenerate: `public/files/mohd-bilal-cv.pdf`

- [ ] **Step 1: Regenerate**

```bash
npm run build 2>&1 | tail -1 && npm run cv:pdf 2>&1 | tail -3 && npm run build 2>&1 | tail -1 && ls -la public/files/
```
Expected: two `Complete!` lines, a fresh timestamp on the PDF. If Chrome is not found, report it and leave the old PDF in place.

- [ ] **Step 2: Confirm the PDF carries the new entry**

```bash
python3 -c "import subprocess,sys; print(subprocess.run(['strings','public/files/mohd-bilal-cv.pdf'],capture_output=True,text=True).stdout.count('Relic'))" 
```
If `strings` cannot see text (PDF text is usually compressed), open `http://localhost:<port>/files/mohd-bilal-cv.pdf` in the browser and confirm "Forthcoming" appears in Publications.

- [ ] **Step 3: Full browser pass**

For each of `/`, `/projects/`, `/projects/buddhist-bridges/explore/`, `/cv/`, `/publications/`, `/contact/`, `/404` at 375, 768, 1024, and 1440px: no horizontal page scroll (`document.documentElement.scrollWidth <= window.innerWidth`), console has no errors, header stays at top on scroll.

- [ ] **Step 4: Final grep assertions**

```bash
npm run build 2>&1 | tail -1 && grep -rl "Khan" dist --include=index.html | grep -v /janghan/ ; grep -rc "box-shadow" dist/_astro/*.css
```
Expected: `Complete!`, no Khan paths, box-shadow count `0`.

- [ ] **Step 5: Commit**

```bash
git add public/files/mohd-bilal-cv.pdf && git commit -m "Regenerate the CV PDF with the forthcoming article

Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>"
```
