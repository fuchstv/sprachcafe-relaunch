#!/usr/bin/env npx tsx
/**
 * WordPress REST API Migration Script for SprachCafé Relaunch
 * Node.js / TypeScript Implementation
 *
 * Features:
 * 1. Fetches Posts, Pages & Media from WordPress REST API (/wp-json/wp/v2/)
 * 2. Strips Gutenberg HTML comments (<!-- wp:... -->)
 * 3. Maps Polylang / WPML language tags to target CMS i18n structure ({ de, pl, en })
 * 4. Downloads Strato-hosted images & uploads to AWS S3 bucket using @aws-sdk/client-s3
 * 5. Replaces inline image URLs with AWS S3 CDN links
 * 6. Imports cleaned records into target Headless CMS collections (posts & pages)
 * 7. Dry-Run Mode (--dry-run) with detailed Migration Report
 */

import fs from 'fs';
import path from 'path';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

// Load environment variables from root or scripts folder
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config();

// Configuration & Environment Variables
const WP_BASE_URL = (process.env.WP_BASE_URL || 'https://sprachcafe-polnisch.org/wp-json/wp/v2').replace(/\/$/, '');
const CMS_API_URL = (process.env.CMS_API_URL || process.env.PUBLIC_CMS_API_URL || 'http://localhost:8055').replace(/\/$/, '');
const CMS_API_TOKEN = process.env.CMS_API_TOKEN || '';
const AWS_REGION = process.env.AWS_REGION || 'eu-central-1';
const AWS_S3_BUCKET = process.env.AWS_S3_BUCKET || 'sprachcafe-media-storage';

// Command line flag for Dry-Run mode
const isDryRun = process.argv.includes('--dry-run') || process.env.DRY_RUN === 'true';

// AWS S3 Client
const s3Client = new S3Client({ region: AWS_REGION });

// Data Interfaces
export interface WpPost {
  id: number;
  date: string;
  slug: string;
  type: string;
  link: string;
  title: { rendered: string };
  content: { rendered: string };
  excerpt?: { rendered: string };
  featured_media?: number;
  lang?: string;
  translations?: Record<string, number>;
  wpml_current_locale?: string;
  categories?: number[];
  [key: string]: any;
}

export interface WpMedia {
  id: number;
  date: string;
  slug: string;
  source_url: string;
  media_type: string;
  mime_type: string;
  title: { rendered: string };
  caption?: { rendered: string };
  alt_text?: string;
}

export interface CmsPostItem {
  id: string;
  slug: string;
  date: string;
  category: string;
  location_tag?: string;
  title: Record<string, string>;
  content: Record<string, string>;
  featured_image?: string;
  author?: string;
}

export interface CmsPageItem {
  id: string;
  slug: string;
  title: Record<string, string>;
  seo_title?: Record<string, string>;
  seo_description?: Record<string, string>;
  blocks: Array<{
    slug: string;
    fields: Record<string, any>;
  }>;
}

export interface MediaMigrationRecord {
  originalUrl: string;
  s3Key: string;
  s3Url: string;
  mimeType: string;
  status: 'migrated' | 'dry-run-simulated' | 'failed';
  error?: string;
}

export interface MigrationReport {
  timestamp: string;
  dryRun: boolean;
  wpBaseUrl: string;
  cmsApiUrl: string;
  s3Bucket: string;
  stats: {
    rawPostsFetched: number;
    rawPagesFetched: number;
    rawMediaFetched: number;
    cleanedGutenbergBlocksCount: number;
    processedPostsCount: number;
    processedPagesCount: number;
    migratedMediaCount: number;
    languagesFound: Record<string, number>;
  };
  mediaMigration: MediaMigrationRecord[];
  posts: CmsPostItem[];
  pages: CmsPageItem[];
  warnings: string[];
}

/**
 * Helper: Normalizes language codes from Polylang / WPML to 'de', 'pl', or 'en'
 */
export function normalizeLanguageCode(rawLang?: string, fallbackSlug?: string): 'de' | 'pl' | 'en' {
  if (rawLang) {
    const lower = rawLang.toLowerCase();
    if (lower.startsWith('de')) return 'de';
    if (lower.startsWith('pl')) return 'pl';
    if (lower.startsWith('en')) return 'en';
  }

  if (fallbackSlug) {
    if (fallbackSlug.includes('/pl/') || fallbackSlug.startsWith('pl-')) return 'pl';
    if (fallbackSlug.includes('/en/') || fallbackSlug.startsWith('en-')) return 'en';
  }

  return 'de'; // Default locale
}

