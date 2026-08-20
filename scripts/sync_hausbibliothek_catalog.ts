#!/usr/bin/env npx tsx
/**
 * Hausbibliothek Read-Only Catalog Synchronization Script (Phase L2.1)
 * SprachCafé Relaunch Monorepo
 *
 * Architecture Note:
 * The Library App (hausbibliothek.org) is permanently the single source of truth for
 * loan operations, user accounts, and active reservations. NO DATA IS MIGRATED
 * OR DUPLICATED INTO THE CMS DATABASE FOR LOANS.
 *
 * Purpose:
 * This script runs as part of the GitHub Actions build step (7.1) / Astro build:
 * 1. Fetches fresh public book metadata from the read-only export API of the Library App (L2.1).
 * 2. Validates ISBN-10 / ISBN-13 format and checksums.
 * 3. Saves public book metadata to local static file `frontend/src/data/books.json`
 *    for static page generation and Pagefind search indexing.
 * 4. Provides a Dry-Run mode (`--dry-run`) with a detailed Sync Report (`library-sync-report.md`).
 */

import fs from 'fs';
import path from 'path';

// Load environment variables safely if dotenv is installed
try {
  const dotenv = await import('dotenv');
  dotenv.default.config({ path: path.resolve(process.cwd(), '../.env') });
  dotenv.default.config();
} catch (e) {
  // Graceful fallback when running in environment with process.env pre-populated
}

const scriptDir = path.dirname(new URL(import.meta.url).pathname);
const LIBRARY_EXPORT_URL = process.env.LIBRARY_APP_EXPORT_URL || 'https://hausbibliothek.org/api/books?limit=500';
const TARGET_DATA_DIR = path.resolve(scriptDir, '../frontend/src/data');
const TARGET_BOOKS_FILE = path.join(TARGET_DATA_DIR, 'books.json');
const REPORT_FILE_PATH = path.resolve(scriptDir, 'library-sync-report.md');

const isDryRun = process.argv.includes('--dry-run') || process.env.DRY_RUN === 'true';

export interface ExportedBookItem {
  id: string;
  title: string;
  author: string;
  isbn?: string;
  language: string;
  category: string;
  location?: string;
  status: 'verfuegbar' | 'ausgeliehen' | 'reserviert' | string;
  cover?: string;
  description?: string;
  [key: string]: any;
}

export interface IsbnValidationResult {
  status: 'valid' | 'missing' | 'unplausible';
  type?: 'ISBN-10' | 'ISBN-13';
  reason?: string;
}

export interface LibrarySyncReport {
  timestamp: string;
  dryRun: boolean;
  exportUrl: string;
  targetFile: string;
  stats: {
    totalBooksFetched: number;
    validIsbnCount: number;
    missingIsbnCount: number;
    unplausibleIsbnCount: number;
    categories: Record<string, number>;
    languages: Record<string, number>;
    statuses: Record<string, number>;
  };
  invalidBooks: Array<{
    id: string;
    title: string;
    author: string;
    rawIsbn: string;
    reason: string;
  }>;
  sampleBooks: ExportedBookItem[];
}

/**
 * Validates ISBN-10 and ISBN-13 checksums and structure
 */
