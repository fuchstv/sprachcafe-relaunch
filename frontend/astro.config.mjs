import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: process.env.PUBLIC_ASTRO_SITE_URL || 'https://sprachcafe.de',
  output: 'static',
  server: {
    port: 3000,
    host: true
  }
});