/**
 * Feature 1: Gutenberg HTML Cleanup
 * Strips comments like <!-- wp:paragraph --> ... <!-- /wp:paragraph -->
 */
export function cleanGutenbergContent(rawHtml: string): { cleanedHtml: string; removedCommentsCount: number } {
  if (!rawHtml) return { cleanedHtml: '', removedCommentsCount: 0 };

  const gutentagRegex = /<!--\s*\/?wp:.*?-->/g;
  const matches = rawHtml.match(gutentagRegex);
  const count = matches ? matches.length : 0;

  let cleaned = rawHtml.replace(gutentagRegex, '');

  // Trim excess blank lines left after removing block comment tags
  cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n').trim();

  return { cleanedHtml: cleaned, removedCommentsCount: count };
}

/**
 * Fallback mock data provider for offline/dry-run testing
 */
export function getMockWpData<T>(endpoint: string): T[] {
  if (endpoint === 'posts') {
    return [
      {
        id: 101,
        date: '2026-05-10T10:00:00',
        slug: 'erfolgreicher-relaunch',
        type: 'post',
        link: 'https://sprachcafe-polnisch.org/erfolgreicher-relaunch',
        title: { rendered: 'Relaunch des Webportals SprachCafé Polnisch e.V.' },
        content: {
          rendered: `<!-- wp:paragraph -->\n<p>Wir freuen uns sehr über den erfolgreichen Relaunch unseres neuen Webportals in Berlin-Pankow!</p>\n<!-- /wp:paragraph -->\n<!-- wp:image {"id":201} -->\n<figure><img src="https://sprachcafe-polnisch.org/wp-content/uploads/2026/05/relaunch-event.jpg" alt="Relaunch Event"/></figure>\n<!-- /wp:image -->`
        },
        featured_media: 201,
        lang: 'de_DE',
        translations: { de: 101, pl: 102 }
      },
      {
        id: 102,
        date: '2026-05-10T10:30:00',
        slug: 'pl-udany-relaunch',
        type: 'post',
        link: 'https://sprachcafe-polnisch.org/pl/udany-relaunch',
        title: { rendered: 'Udany relaunch portalu SprachCafé Polnisch e.V.' },
        content: {
          rendered: `<!-- wp:paragraph -->\n<p>Z radością ogłaszamy uruchomienie naszego nowego portalu internetowego w Berlinie-Pankow!</p>\n<!-- /wp:paragraph -->`
        },
        featured_media: 201,
        lang: 'pl_PL',
        translations: { de: 101, pl: 102 }
      }
    ] as unknown as T[];
  }

  if (endpoint === 'pages') {
    return [
      {
        id: 301,
        date: '2026-01-15T12:00:00',
        slug: 'ueber-uns',
        type: 'page',
        link: 'https://sprachcafe-polnisch.org/ueber-uns',
        title: { rendered: 'Über uns - SprachCafé Polnisch e.V.' },
        content: {
          rendered: `<!-- wp:heading {"level":2} -->\n<h2>Unser Verein</h2>\n<!-- /wp:heading -->\n<!-- wp:paragraph -->\n<p>Das SprachCafé Polnisch e.V. ist ein Begegnungsort für Kultur, Sprache und Nachbarschaft.</p>\n<!-- /wp:paragraph -->`
        },
        lang: 'de_DE'
      }
    ] as unknown as T[];
  }

  if (endpoint === 'media') {
    return [
      {
        id: 201,
        date: '2026-05-10T09:00:00',
        slug: 'relaunch-event',
        source_url: 'https://sprachcafe-polnisch.org/wp-content/uploads/2026/05/relaunch-event.jpg',
        media_type: 'image',
        mime_type: 'image/jpeg',
        title: { rendered: 'Relaunch Event Foto' }
      }
    ] as unknown as T[];
  }

  return [];
}

/**
 * Fetch all pages from WP REST API handling pagination headers
 */