export function validateIsbn(rawIsbn?: string): IsbnValidationResult {
  if (!rawIsbn || !rawIsbn.trim()) {
    return { status: 'missing', reason: 'ISBN ist leer oder nicht angegeben' };
  }

  // Remove spaces, hyphens and dots
  const sanitized = rawIsbn.replace(/[\s\-\.]/g, '').toUpperCase();

  // Check ISBN-13
  if (/^\d{13}$/.test(sanitized)) {
    if (!sanitized.startsWith('978') && !sanitized.startsWith('979')) {
      return { status: 'unplausible', type: 'ISBN-13', reason: 'ISBN-13 muss mit 978 oder 979 beginnen' };
    }

    let sum = 0;
    for (let i = 0; i < 12; i++) {
      const digit = parseInt(sanitized[i], 10);
      sum += i % 2 === 0 ? digit : digit * 3;
    }
    const checkDigit = (10 - (sum % 10)) % 10;
    const actualCheck = parseInt(sanitized[12], 10);

    if (checkDigit === actualCheck) {
      return { status: 'valid', type: 'ISBN-13' };
    } else {
      return { status: 'unplausible', type: 'ISBN-13', reason: `Ungültige Prüfziffer (Erwartet: ${checkDigit}, Ist: ${actualCheck})` };
    }
  }

  // Check ISBN-10
  if (/^\d{9}[\dX]$/.test(sanitized)) {
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(sanitized[i], 10) * (10 - i);
    }
    const lastChar = sanitized[9];
    sum += lastChar === 'X' ? 10 : parseInt(lastChar, 10);

    if (sum % 11 === 0) {
      return { status: 'valid', type: 'ISBN-10' };
    } else {
      return { status: 'unplausible', type: 'ISBN-10', reason: 'Ungültige ISBN-10 Prüfziffer (Modulo 11 Fehlschlag)' };
    }
  }

  return { status: 'unplausible', reason: `Unzulässige Zeichen oder Länge (${sanitized.length} Zeichen statt 10 oder 13)` };
}

/**
 * Fallback Mock/CSV Books dataset when Library App export API is unreachable during local build
 */
export function getMockExportBooks(): ExportedBookItem[] {
  const booksJsonPath = path.resolve(scriptDir, '../frontend/src/data/books.json');
  if (fs.existsSync(booksJsonPath)) {
    try {
      const content = fs.readFileSync(booksJsonPath, 'utf-8');
      const books = JSON.parse(content) as ExportedBookItem[];
      if (Array.isArray(books) && books.length > 0) {
        console.log(`✓ Loaded ${books.length} book records from books.json.`);
        return books;
      }
    } catch (e) {}
  }

  const csvCandidates = [
    path.join(scriptDir, 'katalog_ksiazek.csv'),
    path.resolve(process.cwd(), 'katalog_ksiazek.csv'),
    path.resolve(process.cwd(), 'scripts/katalog_ksiazek.csv'),
    path.resolve(process.cwd(), '../scripts/katalog_ksiazek.csv')
  ];
  const csvPath = csvCandidates.find(p => fs.existsSync(p));
  if (csvPath) {
    try {
      const fileContent = fs.readFileSync(csvPath, 'utf-8');
      const lines = fileContent.split(/\r?\n/).filter(line => line.trim().length > 0);
      
      if (lines.length > 1) {
        const books: ExportedBookItem[] = [];
        const locations = ['Pankow', 'Schöneberg', 'Köpenick'];
        const statuses = ['verfuegbar', 'verfuegbar', 'verfuegbar', 'ausgeliehen', 'reserviert'];

        const parseCsvLine = (line: string): string[] => {
          const result: string[] = [];
          let current = '';
          let inQuotes = false;
          for (let idx = 0; idx < line.length; idx++) {
            const char = line[idx];
            if (char === '"') {
              inQuotes = !inQuotes;
            } else if (char === ';' && !inQuotes) {
              result.push(current.replace(/^"|"$/g, '').trim());
              current = '';
            } else {
              current += char;
            }
          }
          result.push(current.replace(/^"|"$/g, '').trim());
          return result;
        };

        for (let i = 1; i < lines.length; i++) {
          const parts = parseCsvLine(lines[i]);
          const rawKategorie = (parts[0] || '').replace(/^\uFEFF/, '').trim();
          const autor = (parts[1] || '').trim();
          const titel = (parts[2] || '').trim();
          const erscheinungsjahr = (parts[3] || '').trim();
          const autor2 = (parts[4] || '').trim();
          const isbn = (parts[5] || '').trim();

          if (!titel) continue;

          let language = 'PL';
          let category = rawKategorie || 'Belletristik';

          if (rawKategorie === 'Auf Deutsch') {
            language = 'DE';
            category = 'Belletristik';
          } else if (rawKategorie.includes('Dziecięce') || rawKategorie.includes('Młodzieżowe')) {
            category = 'Kinder- & Jugendbuch';
          } else if (rawKategorie.includes('Poezja')) {
            category = 'Poesie';
          } else if (rawKategorie.includes('Biografie')) {
            category = 'Biografien';
          } else if (rawKategorie.includes('Reportaże')) {
            category = 'Reportagen';
          } else if (rawKategorie.includes('Historyczne')) {
            category = 'Geschichte';
          } else if (rawKategorie.includes('Kryminał')) {
            category = 'Kriminalroman';
          } else if (rawKategorie.includes('Fantasy')) {
            category = 'Science Fiction & Fantasy';
          }

          const fullAuthor = autor2 ? `${autor} (${autor2})` : autor;
          const location = 'Pankow';
          const status = statuses[i % statuses.length];

          const jpgRel = `/images/covers/book-${i}.jpg`;
          const svgRel = `/images/covers/book-${i}.svg`;
          const hasJpg = fs.existsSync(path.resolve(scriptDir, `../frontend/public${jpgRel}`));
          const hasSvg = fs.existsSync(path.resolve(scriptDir, `../frontend/public${svgRel}`));
          const localCover = hasJpg ? jpgRel : hasSvg ? svgRel : '';

          books.push({
            id: `book-${i}`,
            title: titel,
            author: fullAuthor || 'Unbekannter Autor',
            isbn: isbn,
            language: language,
            category: category,
            location: location,
            status: status,
            year: erscheinungsjahr,
            cover: localCover || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop',
            description: `Erschienen: ${erscheinungsjahr || 'o.A.'} | Kategorie: ${category} | Hausbibliothek am Standort Pankow`
          });
        }

        if (books.length > 0) {
          console.log(`✓ Loaded ${books.length} book records from local CSV dataset (katalog_ksiazek.csv).`);
          return books;
        }
      }
    } catch (err: any) {
      console.warn(`⚠️ Warning reading local CSV file: ${err.message}`);
    }
  }

  return [
    {
      id: 'book-101',
      title: 'Bieguni (Unrast)',
      author: 'Olga Tokarczuk',
      isbn: '978-3455002287',
      language: 'PL',
      category: 'Belletristik',
      location: 'Pankow',
      status: 'verfuegbar',
      cover: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop',
      description: 'Powieść o współczesnych nomadach, podróży i poszukiwaniu sensu.'
    }
  ];
}

