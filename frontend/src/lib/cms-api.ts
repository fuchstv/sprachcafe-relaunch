import type { EventItem, PostItem, BookItem, TeamPartnerItem, PageItem } from '../types/cms';
import staticBooks from '../data/books.json';
import http from 'node:http';
import he from 'he';

export type { EventItem, PostItem, BookItem, TeamPartnerItem, PageItem };

// Fallback Mock Data Provider for offline/build resilience
export const mockEvents: EventItem[] = [
  {
    id: 'evt-1',
    title: 'Polnisch-Deutscher Sprachabend in Pankow',
    slug: 'sprachabend-pankow-september',
    date_start: '2026-09-15T18:00:00Z',
    date_end: '2026-09-15T20:30:00Z',
    location: 'Pankow',
    target_group: 'Alle',
    language: 'Bilingual',
    description: 'Ein gemütlicher Abend für alle, die Polnisch und Deutsch in ungezwungener Atmosphäre üben möchten. Eintritt frei!',
    image: '/images/events/event-sprachabend.webp',
    max_participants: 25
  },
  {
    id: 'evt-2',
    title: 'Polnischer Filmklub: Dokumentarfilm & Diskussion',
    slug: 'filmklub-schoeneberg',
    date_start: '2026-09-22T19:00:00Z',
    date_end: '2026-09-22T21:30:00Z',
    location: 'Schöneberg',
    target_group: 'Erwachsene',
    language: 'PL',
    description: 'Gemeinsames Anschauen eines preisgekrönten polnischer Dokus mit anschließender Diskussion bei Tee und Gebäck.',
    image: '/images/events/event-geschichten.avif',
    max_participants: 30
  },
  {
    id: 'evt-3',
    title: 'Autorenlesung & Buchvorstellung Hausbibliothek',
    slug: 'lesung-koepenick',
    date_start: '2026-10-05T17:30:00Z',
    location: 'Köpenick',
    target_group: 'Alle',
    language: 'DE',
    description: 'Präsentation von Neuerscheinungen der zeitgenössischen polnischen Literatur in deutscher Übersetzung.',
    image: '/images/events/event-literaturreise.avif',
    max_participants: 40
  }
];

export const mockPosts: PostItem[] = [
  {
    id: 'post-1',
    title: 'Erfolgreicher Relaunch des SprachCafé Webportals',
    slug: 'erfolgreicher-relaunch-webportal',
    date: '2026-08-10',
    category: 'Neuigkeiten',
    location_tag: 'Global',
    content: 'Wir freuen uns, unsere neue barrierefreie Plattform mit Astro, Headless CMS und digitaler Hausbibliothek vorzustellen.',
    featured_image: '/images/hero/homepage-hero.webp',
    author: 'Vorstand SprachCafé'
  },
  {
    id: 'post-2',
    title: 'Neue Buchbestände in der Hausbibliothek Köpenick',
    slug: 'neue-buchbestaende-koepenick',
    date: '2026-08-01',
    category: 'Kultur',
    location_tag: 'Köpenick',
    content: 'Dank einer großzügigen Spende wurden über 50 neue zweisprachige Kinder- und Jugendbücher in unseren Katalog aufgenommen.',
    featured_image: '/images/library/hausbibliothek-raum.webp',
    author: 'Bibliotheksteam'
  }
];

export const mockBooks: BookItem[] = [
  {
    id: 'book-1',
    title: 'Bieguni (Unrast)',
    author: 'Olga Tokarczuk',
    isbn: '978-3455002287',
    language: 'PL',
    category: 'Belletristik',
    location: 'Pankow',
    status: 'verfuegbar',
    cover: '/images/library/hausbibliothek-raum.webp',
    description: 'Powieść o współczesnych nomadach, podróży i poszukiwaniu sensu we współczesnym świecie.'
  }
];

// ==============================================================================
// WordPress REST API Headless Connector
// ==============================================================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const memoryCache = new Map<string, CacheEntry<any>>();
const CACHE_TTL_MS = 60 * 1000; // 60 seconds TTL

export function purgeCache(key?: string): void {
  if (key) {
    memoryCache.delete(key);
  } else {
    memoryCache.clear();
  }
}