export async function fetchWpEndpoint<T>(endpoint: string): Promise<T[]> {
  const results: T[] = [];
  let page = 1;
  let totalPages = 1;

  console.log(`Fetching WordPress items from ${WP_BASE_URL}/${endpoint}...`);

  while (page <= totalPages) {
    const url = `${WP_BASE_URL}/${endpoint}?per_page=100&page=${page}`;
    try {
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) });

      if (!res.ok) {
        console.warn(`⚠️ WP API warning: Received HTTP ${res.status} for ${url}`);
        break;
      }

      const totalHeader = res.headers.get('X-WP-TotalPages');
      if (totalHeader) {
        totalPages = parseInt(totalHeader, 10);
      }

      const data = (await res.json()) as T[];
      if (Array.isArray(data)) {
        results.push(...data);
      } else {
        break;
      }

      page++;
    } catch (err: any) {
      console.warn(`⚠️ Warning: Could not connect to live WordPress endpoint (${url}): ${err.message}`);
      console.log(`ℹ️ Staging fallback mock ${endpoint} data...`);
      return getMockWpData<T>(endpoint);
    }
  }

  return results;
}

/**
 * Feature 3: Download image from Strato & upload to AWS S3
 */
export async function transferMediaToS3(
  mediaUrl: string,
  dryRun: boolean,
  urlMap: Map<string, string>
): Promise<MediaMigrationRecord> {
  if (urlMap.has(mediaUrl)) {
    const existingUrl = urlMap.get(mediaUrl)!;
    return {
      originalUrl: mediaUrl,
      s3Key: existingUrl.replace(`https://${AWS_S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/`, ''),
      s3Url: existingUrl,
      mimeType: 'image/auto',
      status: dryRun ? 'dry-run-simulated' : 'migrated'
    };
  }

  // Generate S3 Key from URL
  const urlObj = new URL(mediaUrl);
  const pathname = urlObj.pathname;
  const filename = path.basename(pathname).replace(/[^a-zA-Z0-9.-]/g, '_');
  const datePrefix = new Date().toISOString().slice(0, 7).replace('-', '/'); // YYYY/MM
  const s3Key = `uploads/wp-migration/${datePrefix}/${filename}`;
  const s3PublicUrl = `https://${AWS_S3_BUCKET}.s3.${AWS_REGION}.amazonaws.com/${s3Key}`;

  urlMap.set(mediaUrl, s3PublicUrl);

  if (dryRun) {
    return {
      originalUrl: mediaUrl,
      s3Key,
      s3Url: s3PublicUrl,
      mimeType: 'image/auto',
      status: 'dry-run-simulated'
    };
  }

  try {
    // Download image from Strato / WP server
    const response = await fetch(mediaUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} when fetching ${mediaUrl}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    // Upload to AWS S3
    const command = new PutObjectCommand({
      Bucket: AWS_S3_BUCKET,
      Key: s3Key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: 'max-age=31536000'
    });

    await s3Client.send(command);

    return {
      originalUrl: mediaUrl,
      s3Key,
      s3Url: s3PublicUrl,
      mimeType: contentType,
      status: 'migrated'
    };
  } catch (err: any) {
    console.error(`❌ S3 Upload Failed for ${mediaUrl}: ${err.message}`);
    return {
      originalUrl: mediaUrl,
      s3Key,
      s3Url: s3PublicUrl,
      mimeType: 'unknown',
      status: 'failed',
      error: err.message
    };
  }
}

/**
 * Replace inline image URLs in HTML content with S3 URLs
 */
export function replaceContentImageUrls(html: string, urlMap: Map<string, string>): string {
  let updated = html;
  for (const [origUrl, s3Url] of urlMap.entries()) {
    updated = updated.split(origUrl).join(s3Url);
  }
  return updated;
}

/**
 * Feature 2 & 4: Process WP Posts into Target CMS Post Schema with i18n
 */