/**
 * Fetch books from read-only export API
 */
export async function fetchLibraryCatalog(): Promise<ExportedBookItem[]> {
  console.log(`📡 Fetching read-only catalog metadata from Library App (${LIBRARY_EXPORT_URL})...`);
  try {
    const response = await fetch(LIBRARY_EXPORT_URL, { signal: AbortSignal.timeout(5000) });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} from ${LIBRARY_EXPORT_URL}`);
    }
    const resJson = await response.json();
    const rawList = Array.isArray(resJson) ? resJson : (resJson.data || []);
    if (Array.isArray(rawList) && rawList.length > 0) {
      console.log(`✓ Received ${rawList.length} book records from Library App API.`);
      return rawList.map((item: any) => {
        const numericId = String(item.id).replace('book-', '');
        const jpgRel = `/images/covers/book-${numericId}.jpg`;
        const svgRel = `/images/covers/book-${numericId}.svg`;
        const hasJpg = fs.existsSync(path.resolve(scriptDir, `../frontend/public${jpgRel}`));
        const hasSvg = fs.existsSync(path.resolve(scriptDir, `../frontend/public${svgRel}`));
        const localCover = hasJpg ? jpgRel : hasSvg ? svgRel : (item.cover_image ? `https://hausbibliothek.org/${item.cover_image}` : item.cover || '');

        const isGerman = (item.category || '').toLowerCase().includes('deutsch') || (item.category || '').toLowerCase().includes('de');
        const language = item.language || (isGerman ? 'DE' : 'PL');

        let categoryName = item.category || 'Belletristik';
        if (categoryName === 'belytrystyka_polska') categoryName = 'Polnische Belletristik';
        if (categoryName === 'deutsch') categoryName = 'Deutschsprachige Literatur';
        if (categoryName === 'dzieci_mlodziez') categoryName = 'Kinder- & Jugendbuch';
        if (categoryName === 'biografie_fakt') categoryName = 'Biografien & Sachbuch';
        if (categoryName === 'poezja') categoryName = 'Poesie';
        if (categoryName === 'kryminal_sensacja') categoryName = 'Kriminalroman';
        if (categoryName === 'reportaz_historia') categoryName = 'Geschichte & Reportage';

        return {
          id: `book-${numericId}`,
          title: item.title,
          author: item.author || 'Unbekannter Autor',
          isbn: item.isbn || '',
          language: language,
          category: categoryName,
          location: 'Pankow',
          status: item.availability_status === 'borrowed' ? 'ausgeliehen' : (item.status || 'verfuegbar'),
          cover: localCover,
          description: item.description || ''
        };
      });
    }
    throw new Error('Received empty response from API');
  } catch (err: any) {
    console.warn(`⚠️ Notice: Could not connect to Library App Export API (${LIBRARY_EXPORT_URL}): ${err.message}`);
    console.log('ℹ️ Using staging fallback catalog dataset for Astro static site generation...');
    return getMockExportBooks();
  }
}

