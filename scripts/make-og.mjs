// Render public/og.png (1200×630) from the site's own tokens and fonts with headless Chrome.
// Serves the project root over HTTP so the fontsource files in node_modules resolve, then
// screenshots an inline page. Run: npm run og
import { execFile } from 'node:child_process';
import { createServer } from 'node:http';
import { existsSync, readFileSync } from 'node:fs';
import { resolve, join, extname } from 'node:path';

const chrome = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium-browser',
].find(existsSync);
if (!chrome) throw new Error('Chrome not found');

const tokens = readFileSync('src/styles/tokens.css', 'utf8');
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<link rel="stylesheet" href="/node_modules/@fontsource-variable/playfair-display/index.css">
<link rel="stylesheet" href="/node_modules/@fontsource-variable/mulish/index.css">
<link rel="stylesheet" href="/node_modules/@fontsource-variable/open-sans/index.css">
<style>${tokens}
html,body{margin:0;width:1200px;height:630px;background:var(--ground);color:var(--text);font-family:var(--f-body)}
.card{box-sizing:border-box;width:1200px;height:630px;padding:0 88px 64px;display:flex;flex-direction:column;justify-content:space-between;border-top:14px solid var(--navy)}
.top{display:flex;justify-content:space-between;align-items:center;padding-top:40px;font:400 16px/1.3 var(--f-ui);letter-spacing:.2em;text-transform:uppercase;color:var(--navy)}
.top .lockup{display:flex;align-items:center;gap:18px}
.top .name{font:600 26px/1 var(--f-title);letter-spacing:0;text-transform:none}
.top .rule{width:1px;height:40px;background:var(--navy);opacity:.5}
h1{font:600 96px/1.1 var(--f-title);color:var(--title);margin:0}
.lede{font:400 30px/1.4 var(--f-ui);color:var(--text);margin:20px 0 0;max-width:900px}
.bottom{display:flex;justify-content:space-between;align-items:center;font:500 16px/1 var(--f-body);letter-spacing:.06em;text-transform:uppercase;color:var(--muted)}
.pill{background:var(--button);color:var(--on-button);border-radius:56px;padding:16px 30px;font:500 16px/1 var(--f-body);letter-spacing:.5px;text-transform:none}
</style></head><body><div class="card">
<div class="top"><span class="lockup"><span class="name">Mohd Bilal</span><span class="rule"></span><span>Korean Studies · Digital Humanities</span></span><span>mohdbilaldh.github.io</span></div>
<div><h1>Explore my Projects</h1><p class="lede">Digital editions, prosopography, and press corpora on modern Korea and its afterlives — built on documented sources and reproducible pipelines.</p></div>
<div class="bottom"><span>The Academy of Korean Studies, Seongnam</span><span class="pill">View project</span></div>
</div></body></html>`;

const MIME = { '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff', '.html': 'text/html' };
const server = createServer((req, res) => {
  const p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p === '/og.html') { res.writeHead(200, { 'content-type': 'text/html' }); return res.end(html); }
  try {
    const body = readFileSync(join(resolve('.'), p));
    res.writeHead(200, { 'content-type': MIME[extname(p)] ?? 'application/octet-stream' });
    res.end(body);
  } catch { res.writeHead(404).end(); }
});

server.listen(0, '127.0.0.1', () => {
  const { port } = server.address();
  const out = resolve('public/og.png');
  execFile(chrome, [
    '--headless', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
    '--window-size=1200,630', `--screenshot=${out}`, '--virtual-time-budget=4000',
    `http://127.0.0.1:${port}/og.html`,
  ], (err) => {
    server.close();
    if (err) { console.error(err); process.exit(1); }
    console.log(`wrote ${out}`);
  });
});
