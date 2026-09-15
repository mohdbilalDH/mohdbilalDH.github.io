// Post-processes the generated 長恨 edition in public/janghan/ with the things the corpus
// builder does not do: the five-item navigation, a per-record citation on every item,
// contributor and place page, the related-views line on Contents, and a sitemap so that the
// edition's 170-odd pages are findable. Idempotent: safe to re-run after a corpus rebuild.
//
//   npm run edition
//
// The corpus builder (../장한/scripts/build_site.py) remains the only writer of the content.
// This script never touches data, only chrome and apparatus.

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync, rmSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = 'public/janghan';
const SITE = 'https://mohdbilaldh.github.io';

const NAV = [
  ['index.html', 'The Magazine'],
  ['contents.html', 'Contents'],
  ['contributors.html', 'Contributors'],
  ['places.html', 'Places'],
  ['methods.html', 'Method &amp; Data'],
];

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (name.endsWith('.html')) out.push(p);
  }
  return out;
}

// The Language page was retired on 2026-09-15: its voice measures proved unstable across the
// two issues, and a table published under a warning not to interpret it invites exactly the
// reading the evidence does not support. The measures stay in the dataset.
for (const stale of [join(ROOT, 'voices.html')]) {
  if (existsSync(stale)) { rmSync(stale); console.log('removed', stale); }
}

const files = walk(ROOT);
let navCount = 0, citeCount = 0;

for (const file of files) {
  let html = readFileSync(file, 'utf8');
  const before = html;
  const depth = relative(ROOT, file).split('/').length - 1;
  const up = depth ? '../'.repeat(depth) : './';

  // ---- five-item navigation ----
  const nav = NAV.map(([href, label]) => `<a href="${up}${href}">${label}</a>`).join('');
  html = html.replace(
    /(<nav class="site" id="sitenav" aria-label="Main">)[\s\S]*?(<\/nav>)/,
    (_m, open, close) => { navCount++; return `${open}${nav}${close}`; },
  );

  // ---- no link may point at the retired page ----
  html = html.replace(/href="((?:\.\.\/)*|\.\/)voices\.html"/g, (_m, u) => `href="${u}contents.html"`);
  html = html.replace(/>Voices</g, '>Contents<');

  // ---- related views, now that they are no longer in the navigation ----
  if (file.endsWith('contents.html') && !html.includes('class="relviews"')) {
    html = html.replace(
      /(<h1[^>]*>[\s\S]*?<\/h1>)/,
      `$1\n<p class="relviews">Related views: <a href="./witnesses.html">Witnesses and rights</a>` +
      `<a href="./architecture.html">Editorial architecture</a>` +
      `<a href="./issue/jh01.html">Browse 창간호</a><a href="./issue/jh02.html">Browse 2월호</a></p>`,
    );
  }

  // ---- a citation on every record page ----
  const isRecord = /\/(item|contributor|place)\//.test(file);
  if (isRecord && !html.includes('class="recordcite"')) {
    const title = (html.match(/<title>([\s\S]*?) · 長恨 Digital Edition<\/title>/) || [])[1] || 'Record';
    const kind = file.includes('/item/') ? 'item' : file.includes('/contributor/') ? 'contributor' : 'place';
    const id = file.split('/').pop().replace(/\.html$/, '');
    const url = `${SITE}/janghan/${kind}/${encodeURIComponent(id)}.html`;
    const cite =
      `<div class="recordcite"><b>Cite this ${kind}</b>` +
      `Bilal, Mohd. “${title}.” 長恨 (Changhan, 1927): A Reconstruction of the Contents and a Register of ` +
      `the Attributions, Issue 1 corpus v3.3, ${kind} ${id}. ${url} ` +
      `(accessed <span class="accessed">${new Date().toISOString().slice(0, 10)}</span>).</div>`;
    html = html.replace('</div></div></div></main>', `${cite}</div></div></div></main>`);
    citeCount++;
  }

  // ---- the accessed date belongs to the reader's visit, not to the build ----
  if (html.includes('class="accessed"') && !html.includes('__accessed')) {
    html = html.replace('</body>',
      `<script>/*__accessed*/document.querySelectorAll(".accessed").forEach(function(e){` +
      `e.textContent=new Intl.DateTimeFormat("en-GB",{day:"numeric",month:"long",year:"numeric"}).format(new Date())});</script></body>`);
  }

  if (html !== before) writeFileSync(file, html);
}

// ---- sitemap: 170-odd pages that were invisible to search until now ----
const urls = walk(ROOT)
  .map((f) => `${SITE}/janghan/${relative(ROOT, f).split('/').map(encodeURIComponent).join('/')}`)
  .sort();
const today = new Date().toISOString().slice(0, 10);
writeFileSync(
  join(ROOT, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls.map((u) => `  <url><loc>${u}</loc><lastmod>${today}</lastmod></url>`).join('\n') +
  `\n</urlset>\n`,
);

console.log(`edition: ${files.length} pages · ${navCount} navs normalised · ${citeCount} citations added · ${urls.length} urls in sitemap`);
