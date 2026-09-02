import { defineConfig, envField } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';
import node from '@astrojs/node';

// Astro 5 Configuration with Native i18n SSG Routing, Tailwind CSS & Keystatic CMS
export default defineConfig({
  env: {
    schema: {
      KEYSTATIC_GITHUB_CLIENT_ID: envField.string({ context: 'server', access: 'secret', optional: true }),
      KEYSTATIC_GITHUB_CLIENT_SECRET: envField.string({ context: 'server', access: 'secret', optional: true }),
      KEYSTATIC_SECRET: envField.string({ context: 'server', access: 'secret', optional: true }),
    }
  },
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
