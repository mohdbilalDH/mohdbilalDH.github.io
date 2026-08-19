import { defineConfig } from 'astro/config';

// User site (mohdbilalDH.github.io) — always served from the domain root.
export default defineConfig({
  output: 'static',
  site: 'https://mohdbilaldh.github.io',
  base: '/',
  trailingSlash: 'ignore',
});
