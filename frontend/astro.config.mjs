import { defineConfig } from 'astro/config';

// Astro 5 Configuration with Native i18n SSG Routing
// Default locale: German ('de', root without prefix /), Polish ('pl'), English ('en')
export default defineConfig({
  site: process.env.PUBLIC_ASTRO_SITE_URL || 'https://sprachcafe-polnisch.org',
  output: 'static',
  i18n: {
    defaultLocale: 'de',
    locales: ['de', 'pl', 'en'],
    routing: {
      prefixDefaultLocale: false,
      redirectToDefaultLocale: true
    }
  },
  server: {
    port: 3000,
    host: true
  }
});