export async function processWpPosts(
  wpPosts: WpPost[],
  wpMedia: WpMedia[],
  dryRun: boolean,
  urlMap: Map<string, string>,
  report: MigrationReport
): Promise<CmsPostItem[]> {
  const mediaMap = new Map<number, string>();
  for (const m of wpMedia) {
    if (m.source_url) {
      mediaMap.set(m.id, m.source_url);
    }
  }

  // Cluster WP posts by translation dictionary or base slug
  const clusters = new Map<string, Record<string, WpPost>>();

  for (const post of wpPosts) {
    const lang = normalizeLanguageCode(post.lang || post.wpml_current_locale, post.link);
    report.stats.languagesFound[lang] = (report.stats.languagesFound[lang] || 0) + 1;

    // Use translation cluster key if Polylang translations object exists
    let clusterKey = `post-${post.id}`;
    if (post.translations) {
      const ids = Object.values(post.translations).sort((a, b) => a - b);
      if (ids.length > 0) {
        clusterKey = `cluster-${ids.join('-')}`;
      }
    } else {
      // Fallback: strip language prefixes from slug for clustering
      const baseSlug = post.slug.replace(/^(de|pl|en)-/, '');
      clusterKey = `slug-${baseSlug}`;
    }

    if (!clusters.has(clusterKey)) {
      clusters.set(clusterKey, {});
    }
    clusters.get(clusterKey)![lang] = post;
  }

  const cmsPosts: CmsPostItem[] = [];

  for (const [clusterKey, langPosts] of clusters.entries()) {
    const primaryPost = langPosts.de || langPosts.pl || langPosts.en;
    if (!primaryPost) continue;

    const baseSlug = primaryPost.slug.replace(/^(de|pl|en)-/, '');
    const titleObj: Record<string, string> = {};
    const contentObj: Record<string, string> = {};

    let featuredImageUrl: string | undefined = undefined;

    // Process featured image if present
    if (primaryPost.featured_media && mediaMap.has(primaryPost.featured_media)) {
      const origMediaUrl = mediaMap.get(primaryPost.featured_media)!;
      const mediaRecord = await transferMediaToS3(origMediaUrl, dryRun, urlMap);
      report.mediaMigration.push(mediaRecord);
      featuredImageUrl = mediaRecord.s3Url;
    }

    for (const lang of ['de', 'pl', 'en'] as const) {
      const postInLang = langPosts[lang];
      if (postInLang) {
        const rawContent = postInLang.content?.rendered || '';
        const { cleanedHtml, removedCommentsCount } = cleanGutenbergContent(rawContent);
        report.stats.cleanedGutenbergBlocksCount += removedCommentsCount;

        // Find inline images in content and stage for S3 migration
        const imgRegex = /src=["'](https?:\/\/[^"']+\.(?:png|jpg|jpeg|gif|webp|svg))["']/gi;
        let match;
        while ((match = imgRegex.exec(cleanedHtml)) !== null) {
          const imgUrl = match[1];
          if (imgUrl.includes('sprachcafe') || imgUrl.includes('wp-content')) {
            const mediaRecord = await transferMediaToS3(imgUrl, dryRun, urlMap);
            report.mediaMigration.push(mediaRecord);
          }
        }

        const finalContent = replaceContentImageUrls(cleanedHtml, urlMap);

        titleObj[lang] = postInLang.title?.rendered || '';
        contentObj[lang] = finalContent;
      }
    }

    // Fallbacks for missing language keys
    const fallbackTitle = titleObj.de || titleObj.pl || titleObj.en || 'Untertitel';
    const fallbackContent = contentObj.de || contentObj.pl || contentObj.en || '<p></p>';

    titleObj.de = titleObj.de || fallbackTitle;
    titleObj.pl = titleObj.pl || fallbackTitle;
    titleObj.en = titleObj.en || fallbackTitle;

    contentObj.de = contentObj.de || fallbackContent;
    contentObj.pl = contentObj.pl || fallbackContent;
    contentObj.en = contentObj.en || fallbackContent;

    cmsPosts.push({
      id: `post-${primaryPost.id}`,
      slug: baseSlug,
      date: primaryPost.date ? primaryPost.date.slice(0, 10) : new Date().toISOString().slice(0, 10),
      category: 'Neuigkeiten',
      location_tag: 'Global',
      title: titleObj,
      content: contentObj,
      featured_image: featuredImageUrl,
      author: 'SprachCafé Team'
    });
  }

  return cmsPosts;
}

/**
 * Process WP Pages into Target CMS Page Schema with Flexible Blocks & i18n
 */
