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
<link rel="stylesheet" href="/node_modules/@fontsource-variable/newsreader/standard.css">
<link rel="stylesheet" href="/node_modules/@fontsource/ibm-plex-mono/400.css">
<link rel="stylesheet" href="/node_modules/@fontsource-variable/source-sans-3/index.css">
<style>${tokens}
html,body{margin:0;width:1200px;height:630px;background:var(--paper);color:var(--ink);font-family:var(--f-body)}
.card{box-sizing:border-box;width:1200px;height:630px;padding:72px 88px;display:flex;flex-direction:column;justify-content:space-between;border-top:6px solid var(--ink)}
.top{display:flex;justify-content:space-between;align-items:baseline;font:400 18px/1 var(--f-mono);letter-spacing:.1em;text-transform:uppercase;color:var(--muted)}
.top b{color:var(--accent);font-weight:400;margin-right:.6em}
h1{font:400 128px/.95 var(--f-display);letter-spacing:-.03em;margin:0;font-variation-settings:'opsz' 72}
.lede{font:300 34px/1.3 var(--f-display);color:var(--text);margin:28px 0 0;max-width:900px}
.bottom{display:flex;justify-content:space-between;align-items:center;border-top:1.5px solid var(--ink);padding-top:22px;font:400 18px/1 var(--f-mono);letter-spacing:.08em;text-transform:uppercase;color:var(--muted)}
.dot{display:inline-block;width:12px;height:12px;border-radius:50%;background:var(--accent);margin-right:12px;vertical-align:-1px}
</style></head><body><div class="card">
<div class="top"><span><b>01</b>Korean Studies · Digital Humanities</span><span>mohdbilaldh.github.io</span></div>
<div><h1>Mohd Bilal</h1><p class="lede">Modern Korean history and its cultural afterlives, read through corpora, registers, and networks that keep their uncertainty visible.</p></div>
<div class="bottom"><span><span class="dot"></span>The Academy of Korean Studies, Seongnam</span><span>Projects · Publications · CV</span></div>
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
