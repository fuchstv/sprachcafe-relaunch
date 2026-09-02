import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';
import node from '@astrojs/node';

// Astro 5 Configuration with Native i18n SSG Routing, Tailwind CSS & Keystatic CMS
export default defineConfig({
  site: process.env.PUBLIC_ASTRO_SITE_URL || 'https://xn--sprachcaf-j4a.org',
  output: 'static',
  adapter: node({
    mode: 'standalone'
  }),
  integrations: [tailwind(), react(), keystatic()],
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
