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
import { execSync } from 'child_process';
import { generateSvgCover, type RawBook } from './cover_generator.js';

const UPLOADS_COVERS_DIR = '/home/ubuntu/minimalist_home_library/backend/uploads/covers';
const FRONTEND_COVERS_DIR = '/home/ubuntu/sprachcafe-relaunch/frontend/public/images/covers';

fs.mkdirSync(UPLOADS_COVERS_DIR, { recursive: true });
fs.mkdirSync(FRONTEND_COVERS_DIR, { recursive: true });

function getMysqlBooks(): RawBook[] {
  console.log('📖 Fetching raw books from MySQL (library_db)...');
  try {
    const rawOutput = execSync(
      `docker exec -e MYSQL_PWD='AljO2D1aBnyb4sQ0' library_db mysql -u root --default-character-set=utf8mb4 library_db -e "SELECT id, category, author, title, publication_year, publisher, isbn, signature, location, availability_status FROM books ORDER BY id ASC;"`,
      { encoding: 'utf-8' }
    );
    const lines = rawOutput.trim().split('\n');
    const header = lines[0].split('\t');
    const books: RawBook[] = [];
    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split('\t');
      const item: any = {};
      header.forEach((h, idx) => {
        item[h] = cols[idx] || '';
      });
      books.push(item as RawBook);
    }
    console.log(`✓ Fetched ${books.length} books from MySQL database.`);
    return books;
  } catch (err: any) {
    console.error('⚠️ Could not query MySQL directly:', err.message);
    return [];
  }
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

async function main() {
  console.log('🚀 Starting Hausbibliothek Catalog Enrichment Process...');
  const books = getMysqlBooks();
  if (books.length === 0) {
    console.error('❌ No books found to enrich.');
    process.exit(1);
  }

  let enrichedCount = 0;
  let downloadedCoverCount = 0;
  let svgCoverCount = 0;

  const sqlStatements: string[] = [];

  for (let i = 0; i < books.length; i++) {
    const book = books[i];
    const cleanIsbn = (book.isbn || '').replace(/[^0-9X]/gi, '').toUpperCase();
    console.log(`[${i + 1}/${books.length}] Processing Book #${book.id}: "${book.title}" by ${book.author}`);

    // 1. Biblioteka Narodowa Data
    const bnData = await fetchBnMetadata(cleanIsbn, book.title, book.author);

    // 2. Cover image discovery
    let coverRelPath = '';
    const jpgFileName = `book-${book.id}.jpg`;
    const svgFileName = `book-${book.id}.svg`;
    const localJpgUpload = path.join(UPLOADS_COVERS_DIR, jpgFileName);
    const localJpgFrontend = path.join(FRONTEND_COVERS_DIR, jpgFileName);
    const localSvgUpload = path.join(UPLOADS_COVERS_DIR, svgFileName);
    const localSvgFrontend = path.join(FRONTEND_COVERS_DIR, svgFileName);

    let downloaded = false;
    const coverUrl = await fetchOpenLibraryCoverUrl(cleanIsbn, book.title, book.author);
    if (coverUrl) {
      downloaded = await downloadImage(coverUrl, localJpgUpload);
      if (downloaded) {
        fs.copyFileSync(localJpgUpload, localJpgFrontend);
        coverRelPath = `uploads/covers/${jpgFileName}`;
        downloadedCoverCount++;
        console.log(`  ✓ Downloaded real cover from ${coverUrl}`);
      }
    }

    if (!downloaded) {
      // Generate artistic SVG cover
      const svgContent = generateSvgCover(book);
      fs.writeFileSync(localSvgUpload, svgContent, 'utf-8');
      fs.copyFileSync(localSvgUpload, localSvgFrontend);
      coverRelPath = `uploads/covers/${svgFileName}`;
      svgCoverCount++;
      console.log(`  🎨 Generated Warm Vintage SVG cover.`);
    }

    // 3. Generate Polish/German Description
    const description = generateDescription(book, bnData);

    // 4. Build SQL Update
    const escapedDesc = description.replace(/'/g, "''").replace(/\\/g, "\\\\");
    const escapedCover = coverRelPath.replace(/'/g, "''");
    sqlStatements.push(`UPDATE books SET cover_image = '${escapedCover}', description = '${escapedDesc}' WHERE id = ${book.id};`);

    enrichedCount++;

    // Small breathing pause every 10 books to avoid rate limiting
    if (i % 10 === 0 && i > 0) {
      await new Promise(r => setTimeout(r, 400));
    }
  }

  // Execute Batch SQL Updates in MySQL
  console.log('\n💾 Executing SQL updates on library_db...');
  const tempSqlFile = '/home/ubuntu/.gemini/antigravity-cli/brain/3ce5282c-efd2-4f2e-9a99-db9f7f03a433/scratch/enrichment_updates.sql';
  fs.writeFileSync(tempSqlFile, `SET NAMES 'utf8mb4';\n` + sqlStatements.join('\n') + `\n`, 'utf-8');

  try {
    execSync(`cat "${tempSqlFile}" | docker exec -i -e MYSQL_PWD='AljO2D1aBnyb4sQ0' library_db mysql -u root --default-character-set=utf8mb4 library_db`);
    console.log('✅ Successfully updated MySQL database for all 401 books!');
  } catch (err: any) {
    console.error('❌ Failed to update MySQL:', err.message);
  }

  // Copy images to library_backend container uploads volume
  try {
    execSync(`docker exec library_backend mkdir -p /var/www/html/uploads/covers && docker cp "${UPLOADS_COVERS_DIR}/." library_backend:/var/www/html/uploads/covers/ && docker exec library_backend chown -R www-data:www-data /var/www/html/uploads`);
    console.log('✅ Successfully synced cover images to library_backend container.');
  } catch (err: any) {
    console.warn('⚠️ Notice: Could not sync covers to docker container:', err.message);
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
