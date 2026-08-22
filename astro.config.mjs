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
  // Old-site URLs → new pages. Static output renders these as meta-refresh
  // stubs with canonical links, since GitHub Pages has no server redirects.
  redirects: {
    '/contact': '/',
    '/visualizations': '/projects',
    '/projects/hallyu-indian-press': '/projects/hallyu-press',
    '/projects/buddhist-bridges/explore': '/projects/buddhist-bridges',
    '/janghan': '/projects/janghan',
  },
});