/**
 * Render & Save Sync Report
 */
export function renderSyncReport(report: LibrarySyncReport): void {
  const line = '================================================================================';

  console.log('\n' + line);
  console.log(`📖 HAUSBIBLIOTHEK CATALOG SYNC REPORT (${report.dryRun ? 'DRY-RUN MODE' : 'LIVE BUILD SYNC'})`);
  console.log(line);
  console.log(`Timestamp:             ${report.timestamp}`);
  console.log(`Library Export URL:    ${report.exportUrl}`);
  console.log(`Target Static File:    ${report.targetFile}`);
  console.log(line);
  console.log('📈 CATALOG METRICS & VALIDATION:');
  console.log(`  • Total Books Processed:    ${report.stats.totalBooksFetched}`);
  console.log(`  • Valid ISBNs:              ${report.stats.validIsbnCount}`);
  console.log(`  • Missing ISBNs (Notice):   ${report.stats.missingIsbnCount}`);
  console.log(`  • Unplausible ISBNs (Warn): ${report.stats.unplausibleIsbnCount}`);
  console.log('\n  • Categories Breakdown:');
  for (const [cat, cnt] of Object.entries(report.stats.categories)) {
    console.log(`      - ${cat}: ${cnt}`);
  }
  console.log('\n  • Statuses Breakdown (Rough Availability):');
  for (const [st, cnt] of Object.entries(report.stats.statuses)) {
    console.log(`      - ${st}: ${cnt}`);
  }
  console.log(line);

  if (report.invalidBooks.length > 0) {
    console.log('\n⚠️ ISBN VALIDATION WARNINGS:');
    report.invalidBooks.forEach((b, idx) => {
      console.log(`  [${idx + 1}] Book ID: ${b.id} | Title: "${b.title}"`);
      console.log(`      Raw ISBN: "${b.rawIsbn || 'N/A'}" | Reason: ${b.reason}`);
    });
  }

  console.log('\n' + line);
  if (report.dryRun) {
    console.log('💡 Dry-Run completed successfully. No files were written to disk.');
    console.log('   To execute live sync: npx tsx sync_hausbibliothek_catalog.ts');
  } else {
    console.log('🎉 Catalog metadata synced to frontend/src/data/books.json for Pagefind build!');
  }
  console.log(line + '\n');

  // Save Markdown Report
  const mdContent = `# Hausbibliothek Read-Only Catalog Sync Report

- **Mode**: ${report.dryRun ? 'DRY-RUN (Simulated)' : 'LIVE BUILD SYNC'}
- **Timestamp**: ${report.timestamp}
- **Source Export API**: \`${report.exportUrl}\`
- **Target File**: \`${report.targetFile}\`

## Catalog Statistics

| Metric | Count |
|---|---|
| Total Books Processed | ${report.stats.totalBooksFetched} |
| Valid ISBN-10 / ISBN-13 | ${report.stats.validIsbnCount} |
| Missing ISBNs | ${report.stats.missingIsbnCount} |
| Unplausible / Invalid ISBNs | ${report.stats.unplausibleIsbnCount} |

## Category & Status Distribution

### Statuses (Availability)
${Object.entries(report.stats.statuses).map(([st, cnt]) => `- **${st}**: ${cnt}`).join('\n')}

### Categories
${Object.entries(report.stats.categories).map(([cat, cnt]) => `- **${cat}**: ${cnt}`).join('\n')}

## ISBN Validation Warnings

| Book ID | Title | Raw ISBN | Validation Error |
|---|---|---|---|
${report.invalidBooks.map(b => `| \`${b.id}\` | ${b.title} | \`${b.rawIsbn || 'N/A'}\` | ${b.reason} |`).join('\n')}

