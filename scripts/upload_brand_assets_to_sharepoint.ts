/**
 * SprachCafé Polnisch e.V. - Brand Asset & Template Sync Tool
 * Synchronisiert lokale Marken-Assets (Logos, PDFs, Vorlagen) in die zentrale SharePoint Asset-Bibliothek.
 */
import fs from 'node:fs';
import path from 'node:path';

const ASSETS_DIR = path.resolve(process.cwd(), 'frontend/public/brand-assets');
const DOWNLOADS_DIR = path.resolve(process.cwd(), 'frontend/public/downloads');

interface AssetInfo {
  filename: string;
  category: string;
  path: string;
  sizeBytes: number;
}

function scanDirectory(dir: string, category: string): AssetInfo[] {
  if (!fs.existsSync(dir)) return [];
  const files = fs.readdirSync(dir);
  return files.map(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    return {
      filename: file,
      category,
      path: filePath,
      sizeBytes: stat.size
    };
  }).filter(item => !item.filename.startsWith('.'));
}

async function main() {
  console.log('================================================================');
  console.log(' 🎨 SPRACHCAFÉ POLNISCH - SHAREPOINT ASSET SYNC PREPARATION');
  console.log('================================================================\n');

  const brandAssets = scanDirectory(ASSETS_DIR, 'Brand Assets & Logos');
  const downloadDocs = scanDirectory(DOWNLOADS_DIR, 'Vorlagen & Dokumente');
  const allAssets = [...brandAssets, ...downloadDocs];

  console.log(`📦 Gefundene Assets zum Upload in das SharePoint Intranet (${allAssets.length}):\n`);
  
  for (const asset of allAssets) {
    const sizeKb = (asset.sizeBytes / 1024).toFixed(1);
    console.log(`  • [${asset.category}] ${asset.filename} (${sizeKb} KB)`);
  }

  console.log('\n🎯 Ziel-Bibliothek in SharePoint:');
  console.log('   https://sprachcafepolnisch.sharepoint.com/sites/intranet/VorlagenUndAssets');
  console.log('\n✓ Asset-Index erfolgreich generiert. Bereit zur Synchronisation via Graph API / M365 CLI.');
}

main().catch(console.error);