export const SLUG_MAPPING_DE_TO_PL: Record<string, string> = {
  'ueber-uns': 'o-nas',
  'team': 'zespol',
  'ausstellungen': 'wystawy',
  'kleiner-laden': 'sklepik',
  'begegnungscafe': 'kawiarnia',
  'mission': 'misja',
  'mitmachen': 'dzialaj-z-nami',
  'spenden': 'datki',
  'mitglied-werden': 'czlonkostwo',
  'partner': 'wspolpraca',
  'kooperationen': 'wspolpraca',
  'unsere-partner': 'nasi-partnerzy',
  'ehrenamt': 'wolontariat',
  'praktikum-im-scp': 'praktyki-w-kafejce',
  'sprachcafe-fuer-kinder': 'kafejka-dla-dzieci',
  'veranstaltungen': 'wydarzenia',
  'hausbibliothek': 'biblioteka',
  'mehrsprachigkeit': 'wielojezycznosc',
  'kontakt': 'kontakt',
  'datenschutz': 'ochrona-danych-osobowych',
  'datenschutzerklaerung': 'ochrona-danych-osobowych',
};

export const SLUG_MAPPING_PL_TO_DE: Record<string, string> = {
  'o-nas': 'ueber-uns',
  'zespol': 'team',
  'wystawy': 'ausstellungen',
  'sklepik': 'kleiner-laden',
  'kawiarnia': 'begegnungscafe',
  'misja': 'mission',
  'dzialaj-z-nami': 'mitmachen',
  'datki': 'spenden',
  'czlonkostwo': 'mitglied-werden',
  'wspolpraca': 'kooperationen',
  'nasi-partnerzy': 'unsere-partner',
  'wolontariat': 'ehrenamt',
  'praktyki-w-kafejce': 'praktikum-im-scp',
  'kafejka-dla-dzieci': 'sprachcafe-fuer-kinder',
  'wydarzenia': 'veranstaltungen',
  'biblioteka': 'hausbibliothek',
  'wielojezycznosc': 'mehrsprachigkeit',
  'kontakt': 'kontakt',
  'ochrona-danych-osobowych': 'datenschutzerklaerung',
};

export const SLUG_MAPPING_DE_TO_EN: Record<string, string> = {
  'ueber-uns': 'about-us',
  'team': 'team',
  'ausstellungen': 'exhibitions',
  'kleiner-laden': 'shop',
  'begegnungscafe': 'cafe',
  'mission': 'mission',
  'mitmachen': 'team-work',
  'spenden': 'donations',
  'mitglied-werden': 'membership',
  'ehrenamt': 'volunteering',
  'praktikum-im-scp': 'internship-in-sprachcafe',
  'kooperationen': 'cooperation',
  'partner': 'cooperation',
  'unsere-partner': 'our-partners',
  'unseren-raum-mieten': 'rent-our-room',
  'sprachcafe-fuer-kinder': 'cafe-for-children',
  'veranstaltungen': '2026-2',
  'hausbibliothek': 'library',
  'mehrsprachigkeit': 'multilingualism',
  'kontakt': 'contact-us',
  'datenschutz': 'privacy-policy',
  'datenschutzerklaerung': 'privacy-policy',
};

export const SLUG_MAPPING_EN_TO_DE: Record<string, string> = {
  'about-us': 'ueber-uns',
  'team': 'team',
  'exhibitions': 'ausstellungen',
  'shop': 'kleiner-laden',
  'cafe': 'begegnungscafe',
  'mission': 'mission',
  'team-work': 'mitmachen',
  'donations': 'spenden',
  'membership': 'mitglied-werden',
  'volunteering': 'ehrenamt',
  'internship-in-sprachcafe': 'praktikum-im-scp',
  'cooperation': 'kooperationen',
  'our-partners': 'unsere-partner',
  'rent-our-room': 'unseren-raum-mieten',
  'cafe-for-children': 'sprachcafe-fuer-kinder',
  '2026-2': 'veranstaltungen',
  'events': 'veranstaltungen',
  'library': 'hausbibliothek',
  'multilingualism': 'mehrsprachigkeit',
  'contact-us': 'kontakt',
  'privacy-policy': 'datenschutzerklaerung',
};

const WP_HOST = process.env.WP_INTERNAL_HOST || 'sprachcafe-polnisch.org';
const WP_PORT = parseInt(process.env.WP_INTERNAL_PORT || '80', 10);
const WP_IP = process.env.WP_INTERNAL_IP || '127.0.0.1';

/**
 * Performs a direct, low-overhead HTTP GET request to the local WordPress REST API.
 */
