import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { getPosts, getBooks } from '../lib/cms-api';

export const GET: APIRoute = async ({ site }) => {
  const baseUrl = site ? site.toString().replace(/\/$/, '') : 'https://xn--sprachcaf-j4a.org';

  // Base static paths for languages (DE, PL, EN)
  const baseRoutes = [
    { path: '', de: '/', pl: '/pl/', en: '/en/' },
    { path: 'events', de: '/events/', pl: '/events/', en: '/events/' },
    { path: 'events/kinder-und-eltern', de: '/events/kinder-und-eltern/', pl: '/pl/events/kinder-und-eltern/', en: '/events/kinder-und-eltern/' },
    { path: 'posts', de: '/posts/', pl: '/posts/', en: '/posts/' },
    { path: 'hausbibliothek', de: '/hausbibliothek/', pl: '/hausbibliothek/', en: '/hausbibliothek/' },
    { path: 'mitmachen', de: '/mitmachen/', pl: '/mitmachen/', en: '/mitmachen/' },
    { path: 'kontakt', de: '/kontakt/', pl: '/kontakt/', en: '/kontakt/' },
  ];

  // Fetch dynamic content collections and APIs
  const events = await getCollection('events').catch(() => []);
  const posts = await getPosts().catch(() => []);
  const books = await getBooks().catch(() => []);

  const now = new Date().toISOString();

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n`;

  // 1. Static Localized Routes with i18n hreflang
  baseRoutes.forEach((route) => {
    const defaultUrl = `${baseUrl}${route.de}`;
    xml += `  <url>\n`;
    xml += `    <loc>${defaultUrl}</loc>\n`;
    xml += `    <lastmod>${now}</lastmod>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>${route.path === '' ? '1.0' : '0.8'}</priority>\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="de" href="${baseUrl}${route.de}" />\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="pl" href="${baseUrl}${route.pl}" />\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}${route.en}" />\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}${route.de}" />\n`;
    xml += `  </url>\n`;
  });

  // 2. Events Dynamic Routes
  events.forEach((e) => {
    const url = `${baseUrl}/events/${e.slug}/`;
    xml += `  <url>\n`;
    xml += `    <loc>${url}</loc>\n`;
    xml += `    <lastmod>${now}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.7</priority>\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="de" href="${url}" />\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="pl" href="${url}" />\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="en" href="${url}" />\n`;
    xml += `  </url>\n`;
  });

  // 3. Posts Dynamic Routes
  posts.forEach((p) => {
    const url = `${baseUrl}/posts/${p.slug}/`;
    xml += `  <url>\n`;
    xml += `    <loc>${url}</loc>\n`;
    xml += `    <lastmod>${now}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.7</priority>\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="de" href="${url}" />\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="pl" href="${url}" />\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="en" href="${url}" />\n`;
    xml += `  </url>\n`;
  });

  // 4. Hausbibliothek Book Routes
  books.forEach((b) => {
    const url = `${baseUrl}/hausbibliothek/${b.id}/`;
    xml += `  <url>\n`;
    xml += `    <loc>${url}</loc>\n`;
    xml += `    <lastmod>${now}</lastmod>\n`;
    xml += `    <changefreq>monthly</changefreq>\n`;
    xml += `    <priority>0.6</priority>\n`;
    xml += `  </url>\n`;
  });

  xml += `</urlset>`;

  return new Response(xml, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
};
