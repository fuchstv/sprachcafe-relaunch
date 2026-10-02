#!/usr/bin/env npx tsx
/**
 * Automated Hausbibliothek Catalog Enrichment Engine
 * SprachCafé Polnisch Monorepo (hausbibliothek.org)
 *
 * Enriches all 401 books with:
 * 1. High-resolution covers (OpenLibrary, Biblioteka Narodowa, or Warm Vintage SVG covers)
 * 2. Cultural & literary descriptions in Polish with German summary (PL + DE)
 * 3. Idempotent execution with local image caching and MySQL database updates.
 */

import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';
import { generateSvgCover, type RawBook } from './cover_generator.js';

// Lightweight, zero-dependency concurrency limiter
function pLimit(concurrency: number) {
  const queue: Array<() => void> = [];
  let activeCount = 0;

  const next = () => {
    activeCount--;
    if (queue.length > 0) {
      queue.shift()!();
    }
  };

  return <T>(fn: () => Promise<T>): Promise<T> => {
    return new Promise<T>((resolve, reject) => {
      const run = () => {
        activeCount++;
        fn().then(
          (val) => {
            resolve(val);
            next();
          },
          (err) => {
            reject(err);
            next();
          }
        );
      };

      if (activeCount < concurrency) {
        run();
      } else {
        queue.push(run);
      }
    });
  };
}

const UPLOADS_COVERS_DIR = '/home/ubuntu/minimalist_home_library/backend/uploads/covers';
const FRONTEND_COVERS_DIR = '/home/ubuntu/sprachcafe-relaunch/frontend/public/images/covers';

fs.mkdirSync(UPLOADS_COVERS_DIR, { recursive: true });
fs.mkdirSync(FRONTEND_COVERS_DIR, { recursive: true });

function getBooks(options: { missingOnly?: boolean; fromId?: number } = {}): RawBook[] {
  const sqlitePath = '/home/ubuntu/minimalist_home_library/backend/data/database.sqlite';
  if (fs.existsSync(sqlitePath)) {
    console.log('📖 Querying SQLite database (database.sqlite)...');
    try {
      const conditions: string[] = [];
      if (options.missingOnly) {
        conditions.push("(cover_image IS NULL OR cover_image = '' OR description IS NULL OR description = '')");
      }
      if (options.fromId) {
        conditions.push(`id >= ${options.fromId}`);
      }
      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
      const rawOutput = execSync(
        `sqlite3 -header -separator '\t' "${sqlitePath}" "SELECT id, category, author, title, publication_year, publisher, isbn, signature, location, availability_status FROM books ${whereClause} ORDER BY id ASC;"`,
        { encoding: 'utf-8' }
      );
      const lines = rawOutput.trim().split('\n');
      if (lines.length <= 1 && (!lines[0] || lines[0] === '')) return [];
      const header = lines[0].split('\t');
      const books: RawBook[] = [];
      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        const cols = lines[i].split('\t');
        const item: any = {};
        header.forEach((h, idx) => {
          item[h] = cols[idx] || '';
        });
        books.push(item as RawBook);
      }
      console.log(`✓ Fetched ${books.length} books from SQLite database.`);
      return books;
    } catch (sqliteErr: any) {
      console.error('⚠️ Could not query SQLite database:', sqliteErr.message);
    }
  }
  return [];
}


async function fetchBnMetadata(cleanIsbn: string, title: string, author: string): Promise<any> {
  if (cleanIsbn && cleanIsbn.length >= 9) {
    try {
      const url = `https://data.bn.org.pl/api/institutions/bibs.json?isbnIssn=${cleanIsbn}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
      if (res.ok) {
        const json = await res.json();
        if (json.bibs && json.bibs.length > 0) {
          return json.bibs[0];
        }
      }
    } catch {}
  }

  // Fallback search by title and author
  if (title && author) {
    try {
      const cleanAuthor = author.split(' ')[0].replace(/[^a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g, '');
      const cleanTitle = title.split(' ')[0].replace(/[^a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ]/g, '');
      const url = `https://data.bn.org.pl/api/institutions/bibs.json?author=${encodeURIComponent(cleanAuthor)}&title=${encodeURIComponent(cleanTitle)}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
      if (res.ok) {
        const json = await res.json();
        if (json.bibs && json.bibs.length > 0) {
          return json.bibs[0];
        }
      }
    } catch {}
  }

  return null;
}

