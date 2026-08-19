import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { getPosts, getBooks } from '../lib/cms-api';

export const GET: APIRoute = async ({ site }) => {
  const baseUrl = site ? site.toString().replace(/\/$/, '') : 'https://xn--sprachcaf-j4a.org';

  // Base static paths for languages (DE, PL, EN)
  const baseRoutes = [
    { path: '', de: '/', pl: '/pl/', en: '/en/' },
    { path: 'ueber-uns', de: '/ueber-uns/', pl: '/pl/ueber-uns/', en: '/en/ueber-uns/' },
    { path: 'ueber-uns/mission', de: '/ueber-uns/mission/', pl: '/pl/ueber-uns/mission/', en: '/en/ueber-uns/mission/' },
    { path: 'ueber-uns/team', de: '/ueber-uns/team/', pl: '/pl/ueber-uns/team/', en: '/en/ueber-uns/team/' },
    { path: 'ueber-uns/frequently-asked-questions', de: '/ueber-uns/frequently-asked-questions/', pl: '/pl/ueber-uns/frequently-asked-questions/', en: '/en/ueber-uns/frequently-asked-questions/' },
    { path: 'ueber-uns/ausstellungen', de: '/ueber-uns/ausstellungen/', pl: '/pl/ueber-uns/ausstellungen/', en: '/en/ueber-uns/ausstellungen/' },
    { path: 'ueber-uns/kleiner-laden', de: '/ueber-uns/kleiner-laden/', pl: '/pl/ueber-uns/kleiner-laden/', en: '/en/ueber-uns/kleiner-laden/' },
    { path: 'ueber-uns/begegnungscafe', de: '/ueber-uns/begegnungscafe/', pl: '/pl/ueber-uns/begegnungscafe/', en: '/en/ueber-uns/begegnungscafe/' },
    { path: 'mehrsprachigkeit', de: '/mehrsprachigkeit/', pl: '/pl/mehrsprachigkeit/', en: '/en/mehrsprachigkeit/' },
    { path: 'events', de: '/events/', pl: '/pl/events/', en: '/en/events/' },
    { path: 'events/kinder-und-eltern', de: '/events/kinder-und-eltern/', pl: '/pl/events/kinder-und-eltern/', en: '/en/events/kinder-und-eltern/' },
    { path: 'posts', de: '/posts/', pl: '/pl/posts/', en: '/en/posts/' },
    { path: 'hausbibliothek', de: '/hausbibliothek/', pl: '/pl/hausbibliothek/', en: '/en/hausbibliothek/' },
    { path: 'mitmachen', de: '/mitmachen/', pl: '/pl/mitmachen/', en: '/en/mitmachen/' },
    { path: 'mitmachen/mitglied-werden', de: '/mitmachen/mitglied-werden/', pl: '/pl/mitmachen/mitglied-werden/', en: '/en/mitmachen/mitglied-werden/' },
    { path: 'mitmachen/spenden', de: '/mitmachen/spenden/', pl: '/pl/mitmachen/spenden/', en: '/en/mitmachen/spenden/' },
    { path: 'mitmachen/partner', de: '/mitmachen/partner/', pl: '/pl/mitmachen/partner/', en: '/en/mitmachen/partner/' },
    { path: 'kontakt', de: '/kontakt/', pl: '/pl/kontakt/', en: '/en/kontakt/' },
    { path: 'impressum', de: '/impressum/', pl: '/pl/impressum/', en: '/en/impressum/' },
    { path: 'datenschutz', de: '/datenschutz/', pl: '/pl/datenschutz/', en: '/en/datenschutz/' },
    { path: 'barrierefreiheit', de: '/barrierefreiheit/', pl: '/pl/barrierefreiheit/', en: '/en/barrierefreiheit/' },
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

    // Polish index URL in sitemap
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}${route.pl}</loc>\n`;
    xml += `    <lastmod>${now}</lastmod>\n`;
    xml += `    <changefreq>daily</changefreq>\n`;
    xml += `    <priority>${route.path === '' ? '0.9' : '0.7'}</priority>\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="de" href="${baseUrl}${route.de}" />\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="pl" href="${baseUrl}${route.pl}" />\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="en" href="${baseUrl}${route.en}" />\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${baseUrl}${route.de}" />\n`;
    xml += `  </url>\n`;
  });

  // 2. Events Dynamic Routes
  events.forEach((e) => {
    const deUrl = `${baseUrl}/events/${e.slug}/`;
    const plUrl = `${baseUrl}/pl/events/${e.slug}/`;
    xml += `  <url>\n`;
    xml += `    <loc>${deUrl}</loc>\n`;
    xml += `    <lastmod>${now}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.7</priority>\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="de" href="${deUrl}" />\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="pl" href="${plUrl}" />\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${deUrl}" />\n`;
    xml += `  </url>\n`;
    xml += `  <url>\n`;
    xml += `    <loc>${plUrl}</loc>\n`;
    xml += `    <lastmod>${now}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.7</priority>\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="de" href="${deUrl}" />\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="pl" href="${plUrl}" />\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${deUrl}" />\n`;
    xml += `  </url>\n`;
  });

  // 3. Posts Dynamic Routes
  posts.forEach((p) => {
    const deUrl = `${baseUrl}/posts/${p.slug}/`;
    const plUrl = `${baseUrl}/pl/posts/${p.slug}/`;
    xml += `  <url>\n`;
    xml += `    <loc>${deUrl}</loc>\n`;
    xml += `    <lastmod>${now}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.7</priority>\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="de" href="${deUrl}" />\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="pl" href="${plUrl}" />\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${deUrl}" />\n`;
    xml += `  </url>\n`;
    xml += `  <url>\n`;
    xml += `    <loc>${plUrl}</loc>\n`;
    xml += `    <lastmod>${now}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.7</priority>\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="de" href="${deUrl}" />\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="pl" href="${plUrl}" />\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${deUrl}" />\n`;
    xml += `  </url>\n`;
  });

  // 4. Hausbibliothek Book Routes
  books.forEach((b) => {
    const deUrl = `${baseUrl}/hausbibliothek/${b.id}/`;
    const plUrl = `${baseUrl}/pl/hausbibliothek/${b.id}/`;
    xml += `  <url>\n`;
    xml += `    <loc>${deUrl}</loc>\n`;
    xml += `    <lastmod>${now}</lastmod>\n`;
    xml += `    <changefreq>monthly</changefreq>\n`;
    xml += `    <priority>0.6</priority>\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="de" href="${deUrl}" />\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="pl" href="${plUrl}" />\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${deUrl}" />\n`;
    xml += `  </url>\n`;
    xml += `  <url>\n`;
    xml += `    <loc>${plUrl}</loc>\n`;
    xml += `    <lastmod>${now}</lastmod>\n`;
    xml += `    <changefreq>monthly</changefreq>\n`;
    xml += `    <priority>0.6</priority>\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="de" href="${deUrl}" />\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="pl" href="${plUrl}" />\n`;
    xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${deUrl}" />\n`;
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
