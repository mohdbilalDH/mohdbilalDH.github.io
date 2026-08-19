# mohdbilalDH.github.io

Academic website and Digital Humanities research portfolio of Mohd Bilal —
Korean Studies, The Academy of Korean Studies.

Built with [Astro](https://astro.build) as a fully static site. The design system
(warm-neutral palette, Source Serif 4 + IBM Plex Sans/Mono, shared uncertainty
grammar for figures) extends the one documented in the Buddhist Bridges project's
`DESIGN.md`.

## Develop

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # static build in dist/
```

## Update the PDF CV

```bash
npm run build && npm run cv:pdf && npm run build
```

The first build renders the CV page, `cv:pdf` prints it to
`public/files/mohd-bilal-cv.pdf` with headless Chrome, and the second build
copies the fresh PDF into `dist/`.

## Data

- `src/data/{core,people,story,timeline,network,sources}.json` — the Buddhist
  Bridges web-JSON tier, copied (never symlinked) from that repository's
  `outputs/web/`.
- `src/data/hallyu.json` — verified counts from the `hallyu-indian-press`
  pilot (ProQuest validation + pilot evaluation).
- `src/data/presentations.json` — conference presentations, from the CV.

Deployment: GitHub Actions builds `master` and publishes to GitHub Pages.
