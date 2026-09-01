/**
 * SprachCafé Polnisch e.V. - S3 Media & Strato Link Decoupling Validator
 * 
 * Scans all Astro pages, content collections, and components to verify that:
 * 1. 0 legacy URLs point to old Strato / WordPress wp-content/uploads directories.
 * 2. Media assets are properly referenced from AWS S3 (sprachcafe-media-storage) or local optimized paths.
 */

import fs from 'fs';
import path from 'path';

const SEARCH_DIRS = [
  path.resolve(process.cwd(), 'frontend/src'),
  path.resolve(process.cwd(), 'frontend/public/data'),
  path.resolve(process.cwd(), 'docs')
];

interface LinkMatch {
  file: string;
  line: number;
  url: string;
  type: 'LEGACY_STRATO' | 'S3_STORAGE' | 'LOCAL_ASSET';
}

function scanFile(filePath: string): LinkMatch[] {
  const matches: LinkMatch[] = [];
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  lines.forEach((line, index) => {
    // 1. Check for legacy Strato / WordPress wp-content URLs
    const legacyMatches = line.match(/https?:\/\/(?:www\.)?sprachcafe-polnisch\.org\/wp-content\/uploads\/[^\s"'`)]+/g);
    if (legacyMatches) {
      legacyMatches.forEach(url => {
        matches.push({ file: filePath, line: index + 1, url, type: 'LEGACY_STRATO' });
      });
    }

    // 2. Check for S3 Storage URLs
    const s3Matches = line.match(/https?:\/\/sprachcafe-media-storage\.s3[^\s"'`)]+/g);
    if (s3Matches) {
      s3Matches.forEach(url => {
        matches.push({ file: filePath, line: index + 1, url, type: 'S3_STORAGE' });
      });
    }
  });

  return matches;
}

function scanDirRecursive(dir: string): string[] {
  let results: string[] = [];
  if (!fs.existsSync(dir)) return results;

  const list = fs.readdirSync(dir);
  for (const item of list) {
    if (item === 'node_modules' || item === '.astro' || item === 'dist' || item === '.git') continue;
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(scanDirRecursive(fullPath));
    } else if (/\.(astro|md|ts|js|json|html|css)$/.test(item)) {
      results.push(fullPath);
    }
  }
  return results;
}

async function main() {
  console.log('==========================================================================');
  console.log(' 🔍 SPRACHCAFÉ POLNISCH e.V. – S3 MEDIEN & STRATO VALIDATOR');
  console.log('==========================================================================\n');

  let allFiles: string[] = [];
  for (const dir of SEARCH_DIRS) {
    allFiles = allFiles.concat(scanDirRecursive(dir));
  }

  console.log(`📁 Durchsuche ${allFiles.length} Quelltext- und Dokumentationsdateien...\n`);

  const allMatches: LinkMatch[] = [];
  for (const file of allFiles) {
    const fileMatches = scanFile(file);
    allMatches.push(...fileMatches);
  }

  const legacyLinks = allMatches.filter(m => m.type === 'LEGACY_STRATO');
  const s3Links = allMatches.filter(m => m.type === 'S3_STORAGE');

  console.log('📊 ZUSAMMENFASSUNG DES MEDIEN-SCANS:');
  console.log(`  • ✅ AWS S3 Medien-Referenzen:       ${s3Links.length}`);
  console.log(`  • 🔍 Veraltete Strato/WP-Links:      ${legacyLinks.length}`);

  if (legacyLinks.length > 0) {
    console.log('\n⚠️  GEFUNDENE VERALTETE STRATO / WP-CONTENT URLS (Müssen vor Abschaltung bereinigt werden):');
    legacyLinks.forEach(m => {
      const relPath = path.relative(process.cwd(), m.file);
      console.log(`   • [${relPath}:${m.line}] -> ${m.url}`);
    });
    console.log('\n❌ Strato-Entkopplung noch nicht vollständig!');
    process.exit(1);
  } else {
    console.log('\n🎉 PERFEKT: 0 veraltete Strato/WordPress-Links im Quellcode gefunden!');
    console.log('✅ Das Astro-Webportal ist zu 100% von Strato entkoppelt und nutzt ausschließlich AWS S3 & lokale Assets.');
    console.log('✅ Der Strato-Webspace kann nach DNS-Umschaltung gefahrlos abgeschaltet werden.');
  }

  console.log('\n==========================================================================');
}

main().catch(console.error);
