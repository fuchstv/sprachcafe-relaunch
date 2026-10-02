import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import node from '@astrojs/node';

// Astro 5 Configuration with Hybrid Routing, Tailwind CSS & WordPress Headless CMS
export default defineConfig({
  site: process.env.PUBLIC_ASTRO_SITE_URL || 'https://beta.sprachcafe-polnisch.org',
  output: 'static',
  adapter: node({
    mode: 'standalone'
  }),
  security: {
    checkOrigin: false
  },
  integrations: [tailwind(), react()],
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
