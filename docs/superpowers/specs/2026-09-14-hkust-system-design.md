# HKUST-pattern rebuild — design spec

Date: 2026-09-14
Site: mohdbilaldh.github.io (Astro 5, static, GitHub Pages)
Status: approved in chat on 2026-09-14. Supersedes the Register system
(`docs/superpowers/specs/2026-09-13-register-rebuild-design.md`) for the design layer.

## 1. Goal

Rebuild the site's design layer so its structure, layout, type, spacing, navigation,
project-list presentation, and interaction patterns closely reproduce
https://digitalhumanities.hkust.edu.hk (measured on 2026-09-14), while every word,
image, mark, dataset, and function stays the owner's. The reference's logo, photographs,
and text are not copied. Content, data, and the explore instrument from the Register
build are kept; only presentation changes, plus a new About page and a re-organised home.

## 2. Reference measurements (source of truth for the system)

| Element | Measured value |
|---|---|
| Top strip | 25px navy band above the header (the site's 8px strip plus admin offset; we use 8px) |
| Header | 124px tall, white, not sticky; logo lockup left (image 143×45 + divider + letterspaced two-line mark, total 415px wide); nav right |
| Nav | Open Sans 15px, weight 400, uppercase, navy `#003366`, line-height 124px, padding 0 15px; active and hover `#ffb100`; collapses to logo + hamburger below 1024px; header 73px on phones |
| Container | max 1359px, 20px side padding; content columns inset a further 20px |
| Ground | `#f8f7f3`; alternating white `#ffffff` bands on the home |
| Body | Muli (now Mulish) 15px / 22.5px, `#30383b` |
| Intro paragraphs | Open Sans 16px / 30px, `#30383b`, max ~1060px |
| Page title | Playfair Display 55px / 82.5px weight 600 `#54595f`; 45px on ≤768px; band padding-top 100px |
| Section heading | Playfair Display 32px / 45px weight 700 `#4b4f58`; 25px at 768, 20px at 375; 55px space above |
| Card | 367×650 at 1440 (three per row, 3px gaps ≈ 20px), 24px radius, background image with a coloured overlay, padding 230px 30px 30px (190px 20px 20px on phones, cards ~400px tall); content bottom-aligned |
| Card year label | Mulish 15px / 22.5px weight 500 white |
| Card title | Playfair Display 32px / 44.8px weight 700 white, the whole title is the link; 25px at 768, 20px at 375 |
| Card button | "View project": Mulish 14px weight 500, letter-spacing 0.5px, black on `#f9c349`, padding 16px 30px, radius 56px |
| Two-card rows | each card half the container |
| Card motion | fade-up on scroll (opacity + translateY 30px, 600ms ease-out) |
| Home hero | two columns: title 55px/66px, paragraph, yellow pill "More details »"; image right with a caption below in 13px muted |
| Home bands | off-white hero → white "What's New" → off-white "Explore our Projects" (cards + "View all projects »") → white "Events and Workshops" (tile grid + "View all events »") → footer |
| Footer | contact sentence with blue links (`#2a6ebb`), hairline, italic note 13px, copyright row 13px, then navy bar 80px with mark left and circular outlined social icons right |

## 3. Tokens (`src/styles/tokens.css`)

`--ground #f8f7f3`, `--white #ffffff`, `--navy #003366`, `--navy-deep #0a2a4d`, `--yellow #ffb100`,
`--button #f9c349`, `--button-hover #f0b62e`, `--text #30383b`, `--title #54595f`,
`--heading #4b4f58`, `--muted #6b7075`, `--hairline #e3e1db`, `--link #2a6ebb`,
`--card-overlay-1 rgba(179,87,67,.78)`, `--card-overlay-2 rgba(48,40,34,.78)`,
`--card-overlay-3 rgba(0,51,102,.78)`, `--card-overlay-4 rgba(160,151,141,.85)`,
`--negative`, `--grade-*`, `--b1…--b6`, `--void` unchanged.
Fonts: `--f-title: 'Playfair Display Variable', 'Noto Serif KR', serif`;
`--f-body: 'Mulish Variable', 'Noto Sans KR', sans-serif`; `--f-ui: 'Open Sans Variable',
'Noto Sans KR', sans-serif`; `--f-mono: 'IBM Plex Mono'` (kept for register metadata and
figure numbers only). Container `--w-page 1359px`, `--pad 20px`. Radius `--r-card 24px`,
`--r-pill 56px`. Motion `--ease 200ms ease-out`; fade-up `600ms`.

## 4. Pages

| Route | Structure |
|---|---|
| `/` | hero band (name, lede, "More details »" → /about/, 長恨 cover with caption right); white "What's New" band (three text tiles: forthcoming article, latest presentation, latest dataset freeze, each a rounded card with date, title, link); off-white "Explore my Projects" band (three image cards, "View all projects »"); white "Talks and Presentations" band (grid of presentation tiles: year, title, venue; "View all »" → /publications/); footer |
| `/about/` | new: page title "About", the three bio paragraphs in Open Sans 16/30, affiliation factsheet, "Download CV" pill |
| `/projects/` | title "Explore My Projects", intro line, three sections with headings (Digital editions; Prosopography and networks; Press corpora), each a card row; cards carry year label ("1927 · Issue 1 frozen", "300–2026 · Dataset V3.0", "2000–2026 · Pilot complete"), title, "View project" |
| project pages, `/explore/` | title band, intro, content in the 1060px measure, figures in rounded white panels; explore instrument unchanged functionally |
| `/publications/`, `/visualizations/`, `/cv/`, `/contact/`, `/404` | title band + content, same components |

## 5. Components

SiteHeader (navy strip, lockup, uppercase nav, hamburger), SiteFooter (three rows + navy bar),
Button (pill; `primary` yellow, `ghost` navy outline), PageTitle band, SectionHeading,
ProjectCard (image, overlay colour, label, title link, button; fade-up), CardRow (3-up / 2-up
grid), Tile (white rounded tile for What's New and Talks), Factsheet, PubList, FigureFrame
(white rounded panel), ChartFrame, EmptyState, DataTable, PersonDialog, figures/* (unchanged
geometry, re-tokenised chrome).

## 6. Card art

`scripts/make-card-art.mjs` renders `public/art/{janghan,buddhist-bridges,hallyu}.jpg`
(1100×1400) with headless Chrome: 長恨 from `public/janghan/assets/jh01-cover.png`; Buddhist
Bridges from the CohortStrip SVG on the ground colour; Hallyu from the HallyuGrowthChart
SVG. Overlay colours per card follow the reference (terracotta, umber, navy). OG image and
CV PDF regenerated in the new system.

## 7. States, responsive, accessibility, testing

All existing states stay (menu, register search/sort/empty, timeline loading/error/retry,
dialog focus). Cards: hover lifts the overlay 6% lighter and underlines the title; focus ring
yellow on navy, navy on yellow. Fade-up disabled under `prefers-reduced-motion`.
Breakpoints: 1024 (nav collapse), 768 (title 45px, headings 25px), 640 (cards single column,
padding 190/20). Playwright suite extended: `test_cards.py` (three columns at 1440 and 768,
one at 375; year label, title link, button present; fade-up class resolves), About route in
`ROUTES`. Zero console errors, no horizontal overflow, 44px targets. Guideline review pass.

## 8. Out of scope

`public/janghan/` edition styles, dark mode, blog, headshot, prose rewrites, copying any
reference asset or copy.