export async function fetchFromWp<T>(apiPath: string): Promise<T> {
  const cacheKey = apiPath;
  const now = Date.now();
  const cached = memoryCache.get(cacheKey);

  if (cached && now - cached.timestamp < CACHE_TTL_MS) {
    return cached.data as T;
  }

  return new Promise((resolve, reject) => {
    const req = http.request(
      {
        hostname: WP_IP,
        port: WP_PORT,
        path: apiPath,
        method: 'GET',
        headers: {
          Host: WP_HOST,
          Accept: 'application/json',
          'User-Agent': 'Astro-Hybrid-Client/1.0',
        },
        timeout: 12000,
      },
      (res) => {
        let body = '';
        res.setEncoding('utf8');
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
            try {
              const parsed = JSON.parse(body);
              memoryCache.set(cacheKey, { data: parsed, timestamp: now });
              resolve(parsed as T);
            } catch (err) {
              reject(new Error(`Failed to parse WP response for ${apiPath}: ${err}`));
            }
          } else {
            reject(new Error(`WP REST API HTTP ${res.statusCode} for ${apiPath}`));
          }
        });
      }
    );

    req.on('timeout', () => {
      req.destroy();
      reject(new Error(`WP REST API timeout for ${apiPath}`));
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.end();
  });
}

/**
 * Parses bilingual titles (e.g., "Tytuł po polsku | Titel auf Deutsch" or "... | PL DE").
 */
export function parseBilingualTitle(rawTitle: string, lang: 'de' | 'pl' | 'en' = 'de'): string {
  if (!rawTitle) return '';
  const decoded = he.decode(rawTitle).trim();

  if (decoded.includes('|')) {
    const parts = decoded.split('|').map((s) => s.trim());
    if (parts.length >= 2) {
      // Check if second part is a language tag indicator like "PL DE" or "DE PL"
      if (/^(PL\s+DE|DE\s+PL|PL\/DE|DE\/PL|PL|DE)$/i.test(parts[1])) {
        return parts[0];
      }
      if (lang === 'de') {
        return parts[1] || parts[0];
      } else {
        return parts[0];
      }
    }
  }

  return decoded;
}

/**
 * Parses and splits single-post bilingual content marked with [POL] and [DEU].
 */
export function parseBilingualContent(html: string, lang: 'de' | 'pl' | 'en' = 'de'): string {
  if (!html) return '';

  const normalized = normalizeContentMedia(html);

  const deuRegex = /\[(?:DEU|DE|GER)\]/i;
  const polRegex = /\[(?:POL|PL)\]/i;

  // Case 1: Contains both language markers
  if (deuRegex.test(normalized) && polRegex.test(normalized)) {
    // Strip common bilingual header switcher paragraph like "<p>[POL] | [DEU]</p>"
    const cleanBody = normalized
      .replace(/<p[^>]*>\s*\[(?:POL|PL)\]\s*\|\s*\[(?:DEU|DE|GER)\]\s*<\/p>/gi, '')
      .replace(/\[(?:POL|PL)\]\s*\|\s*\[(?:DEU|DE|GER)\]/gi, '');

    // Split at the second marker (usually [DEU])
    const parts = cleanBody.split(deuRegex);
    if (parts.length >= 2) {
      const polishPart = parts[0].replace(polRegex, '').trim();
      const germanPart = parts.slice(1).join('').trim();

      if (lang === 'de' && germanPart.length > 30) {
        return germanPart;
      }
      if (lang === 'pl' && polishPart.length > 30) {
        return polishPart;
      }
    }
  }

  return normalized;
}

/**
 * Rewrites image and asset links to local relative URLs (/wp-content/uploads/...).
 * Strips Jetpack CDN redirects (i0.wp.com / i1.wp.com) and absolute Strato host URLs.
 */