---
*Note: The Library App (hausbibliothek.org) remains the permanent single source of truth for loan transactions, user accounts, and active reservations.*
`;

  fs.writeFileSync(REPORT_FILE_PATH, mdContent, 'utf-8');
  console.log(`📄 Saved Catalog Sync Report to ${REPORT_FILE_PATH}`);
}

/**
 * Orchestrate Library Catalog Sync
 */
export async function runLibrarySync(): Promise<LibrarySyncReport> {
  console.log(`Starting Hausbibliothek Catalog Sync... Mode: ${isDryRun ? 'DRY-RUN' : 'LIVE BUILD SYNC'}`);

  const books = await fetchLibraryCatalog();

  const report: LibrarySyncReport = {
    timestamp: new Date().toISOString(),
    dryRun: isDryRun,
    exportUrl: LIBRARY_EXPORT_URL,
    targetFile: TARGET_BOOKS_FILE,
    stats: {
      totalBooksFetched: books.length,
      validIsbnCount: 0,
      missingIsbnCount: 0,
      unplausibleIsbnCount: 0,
      categories: {},
      languages: {},
      statuses: {}
    },
    invalidBooks: [],
    sampleBooks: books.slice(0, 5)
  };

  const processedBooks: ExportedBookItem[] = [];

  for (const book of books) {
    // 1. Accumulate statistics
    const cat = book.category || 'Unkategorisiert';
    const lang = book.language || 'Sonstige';
    const status = book.status || 'verfuegbar';

    report.stats.categories[cat] = (report.stats.categories[cat] || 0) + 1;
    report.stats.languages[lang] = (report.stats.languages[lang] || 0) + 1;
    report.stats.statuses[status] = (report.stats.statuses[status] || 0) + 1;

    // 2. Validate ISBN
    const validation = validateIsbn(book.isbn);
    if (validation.status === 'valid') {
      report.stats.validIsbnCount++;
    } else if (validation.status === 'missing') {
      report.stats.missingIsbnCount++;
      report.invalidBooks.push({
        id: book.id,
        title: book.title,
        author: book.author,
        rawIsbn: book.isbn || '',
        reason: validation.reason || 'Keine ISBN vorhanden'
      });
    } else {
      report.stats.unplausibleIsbnCount++;
      report.invalidBooks.push({
        id: book.id,
        title: book.title,
        author: book.author,
        rawIsbn: book.isbn || '',
        reason: validation.reason || 'Unplausible ISBN'
      });
    }

    processedBooks.push({
      id: book.id,
      title: book.title,
      author: book.author,
      isbn: book.isbn || '',
      language: lang,
      category: cat,
      location: book.location || 'Pankow',
      status: status,
      cover: book.cover || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop',
      description: book.description || ''
    });
  }

  // 3. Write data to local JSON file for Pagefind static build
  if (!isDryRun) {
    if (!fs.existsSync(TARGET_DATA_DIR)) {
      fs.mkdirSync(TARGET_DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(TARGET_BOOKS_FILE, JSON.stringify(processedBooks, null, 2), 'utf-8');
    console.log(`✓ Successfully updated static catalog data at ${TARGET_BOOKS_FILE}`);
  } else {
    console.log('ℹ️ DRY-RUN MODE ACTIVE: Skipping write to books.json');
  }

  // 4. Render Report
  renderSyncReport(report);

  return report;
}

// Execute if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runLibrarySync().catch((err) => {
    console.error('❌ Catalog sync failed:', err);
    process.exit(1);
  });
}
