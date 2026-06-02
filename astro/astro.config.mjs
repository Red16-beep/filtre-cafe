import { defineConfig } from 'astro/config';

// Static build. `format: 'file'` emits /journal/<slug>.html (no trailing-slash
// directory), so Cloudflare serves /journal/<slug> exactly like the current site.
export default defineConfig({
  site: 'https://filtre.cafe',
  trailingSlash: 'ignore',
  build: {
    format: 'file',
    inlineStylesheets: 'never',
  },
  compressHTML: false,
});