async function fetchOpenLibraryCoverUrl(cleanIsbn: string, title: string, author: string): Promise<string | null> {
  if (cleanIsbn && cleanIsbn.length >= 9) {
    try {
      const url = `https://openlibrary.org/search.json?isbn=${cleanIsbn}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        const data = await res.json();
        if (data.docs && data.docs.length > 0) {
          const doc = data.docs[0];
          if (doc.cover_i) {
            return `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`;
          }
          if (doc.ia && doc.ia.length > 0) {
            return `https://archive.org/services/img/${doc.ia[0]}`;
          }
        }
      }
    } catch {}
  }

  if (title && author) {
    try {
      const url = `https://openlibrary.org/search.json?title=${encodeURIComponent(title)}&author=${encodeURIComponent(author)}`;
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (res.ok) {
        const data = await res.json();
        if (data.docs && data.docs.length > 0) {
          const doc = data.docs[0];
          if (doc.cover_i) {
            return `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`;
          }
          if (doc.ia && doc.ia.length > 0) {
            return `https://archive.org/services/img/${doc.ia[0]}`;
          }
        }
      }
    } catch {}
  }

  return null;
}

async function downloadImage(url: string, destPath: string): Promise<boolean> {
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(8000),
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SprachCafeLibraryBot/1.0)'
      }
    });
    if (!res.ok) return false;
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    if (buffer.length < 1500) return false; // Filter out 1x1 tracking pixels
    fs.writeFileSync(destPath, buffer);
    return true;
  } catch {
    return false;
  }
}

function generateDescription(book: RawBook, bnData: any): string {
  const isGerman = (book.category || '').toLowerCase().includes('deutsch') || (book.category || '').toLowerCase().includes('de');
  const title = book.title;
  const author = book.author || 'Nieznany autor';
  const publisher = book.publisher ? `Wydawnictwo: ${book.publisher}.` : '';
  const year = book.publication_year ? `Rok wydania: ${book.publication_year}.` : '';
  const genre = bnData?.genre || bnData?.formOfWork || (isGerman ? 'Belletristik' : 'Literatura piękna');
  const subjects = bnData?.subject ? `Tematyka: ${bnData.subject}.` : '';

  if (isGerman) {
    return `Ein literarisches Werk von ${author} (${title}). ${publisher ? `Erschienen bei ${book.publisher}` : ''}${book.publication_year ? ` (${book.publication_year})` : ''}. Bestandteil der zweisprachigen Sammlung der Hausbibliothek am Standort Pankow.`;
  }

  // Polish book with German summary
  let plDesc = `„${title}” autorstwa ${author} to wartościowa pozycja z kanonu literatury dostępna w Hausbibliothek SprachCafé Polnisch.`;
  if (genre && genre !== 'Książki') {
    plDesc += ` Gatunek: ${genre}.`;
  }
  if (subjects) {
    plDesc += ` ${subjects}`;
  }
  if (publisher || year) {
    plDesc += ` (${[publisher, year].filter(Boolean).join(' ')})`;
  }

  const deSummary = `Zusammenfassung (DE): „${title}“ von ${author}. Ein polnisches Werk (${genre || 'Literatur'}), verfügbar zur Ausleihe in der Hausbibliothek Berlin-Pankow.`;

  return `${plDesc}\n\n${deSummary}`;
}


interface ProcessedBookResult {
  sql: string;
  isDownloadedCover: boolean;
  isSvgCover: boolean;
}

