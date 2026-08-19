// Regenerate public/files/mohd-bilal-cv.pdf from the built CV page using
// headless Chrome. Run `npm run build` first, then `npm run cv:pdf`, then
// rebuild so the fresh PDF is copied into dist/.
//
// The built page uses root-relative asset URLs, so it must be printed over
// HTTP: a throwaway static server serves dist/ for the duration. Chrome is
// spawned asynchronously — a sync exec would block the event loop and
// deadlock the server.
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
if (!existsSync('dist/cv/index.html')) throw new Error('dist/cv/index.html missing — run `npm run build` first');

const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.json': 'application/json', '.png': 'image/png', '.pdf': 'application/pdf' };
const server = createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (p.endsWith('/')) p += 'index.html';
  try {
    const body = readFileSync(join(resolve('dist'), p));
    res.writeHead(200, { 'content-type': MIME[extname(p)] ?? 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404).end();
  }
});

server.listen(0, '127.0.0.1', () => {
  const { port } = server.address();
  mkdirSync('public/files', { recursive: true });
  const out = resolve('public/files/mohd-bilal-cv.pdf');
  execFile(chrome, [
    '--headless',
    '--disable-gpu',
    '--no-pdf-header-footer',
    `--print-to-pdf=${out}`,
    `http://127.0.0.1:${port}/cv/`,
  ], (err) => {
    server.close();
    if (err) { console.error(err.message); process.exit(1); }
    console.log('wrote', out);
    process.exit(0);
  });
});