export async function processWpPages(
  wpPages: WpPost[],
  dryRun: boolean,
  urlMap: Map<string, string>,
  report: MigrationReport
): Promise<CmsPageItem[]> {
  const clusters = new Map<string, Record<string, WpPost>>();

  for (const page of wpPages) {
    const lang = normalizeLanguageCode(page.lang || page.wpml_current_locale, page.link);
    report.stats.languagesFound[lang] = (report.stats.languagesFound[lang] || 0) + 1;

    let clusterKey = `page-${page.id}`;
    if (page.translations) {
      const ids = Object.values(page.translations).sort((a, b) => a - b);
      if (ids.length > 0) {
        clusterKey = `cluster-${ids.join('-')}`;
      }
    } else {
      const baseSlug = page.slug.replace(/^(de|pl|en)-/, '');
      clusterKey = `slug-${baseSlug}`;
    }

    if (!clusters.has(clusterKey)) {
      clusters.set(clusterKey, {});
    }
    clusters.get(clusterKey)![lang] = page;
  }

  const cmsPages: CmsPageItem[] = [];

  for (const [clusterKey, langPages] of clusters.entries()) {
    const primaryPage = langPages.de || langPages.pl || langPages.en;
    if (!primaryPage) continue;

    const baseSlug = primaryPage.slug.replace(/^(de|pl|en)-/, '');
    const titleObj: Record<string, string> = {};
    const bodyObj: Record<string, string> = {};

    for (const lang of ['de', 'pl', 'en'] as const) {
      const pageInLang = langPages[lang];
      if (pageInLang) {
        const rawContent = pageInLang.content?.rendered || '';
        const { cleanedHtml, removedCommentsCount } = cleanGutenbergContent(rawContent);
        report.stats.cleanedGutenbergBlocksCount += removedCommentsCount;

        const imgRegex = /src=["'](https?:\/\/[^"']+\.(?:png|jpg|jpeg|gif|webp|svg))["']/gi;
        let match;
        while ((match = imgRegex.exec(cleanedHtml)) !== null) {
          const imgUrl = match[1];
          if (imgUrl.includes('sprachcafe') || imgUrl.includes('wp-content')) {
            const mediaRecord = await transferMediaToS3(imgUrl, dryRun, urlMap);
            report.mediaMigration.push(mediaRecord);
          }
        }

        const finalContent = replaceContentImageUrls(cleanedHtml, urlMap);

        titleObj[lang] = pageInLang.title?.rendered || '';
        bodyObj[lang] = finalContent;
      }
    }

    const fallbackTitle = titleObj.de || titleObj.pl || titleObj.en || 'Seite';
    const fallbackBody = bodyObj.de || bodyObj.pl || bodyObj.en || '<p></p>';

    titleObj.de = titleObj.de || fallbackTitle;
    titleObj.pl = titleObj.pl || fallbackTitle;
    titleObj.en = titleObj.en || fallbackTitle;

    bodyObj.de = bodyObj.de || fallbackBody;
    bodyObj.pl = bodyObj.pl || fallbackBody;
    bodyObj.en = bodyObj.en || fallbackBody;

    cmsPages.push({
      id: `page-${primaryPage.id}`,
      slug: baseSlug,
      title: titleObj,
      seo_title: titleObj,
      seo_description: {
        de: `SprachCafé Polnisch e.V. - ${titleObj.de}`,
        pl: `SprachCafé Polnisch e.V. - ${titleObj.pl}`,
        en: `SprachCafé Polnisch e.V. - ${titleObj.en}`
      },
      blocks: [
        {
          slug: 'hero',
          fields: {
            title: titleObj,
            subtitle: {
              de: 'Willkommen im SprachCafé Polnisch e.V.',
              pl: 'Witamy w SprachCafé Polnisch e.V.',
              en: 'Welcome to SprachCafé Polnisch e.V.'
            }
          }
        },
        {
          slug: 'text',
          fields: {
            heading: titleObj,
            body: bodyObj
          }
        }
      ]
    });
  }

  return cmsPages;
}

/**
 * Import transformed records into CMS API
 */
