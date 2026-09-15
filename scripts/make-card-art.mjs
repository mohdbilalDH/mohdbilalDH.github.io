// Render the three project-card backgrounds (public/art/<slug>.png, 1100×1400) from the
// site's own material with headless Chrome: the 1927 長恨 cover, the Buddhist Bridges cohort
// strip, and the Hallyu growth chart. Run after `npm run build`: `npm run art`.
import { execFile } from 'node:child_process';
import { createServer } from 'node:http';
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { resolve, join, extname } from 'node:path';

const chrome = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium-browser',
].find(existsSync);
if (!chrome) throw new Error('Chrome not found');

const tokens = readFileSync('src/styles/tokens.css', 'utf8');
const svgFrom = (file, labelStart) => {
  const html = readFileSync(file, 'utf8');
  const re = /<svg[^>]*aria-label="([^"]*)"[\s\S]*?<\/svg>/g;
  let m;
  while ((m = re.exec(html))) if (m[1].startsWith(labelStart)) return m[0];
  throw new Error(`no svg starting with "${labelStart}" in ${file}`);
};
const pages = {
  janghan: `<img src="/public/janghan/assets/jh01-cover.png" style="width:100%;height:100%;object-fit:cover;display:block">`,
  'buddhist-bridges': `<div class="chart">${svgFrom('dist/visualizations/index.html', 'Timeline of India–Korea')}</div>`,
  hallyu: `<div class="chart">${svgFrom('dist/projects/hallyu-indian-press/index.html', 'Coverage chart, 2000 to 2026')}</div>`,
};
const shell = (body) => `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="/node_modules/@fontsource-variable/mulish/index.css">
<link rel="stylesheet" href="/node_modules/@fontsource-variable/playfair-display/index.css">
<style>${tokens} html,body{margin:0;width:1100px;height:1400px;background:var(--ground);overflow:hidden}
.chart{width:1100px;height:1400px;display:flex;align-items:center;justify-content:center;padding:60px;box-sizing:border-box}
.chart svg{width:100%;height:auto;transform:scale(1.08)} .chart svg text{font-family:var(--f-body)}</style></head><body>${body}</body></html>`;

const MIME = { '.css': 'text/css', '.woff2': 'font/woff2', '.png': 'image/png', '.html': 'text/html' };
const server = createServer((req, res) => {
  const p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const m = p.match(/^\/art\/(.+)\.html$/);
  if (m && pages[m[1]]) { res.writeHead(200, { 'content-type': 'text/html' }); return res.end(shell(pages[m[1]])); }
  try {
    const body = readFileSync(join(resolve('.'), p));
    res.writeHead(200, { 'content-type': MIME[extname(p)] ?? 'application/octet-stream' });
    res.end(body);
  } catch { res.writeHead(404).end(); }
});

mkdirSync('public/art', { recursive: true });
server.listen(0, '127.0.0.1', async () => {
  const { port } = server.address();
  for (const slug of Object.keys(pages)) {
    const out = resolve(`public/art/${slug}.png`);
    await new Promise((ok, fail) => execFile(chrome, [
      '--headless', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
      '--window-size=1100,1400', `--screenshot=${out}`, '--virtual-time-budget=4000',
      `http://127.0.0.1:${port}/art/${slug}.html`,
    ], (err) => (err ? fail(err) : ok())));
    console.log(`wrote ${out}`);
  }
  server.close();
});