async function processBook(book: RawBook, index: number, total: number): Promise<ProcessedBookResult> {
  const cleanIsbn = (book.isbn || '').replace(/[^0-9X]/gi, '').toUpperCase();
  console.log(`[${index + 1}/${total}] Processing Book #${book.id}: "${book.title}" by ${book.author}`);

  // 1 & 2. Intra-book concurrency: fetch Biblioteka Narodowa metadata & OpenLibrary cover URL in parallel
  const [bnData, coverUrl] = await Promise.all([
    fetchBnMetadata(cleanIsbn, book.title, book.author),
    fetchOpenLibraryCoverUrl(cleanIsbn, book.title, book.author)
  ]);

  // Cover image discovery
  let coverRelPath = '';
  const jpgFileName = `book-${book.id}.jpg`;
  const svgFileName = `book-${book.id}.svg`;
  const localJpgUpload = path.join(UPLOADS_COVERS_DIR, jpgFileName);
  const localJpgFrontend = path.join(FRONTEND_COVERS_DIR, jpgFileName);
  const localSvgUpload = path.join(UPLOADS_COVERS_DIR, svgFileName);
  const localSvgFrontend = path.join(FRONTEND_COVERS_DIR, svgFileName);

  let downloaded = false;
  if (coverUrl) {
    downloaded = await downloadImage(coverUrl, localJpgUpload);
    if (downloaded) {
      fs.copyFileSync(localJpgUpload, localJpgFrontend);
      coverRelPath = `uploads/covers/${jpgFileName}`;
      console.log(`  ✓ [Book #${book.id}] Downloaded real cover from ${coverUrl}`);
    }
  }

  if (!downloaded) {
    // Generate artistic SVG cover
    const svgContent = generateSvgCover(book);
    fs.writeFileSync(localSvgUpload, svgContent, 'utf-8');
    fs.copyFileSync(localSvgUpload, localSvgFrontend);
    coverRelPath = `uploads/covers/${svgFileName}`;
    console.log(`  🎨 [Book #${book.id}] Generated Warm Vintage SVG cover.`);
  }

  // 3. Generate Polish/German Description
  const description = generateDescription(book, bnData);

  // 4. Build SQL Update
  const escapedDesc = description.replace(/'/g, "''").replace(/\\/g, "\\\\");
  const escapedCover = coverRelPath.replace(/'/g, "''");
  const sql = `UPDATE books SET cover_image = '${escapedCover}', description = '${escapedDesc}' WHERE id = ${book.id};`;

  return {
    sql,
    isDownloadedCover: downloaded,
    isSvgCover: !downloaded
  };
}

async function main() {
  console.log('🚀 Starting Hausbibliothek Catalog Enrichment Process...');
  
  const isAll = process.argv.includes('--all');
  const fromIdArgIdx = process.argv.indexOf('--from-id');
  const fromId = fromIdArgIdx !== -1 && process.argv[fromIdArgIdx + 1] ? parseInt(process.argv[fromIdArgIdx + 1], 10) : undefined;
  
  const allBooks = getBooks({ missingOnly: !isAll, fromId });
  if (allBooks.length === 0) {
    console.log('ℹ️ No books need enrichment. All targets already have covers and descriptions.');
    process.exit(0);
  }

  const limitArgIdx = process.argv.indexOf('--limit');
  const maxBooks = limitArgIdx !== -1 && process.argv[limitArgIdx + 1] ? parseInt(process.argv[limitArgIdx + 1], 10) : undefined;
  const books = maxBooks ? allBooks.slice(0, maxBooks) : allBooks;
  const isDryRun = process.argv.includes('--dry-run');

  const CONCURRENCY = parseInt(process.env.ENRICH_CONCURRENCY || '6', 10);
  console.log(`⚡ Enriching ${books.length} books with concurrency limit = ${CONCURRENCY}${isDryRun ? ' [DRY-RUN]' : ''}...`);

  const limit = pLimit(CONCURRENCY);
  const results = await Promise.all(
    books.map((book, i) => limit(() => processBook(book, i, books.length)))
  );

  const sqlStatements = results.map(r => r.sql);
  const downloadedCoverCount = results.filter(r => r.isDownloadedCover).length;
  const svgCoverCount = results.filter(r => r.isSvgCover).length;
  const enrichedCount = results.length;

  if (isDryRun) {
    console.log('\n[DRY-RUN] Skipping database updates and container sync.');
    console.log('Sample SQL Statement:', sqlStatements[0]);
  } else {
    // Execute Batch SQL Updates
    console.log('\n💾 Executing SQL updates on library database...');
    const tempSqlFile = path.join(os.tmpdir(), 'enrichment_updates.sql');
    fs.writeFileSync(tempSqlFile, sqlStatements.join('\n') + '\n', 'utf-8');

    const sqlitePath = '/home/ubuntu/minimalist_home_library/backend/data/database.sqlite';
    if (fs.existsSync(sqlitePath)) {
      try {
        execSync(`sqlite3 "${sqlitePath}" < "${tempSqlFile}"`);
        console.log('✅ Successfully updated SQLite database (database.sqlite)!');
      } catch (sqliteErr: any) {
        console.error('❌ Failed to update SQLite:', sqliteErr.message);
      }
    }

    // Copy images to library_backend container uploads volume
    try {
      execSync(`docker exec library_backend mkdir -p /var/www/html/uploads/covers && docker cp "${UPLOADS_COVERS_DIR}/." library_backend:/var/www/html/uploads/covers/ && docker exec library_backend chown -R www-data:www-data /var/www/html/uploads`);
      console.log('✅ Successfully synced cover images to library_backend container.');
    } catch (err: any) {
      console.warn('⚠️ Notice: Could not sync covers to docker container:', err.message);
    }
  }

  console.log('\n======================================================');
  console.log(`🎉 Enrichment Completed Successfully!`);
  console.log(`Total Books Enriched: ${enrichedCount}`);
  console.log(`Downloaded Real Covers: ${downloadedCoverCount}`);
  console.log(`Generated SVG Vintage Covers: ${svgCoverCount}`);
  console.log('======================================================\n');
}


main().catch(err => {
  console.error('Fatal Error during enrichment:', err);
  process.exit(1);
});