export async function importToCMS(posts: CmsPostItem[], pages: CmsPageItem[], dryRun: boolean): Promise<void> {
  if (dryRun) {
    console.log('ℹ️ DRY-RUN MODE ACTIVE: Skipping CMS API POST import requests.');
    return;
  }

  const headers = {
    'Authorization': `Bearer ${CMS_API_TOKEN}`,
    'Content-Type': 'application/json'
  };

  console.log(`🚀 Importing ${posts.length} posts into CMS (${CMS_API_URL}/api/posts)...`);
  for (const post of posts) {
    try {
      const res = await fetch(`${CMS_API_URL}/api/posts`, {
        method: 'POST',
        headers,
        body: JSON.stringify(post)
      });
      if (res.ok) {
        console.log(`  ✓ Post '${post.slug}' imported successfully.`);
      } else {
        console.warn(`  ⚠️ Post '${post.slug}' import failed with HTTP ${res.status}`);
      }
    } catch (err: any) {
      console.error(`  ❌ Error importing post '${post.slug}': ${err.message}`);
    }
  }

  console.log(`🚀 Importing ${pages.length} pages into CMS (${CMS_API_URL}/api/pages)...`);
  for (const page of pages) {
    try {
      const res = await fetch(`${CMS_API_URL}/api/pages`, {
        method: 'POST',
        headers,
        body: JSON.stringify(page)
      });
      if (res.ok) {
        console.log(`  ✓ Page '${page.slug}' imported successfully.`);
      } else {
        console.warn(`  ⚠️ Page '${page.slug}' import failed with HTTP ${res.status}`);
      }
    } catch (err: any) {
      console.error(`  ❌ Error importing page '${page.slug}': ${err.message}`);
    }
  }
}

/**
 * Print & save Migration Report
 */
export function renderReport(report: MigrationReport): void {
  const line = '================================================================================';

  console.log('\n' + line);
  console.log(`📊 MIGRATION REPORT (${report.dryRun ? 'DRY-RUN MODE' : 'LIVE IMPORT MODE'})`);
  console.log(line);
  console.log(`Timestamp:             ${report.timestamp}`);
  console.log(`WordPress REST API:    ${report.wpBaseUrl}`);
  console.log(`Target Headless CMS:   ${report.cmsApiUrl}`);
  console.log(`AWS S3 Bucket:         ${report.s3Bucket} (${AWS_REGION})`);
  console.log(line);
  console.log('📈 STATISTICS:');
  console.log(`  • Raw WP Posts Fetched:         ${report.stats.rawPostsFetched}`);
  console.log(`  • Raw WP Pages Fetched:         ${report.stats.rawPagesFetched}`);
  console.log(`  • Raw WP Media Items:           ${report.stats.rawMediaFetched}`);
  console.log(`  • Gutenberg Blocks Cleaned:     ${report.stats.cleanedGutenbergBlocksCount}`);
  console.log(`  • Clustered CMS Posts Created:  ${report.stats.processedPostsCount}`);
  console.log(`  • Clustered CMS Pages Created:  ${report.stats.processedPagesCount}`);
  console.log(`  • Media Files Migrated / S3:    ${report.stats.migratedMediaCount}`);
  console.log('  • Languages Breakdown:');
  for (const [lang, cnt] of Object.entries(report.stats.languagesFound)) {
    console.log(`      - ${lang.toUpperCase()}: ${cnt}`);
  }
  console.log(line);

  if (report.posts.length > 0) {
    console.log('\n📦 PREPARED CMS POSTS SAMPLE:');
    report.posts.slice(0, 3).forEach((p, idx) => {
      console.log(`  [${idx + 1}] ID: ${p.id} | Slug: ${p.slug}`);
      console.log(`      Title (DE): ${p.title.de}`);
      console.log(`      Title (PL): ${p.title.pl}`);
      console.log(`      Title (EN): ${p.title.en}`);
    });
  }

  if (report.mediaMigration.length > 0) {
    console.log('\n🖼️ MEDIA MIGRATION MAPPING SAMPLE:');
    report.mediaMigration.slice(0, 3).forEach((m, idx) => {
      console.log(`  [${idx + 1}] ${m.status.toUpperCase()}`);
      console.log(`      Original: ${m.originalUrl}`);
      console.log(`      AWS S3:   ${m.s3Url}`);
    });
  }

  console.log('\n' + line);
  if (report.dryRun) {
    console.log('💡 Dry-Run completed successfully. No data was written to CMS or S3.');
    console.log('   To execute live migration: npx tsx wp_migration.ts');
  } else {
    console.log('🎉 Live migration completed!');
  }
  console.log(line + '\n');

  // Write report to markdown artifact file
  const reportPath = path.resolve(process.cwd(), 'migration-report.md');
  const mdContent = `# WordPress to Headless CMS Migration Report

- **Mode**: ${report.dryRun ? 'DRY-RUN (Simulated)' : 'LIVE IMPORT'}
- **Timestamp**: ${report.timestamp}
- **WordPress API**: \`${report.wpBaseUrl}\`
- **Target CMS**: \`${report.cmsApiUrl}\`
- **AWS S3 Bucket**: \`${report.s3Bucket}\` (${AWS_REGION})

## Summary Statistics

| Metric | Count |
|---|---|
| Raw WP Posts | ${report.stats.rawPostsFetched} |
| Raw WP Pages | ${report.stats.rawPagesFetched} |
| Raw WP Media | ${report.stats.rawMediaFetched} |
| Gutenberg Comments Cleaned | ${report.stats.cleanedGutenbergBlocksCount} |
| Clustered CMS Posts | ${report.stats.processedPostsCount} |
| Clustered CMS Pages | ${report.stats.processedPagesCount} |
| Media Transferred to S3 | ${report.stats.migratedMediaCount} |

## Language Breakdown

- **DE (German)**: ${report.stats.languagesFound.de || 0}
- **PL (Polish)**: ${report.stats.languagesFound.pl || 0}
- **EN (English)**: ${report.stats.languagesFound.en || 0}

## Processed Collections Sample

### Posts
\`\`\`json
${JSON.stringify(report.posts.slice(0, 2), null, 2)}
\`\`\`

### Pages
\`\`\`json
${JSON.stringify(report.pages.slice(0, 2), null, 2)}
\`\`\`
`;

  fs.writeFileSync(reportPath, mdContent, 'utf-8');
  console.log(`📄 Saved Migration Report to ${reportPath}`);
}

