# Production polish — design spec

Date: 2026-09-13
Site: mohdbilaldh.github.io (Astro 5, static, GitHub Pages)
Status: approved in chat by the owner on 2026-09-13; implementation plan to follow.

## 1. Goal

Make the existing academic site feel like a finished product without changing its
concept, information architecture, page set, data, or the design system recorded in
`../DESIGN.md`. The owner chose the narrowest scope offered ("polish inside the
system"): every token, layout, and page structure stays; only chrome behaviour,
interaction states, responsive behaviour, stale content, and housekeeping change.

DESIGN.md remains binding: light canvas only, no shadows, no gradients on chrome,
headings at weight 400, Inter + Geist Mono + Noto Sans KR, hairline rules, 8px radius
on cards and inputs, pill radius on buttons, accent blues reserved for figures. Every
change in this spec is logged as a new dated row in the DESIGN.md decision log.

## 2. Audit findings that drive the work

The site is already real content on a real design system. Verified on 2026-09-13:
production build passes (11 pages), no console errors, mediator search and timeline
presets work, PDF download works. The gaps:

- Header is not sticky and has no mobile menu; five nav links wrap to two lines on
  phones.
- Home offers neither of the two visitor goals named in CONTEXT.md (explore projects,
  download the CV) as an action.
- Interaction states are thin: no empty state when the mediator search matches
  nothing; no loading or error state for the timeline, which fetches
  `/data/timeline.json` at runtime with no `catch`; hover/active feedback minimal.
- Citation metadata still says "Khan, Mohd Bilal" in three places, against the
  owner's official-name rule (DESIGN.md row 19).
- Publications record is behind: "Relic, Axis, and Adaptation" is in first proofs
  at 남아시아연구 32(2) and is not listed.
- Housekeeping: empty `_includes/` and `images/` folders, inline styles on the
  footer and the CV download button.

## 3. Scope

### 3.1 Chrome

**Header.** `position: sticky; top: 0` on `.site-header`, hairline bottom border,
white background, z-index above page content. Structure unchanged (brand left, nav
right).

**Mobile menu (< 768px).** The nav list is hidden behind a "Menu" toggle button.
Requirements:

- Button carries `aria-expanded` and `aria-controls`; label reads "Menu" closed and
  "Close" open.
- Open state renders the five links as a vertical list under the header, each link
  at least 44px tall.
- Closes on Escape, on outside click, and on link activation. Focus returns to the
  toggle on Escape.
- Works without JavaScript: if the script has not run, the nav is visible and the
  toggle is hidden (the script sets `data-js` on the header; CSS keys off it).
- Implemented once in `SiteHeader.astro`; no per-page scripts.

**Buttons.** Two classes added to `global.css`, per DESIGN.md §4:

- `.btn` — outline pill: transparent background, `--ink` text, 1px
  `rgba(7,7,9,0.22)` border, pill radius, padding `0.5rem 1rem`, sans `--t-ui`
  weight 500.
- `.btn.primary` — filled pill: `--accent` (#070709) background, white text. At most
  one per page (DESIGN.md row 6).
- Shared states: hover darkens border / lifts contrast, `:active` drops opacity to
  0.85, `:focus-visible` uses the existing 2px `--focus` outline. Transitions 150ms
  on color, background, border only.

**Footer.** Inline styles move to classes (`.site-footer .who`, `.site-footer .links`).
Content unchanged.

### 3.2 Home

Structure unchanged. One action row is inserted between the lede and the first bio
paragraph:

- `View projects` → `/projects/` as `.btn.primary`.
- `Download CV (PDF)` → `/files/mohd-bilal-cv.pdf` as `.btn`, with `download`
  attribute.

The home page has no other filled pill, so row 6 of DESIGN.md is respected.

### 3.3 States and feedback

**Site-wide.** Hover, focus-visible, and active states on nav links, project cards,
publication rows (static, no state), CV download, register rows, preset and
zoom buttons, dialog close button. Transitions 150ms, color/border/background only.
`prefers-reduced-motion` already disables transitions globally; keep that rule.

**Register search (explore page).**

- A live result count under the input: "43 of 43 mediators" initially,
  "3 of 43 mediators match 'hye'" while filtering, in `aria-live="polite"`.
- Empty state when zero rows match: a single table row spanning all columns, text
  "No mediators match 'zzzz'. Try a name, an era code (B1–B5), or a mediation type
  such as pilgrim or student." plus a "Clear search" button that empties the input
  and refocuses it.
- The native `type="search"` clear affordance is kept.

**Timeline (explore page and Chronology component).**

- Before data arrives, `#tl-chart` shows a `--canvas-soft` frame at the chart's
  height with the text "Loading the timeline…".
- If the fetch fails or returns non-JSON, the frame shows "The timeline could not
  be loaded." and a "Try again" button that re-runs the fetch. The register below
  remains usable.
- The Chronology component on the project and visualizations pages renders its
  SVG at build time (no runtime fetch), so it needs no loading state.

**Person dialog (`PersonCard.astro`).**

- Close button restyled as an outline pill with a visible label ("Close").
- The element that opened the dialog is remembered; focus returns to it on close.
- Escape and backdrop click already close it; keep.

**No contact form.** The site is static with no backend. Contact stays as the
factsheet with a mailto link; a form that only opened mailto would be a fake
interaction.

### 3.4 Responsive

- Breakpoints stay at 560px and 768px; the nav collapse is the only new 768 rule.
- Tap targets: mobile menu links, preset buttons, zoom buttons, and register rows
  reach 44px minimum height on touch widths.
- Project grid stays `auto-fill, minmax(19rem, 1fr)`: one column under ~640px, two
  above, inside the 44rem reading column.
- Figures keep the existing scroll-inside-figure behaviour under 700px.
- Verify at 375, 768, 1024, and 1440px.

### 3.5 Content

- `src/layouts/Project.astro`: `citation_author` → `Bilal, Mohd`.
- `src/pages/projects/buddhist-bridges/index.astro`: JSON-LD creator → `Mohd Bilal`;
  citation block → `Bilal, Mohd (2026). Five Bridges, One Silence…`.
- Add the forthcoming article to `src/pages/publications.astro` under a new
  "Forthcoming" heading placed between "Journal articles" and "Under review", to
  `src/pages/cv.astro` Publications, and to the home "Recent" list as its first
  item:

  > Mohd Bilal. "Relic, Axis, and Adaptation: Selective Symbolic Preservation from
  > the Indian Stūpa to the East Asian Pagoda." *남아시아연구* (Journal of South
  > Asian Studies) 32, no. 2 (2026). Forthcoming.

  No pages, DOI, or Google Scholar `citation_*` meta until published. The
  under-review Asian Communication Research entry is unchanged.
- Regenerate `public/files/mohd-bilal-cv.pdf` with `npm run build && npm run cv:pdf
  && npm run build` (headless Chrome; script already exists).

### 3.6 Housekeeping

- Delete the empty `_includes/` and `images/` directories and local `.DS_Store`
  files (already git-ignored).
- Keep the `/about`, `/notes`, `/projects/hallyu-press` redirect stubs; they are
  intentional (astro.config.mjs).
- Append DESIGN.md decision-log rows 43 onward: sticky header and mobile menu;
  button classes; home action row; register count and empty state; timeline
  loading/error states; dialog focus return; official-name fix in citations;
  forthcoming article; folder cleanup.

## 4. Out of scope

- The static 長恨 edition under `public/janghan/` (its own stylesheet and pages).
- Dark mode, any palette, type, radius, or spacing-scale change.
- New pages, a blog, a contact form, analytics, or third-party scripts.
- Rewriting bio or project prose.

## 5. Files touched

- `src/styles/global.css` — sticky header, mobile menu rules, `.btn` classes,
  state transitions, empty/loading frames, footer classes.
- `src/components/SiteHeader.astro` — menu toggle markup and script.
- `src/components/SiteFooter.astro` — classes instead of inline styles.
- `src/components/PersonCard.astro` — close button, focus return.
- `src/pages/index.astro` — action row, Recent list entry.
- `src/pages/cv.astro` — button class, forthcoming entry.
- `src/pages/publications.astro` — Forthcoming section.
- `src/pages/projects/buddhist-bridges/explore.astro` — result count, empty state,
  timeline loading/error.
- `src/layouts/Project.astro`, `src/pages/projects/buddhist-bridges/index.astro` —
  name fix.
- `../DESIGN.md` — decision-log rows.
- `public/files/mohd-bilal-cv.pdf` — regenerated.

## 6. Testing

1. `npm run build` passes; page count unchanged (11 plus redirect stubs).
2. Browser: home, projects, explore, CV, publications, contact, 404 at 375, 768,
   1024, 1440px; no horizontal page scroll; console clean.
3. Keyboard: Tab to the menu toggle, Enter opens, Escape closes and returns focus;
   Tab through the dialog and close it, focus returns to the opener.
4. Register: type a matching query, the count updates; type a non-matching query,
   the empty row appears; Clear search restores all 43 rows.
5. Timeline: block `/data/timeline.json` in the browser, reload, error state and
   Try again appear; unblock, Try again renders the chart.
6. Search the built `dist/` for "Khan": zero hits outside `public/janghan/`.
7. CV PDF regenerated and contains the forthcoming article.