export function normalizeContentMedia(html: string): string {
  if (!html) return '';

  return html
    // Strip Jetpack CDN prefix: https://i0.wp.com/sprachcafe-polnisch.org/wp-content/... -> /wp-content/...
    .replace(/https?:\/\/i[0-3]\.wp\.com\/(?:beta\.|www\.)?(?:sprachcafe-polnisch\.org|xn--sprachcaf-j4a\.org)(\/wp-content\/uploads\/[^"'\s?]+)(\?[^"'\s]*)?/gi, '$1')
    // Convert absolute domain links to relative: https://sprachcafe-polnisch.org/wp-content/... -> /wp-content/...
    .replace(/https?:\/\/(?:beta\.|www\.)?(?:sprachcafe-polnisch\.org|xn--sprachcaf-j4a\.org)(\/wp-content\/uploads\/[^"'\s,]+)/gi, '$1')
    // Convert all absolute domain links to relative: https://sprachcafe-polnisch.org/xyz -> /xyz
    .replace(/https?:\/\/(?:beta\.|www\.)?(?:sprachcafe-polnisch\.org|xn--sprachcaf-j4a\.org)(?::\d+)?(\/[^"'\s,>]*)/gi, '$1');
}

/**
 * Maps raw WordPress REST API post to the application PostItem model.
 */
function mapWpPostToPostItem(wpPost: any, lang: 'de' | 'pl' | 'en' = 'de'): PostItem {
  const rawTitle = wpPost.title?.rendered || '';
  const rawContent = wpPost.content?.rendered || '';
  const rawExcerpt = wpPost.excerpt?.rendered || '';

  // Extract author name if embedded
  const author = wpPost._embedded?.author?.[0]?.name || 'SprachCafé Polnisch';

  // Extract featured image from embedded data
  let featuredImage: string | undefined = undefined;
  const mediaObj = wpPost._embedded?.['wp:featuredmedia']?.[0];
  if (mediaObj?.source_url) {
    featuredImage = normalizeContentMedia(mediaObj.source_url);
  }

  // Extract categories
  const categoriesList: string[] = [];
  if (Array.isArray(wpPost._embedded?.['wp:term']?.[0])) {
    for (const term of wpPost._embedded['wp:term'][0]) {
      if (term.name) categoriesList.push(he.decode(term.name));
    }
  }

  const primaryCategory = categoriesList[0] || 'SprachCafé';

  // Parse bilingual parts
  const parsedTitle = parseBilingualTitle(rawTitle, lang);
  const parsedContent = parseBilingualContent(rawContent, lang);
  const rawExcerptParsed = rawExcerpt ? parseBilingualContent(rawExcerpt, lang).replace(/<[^>]+>/g, '').trim() : '';
  const parsedExcerpt = rawExcerptParsed && !rawExcerptParsed.startsWith('[POL]') && !rawExcerptParsed.startsWith('[DEU]')
    ? he.decode(rawExcerptParsed)
    : he.decode(parsedContent.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').slice(0, 160).trim());

  return {
    id: String(wpPost.id),
    title: parsedTitle,
    slug: wpPost.slug,
    date: wpPost.date || new Date().toISOString(),
    category: primaryCategory,
    categories: categoriesList,
    content: parsedContent,
    excerpt: parsedExcerpt,
    featured_image: featuredImage,
    author,
    lang,
  };
}

// ==============================================================================
// Public API Methods
// ==============================================================================

export async function getPosts(options?: {
  lang?: 'de' | 'pl' | 'en';
  limit?: number;
  page?: number;
  category?: string;
}): Promise<PostItem[]> {
  const lang = options?.lang || 'de';
  const limit = options?.limit || 20;
  const page = options?.page || 1;

  try {
    let rawPosts = await fetchFromWp<any[]>(
      `/wp-json/wp/v2/posts?per_page=${limit}&page=${page}&_embed=1&lang=${lang}&wpml_language=${lang}`
    );
    if ((!Array.isArray(rawPosts) || rawPosts.length === 0) && lang !== 'de') {
      rawPosts = await fetchFromWp<any[]>(
        `/wp-json/wp/v2/posts?per_page=${limit}&page=${page}&_embed=1`
      );
    }
    if (Array.isArray(rawPosts) && rawPosts.length > 0) {
      return rawPosts.map((p) => mapWpPostToPostItem(p, lang));
    }
  } catch (err) {
    console.warn(`[cms-api] getPosts fallback to mock data:`, err);
  }

  return mockPosts;
}

export async function getPostBySlug(
  slug: string,
  lang: 'de' | 'pl' | 'en' = 'de'
): Promise<PostItem | undefined> {
  try {
    let rawPosts = await fetchFromWp<any[]>(
      `/wp-json/wp/v2/posts?slug=${encodeURIComponent(slug)}&_embed=1&lang=${lang}&wpml_language=${lang}`
    );
    if (!Array.isArray(rawPosts) || rawPosts.length === 0) {
      rawPosts = await fetchFromWp<any[]>(
        `/wp-json/wp/v2/posts?slug=${encodeURIComponent(slug)}&_embed=1`
      );
    }
    if (Array.isArray(rawPosts) && rawPosts.length > 0) {
      return mapWpPostToPostItem(rawPosts[0], lang);
    }
  } catch (err) {
    console.warn(`[cms-api] getPostBySlug failed for ${slug}:`, err);
  }

  return mockPosts.find((p) => p.slug === slug);
}

export async function getPages(options?: { lang?: 'de' | 'pl' | 'en' }): Promise<PageItem[]> {
  const lang = options?.lang || 'de';
  try {
    let rawPages = await fetchFromWp<any[]>(
      `/wp-json/wp/v2/pages?per_page=50&_embed=1&lang=${lang}&wpml_language=${lang}`
    );
    if (!Array.isArray(rawPages) || rawPages.length === 0) {
      rawPages = await fetchFromWp<any[]>(`/wp-json/wp/v2/pages?per_page=50&_embed=1`);
    }
    if (Array.isArray(rawPages)) {
      return rawPages.map((p) => ({
        id: String(p.id),
        title: parseBilingualTitle(p.title?.rendered || '', lang),
        slug: p.slug,
        blocks: [
          {
            id: `text-${p.id}`,
            type: 'text',
            body: parseBilingualContent(p.content?.rendered || '', lang),
          },
        ],
      }));
    }
  } catch (err) {
    console.warn(`[cms-api] getPages failed:`, err);
  }

  return [];
}

export async function getPageBySlug(
  slug: string,
  lang: 'de' | 'pl' | 'en' = 'de'
): Promise<PageItem | undefined> {
  const leafSlug = slug.includes('/') ? slug.split('/').pop() || slug : slug;
  const candidates: string[] = [];

  if (lang === 'pl') {
    if (SLUG_MAPPING_DE_TO_PL[leafSlug]) candidates.push(SLUG_MAPPING_DE_TO_PL[leafSlug]);
    candidates.push(leafSlug);
    if (SLUG_MAPPING_EN_TO_DE[leafSlug] && SLUG_MAPPING_DE_TO_PL[SLUG_MAPPING_EN_TO_DE[leafSlug]]) {
      candidates.push(SLUG_MAPPING_DE_TO_PL[SLUG_MAPPING_EN_TO_DE[leafSlug]]);
    }
  } else if (lang === 'en') {
    if (SLUG_MAPPING_DE_TO_EN[leafSlug]) candidates.push(SLUG_MAPPING_DE_TO_EN[leafSlug]);
    candidates.push(leafSlug);
    if (SLUG_MAPPING_PL_TO_DE[leafSlug] && SLUG_MAPPING_DE_TO_EN[SLUG_MAPPING_PL_TO_DE[leafSlug]]) {
      candidates.push(SLUG_MAPPING_DE_TO_EN[SLUG_MAPPING_PL_TO_DE[leafSlug]]);
    }
  } else {
    if (SLUG_MAPPING_PL_TO_DE[leafSlug]) candidates.push(SLUG_MAPPING_PL_TO_DE[leafSlug]);
    if (SLUG_MAPPING_EN_TO_DE[leafSlug]) candidates.push(SLUG_MAPPING_EN_TO_DE[leafSlug]);
    candidates.push(leafSlug);
  }
  if (slug !== leafSlug) candidates.push(slug);

  const uniqueCandidates = [...new Set(candidates)];

  for (const cand of uniqueCandidates) {
    try {
      let rawPages = await fetchFromWp<any[]>(
        `/wp-json/wp/v2/pages?slug=${encodeURIComponent(cand)}&_embed=1&lang=${lang}&wpml_language=${lang}`
      );
      if (!Array.isArray(rawPages) || rawPages.length === 0) {
        rawPages = await fetchFromWp<any[]>(
          `/wp-json/wp/v2/pages?slug=${encodeURIComponent(cand)}&_embed=1`
        );
      }
      if (Array.isArray(rawPages) && rawPages.length > 0) {
        const p = rawPages[0];
        const parsedContent = parseBilingualContent(p.content?.rendered || '', lang);
        if (parsedContent && parsedContent.trim().length > 20) {
          return {
            id: String(p.id),
            title: parseBilingualTitle(p.title?.rendered || '', lang),
            slug: p.slug,
            blocks: [
              {
                id: `text-${p.id}`,
                type: 'text',
                body: parsedContent,
              },
            ],
          };
        }
      }
    } catch (err) {
      console.warn(`[cms-api] getPageBySlug failed for ${cand}:`, err);
    }
  }

  return undefined;
}

// Events & Books
export async function getEvents(): Promise<EventItem[]> {
  return mockEvents;
}

export async function getEventBySlug(slug: string): Promise<EventItem | undefined> {
  return mockEvents.find((e) => e.slug === slug);
}

export async function getBooks(): Promise<BookItem[]> {
  if (Array.isArray(staticBooks) && staticBooks.length > 0) {
    return staticBooks as BookItem[];
  }
  return mockBooks;
}

export async function getBookById(id: string): Promise<BookItem | undefined> {
  const books = await getBooks();
  return books.find((b) => b.id === id);
}
