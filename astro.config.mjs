import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Production site URL. Update `site` if a custom domain is attached later —
// canonical URLs, the sitemap, and OG tags all derive from it.
export default defineConfig({
  output: 'static',
  site: 'https://mohdbilaldh.github.io',
  base: '/',
  trailingSlash: 'ignore',
  integrations: [sitemap()],
  // Stubs for the briefly-live redesign URLs → their equivalents in the
  // restored structure (static meta-refresh; GitHub Pages has no server redirects).
  redirects: {
    '/about': '/',
    '/notes': '/',
    '/projects/hallyu-press': '/projects/hallyu-indian-press',
  },
});
