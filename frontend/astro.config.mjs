import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

// Astro 5 Configuration with Native i18n SSG Routing & Tailwind CSS
export default defineConfig({
  site: process.env.PUBLIC_ASTRO_SITE_URL || 'https://sprachcafe-polnisch.org',
  output: 'static',
  integrations: [tailwind()],
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