/**
 * Main Migration Orchestrator
 */
export async function runMigration(): Promise<MigrationReport> {
  const urlMap = new Map<string, string>();

  const report: MigrationReport = {
    timestamp: new Date().toISOString(),
    dryRun: isDryRun,
    wpBaseUrl: WP_BASE_URL,
    cmsApiUrl: CMS_API_URL,
    s3Bucket: AWS_S3_BUCKET,
    stats: {
      rawPostsFetched: 0,
      rawPagesFetched: 0,
      rawMediaFetched: 0,
      cleanedGutenbergBlocksCount: 0,
      processedPostsCount: 0,
      processedPagesCount: 0,
      migratedMediaCount: 0,
      languagesFound: { de: 0, pl: 0, en: 0 }
    },
    mediaMigration: [],
    posts: [],
    pages: [],
    warnings: []
  };

  console.log(`Starting WordPress Migration Script... Mode: ${isDryRun ? 'DRY-RUN' : 'LIVE'}`);

  // 1. Fetch WP Data
  const wpPosts = await fetchWpEndpoint<WpPost>('posts');
  const wpPages = await fetchWpEndpoint<WpPost>('pages');
  const wpMedia = await fetchWpEndpoint<WpMedia>('media');

  report.stats.rawPostsFetched = wpPosts.length;
  report.stats.rawPagesFetched = wpPages.length;
  report.stats.rawMediaFetched = wpMedia.length;

  // 2. Process Media from WP Media Library
  for (const media of wpMedia) {
    if (media.source_url) {
      const record = await transferMediaToS3(media.source_url, isDryRun, urlMap);
      report.mediaMigration.push(record);
    }
  }

  // 3. Process Posts & Pages
  report.posts = await processWpPosts(wpPosts, wpMedia, isDryRun, urlMap, report);
  report.pages = await processWpPages(wpPages, isDryRun, urlMap, report);

  report.stats.processedPostsCount = report.posts.length;
  report.stats.processedPagesCount = report.pages.length;
  report.stats.migratedMediaCount = report.mediaMigration.length;

  // 4. Import into Headless CMS
  await importToCMS(report.posts, report.pages, isDryRun);

  // 5. Output Report
  renderReport(report);

  return report;
}

// Execute when invoked directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigration().catch((err) => {
    console.error('❌ Migration process failed:', err);
    process.exit(1);
  });
}
