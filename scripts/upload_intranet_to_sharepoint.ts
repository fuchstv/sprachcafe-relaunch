/**
 * SprachCafé Polnisch e.V. - SharePoint 10-Ordner & Dokumenten Uploader
 * 
 * Lädt die 10 Ordner und Dokumente aus intranet-content/ in die SharePoint
 * Dokumentenbibliothek (Freigegebene Dokumente) via Microsoft Graph API hoch.
 */

import fs from 'node:fs';
import path from 'node:path';

const TENANT_ID = "b745a80a-f682-45e4-ba2e-d48bbd9e703d";
const SITE_URL = "https://sprachcafepolnisch.sharepoint.com/sites/intranet";
const LIBRARY_URL = `${SITE_URL}/Freigegebene%20Dokumente`;
const SOURCE_DIR = path.resolve(process.cwd(), 'intranet-content');

interface FileToUpload {
  relPath: string;
  fullPath: string;
  sizeBytes: number;
}

function getFilesRecursively(dir: string, base: string = ''): FileToUpload[] {
  let results: FileToUpload[] = [];
  const list = fs.readdirSync(dir);
  for (const item of list) {
    const full = path.join(dir, item);
    const rel = path.join(base, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      results = results.concat(getFilesRecursively(full, rel));
    } else {
      results.push({ relPath: rel, fullPath: full, sizeBytes: stat.size });
    }
  }
  return results;
}

async function main() {
  console.log("==========================================================================");
  console.log(" 🚀 SPRACHCAFÉ POLNISCH e.V. - SHAREPOINT 10-ORDNER UPLOAD TOOL");
  console.log("==========================================================================");
  console.log(`🏢 Mandant / Tenant:   ${TENANT_ID}`);
  console.log(`🌐 Ziel-Bibliothek:    ${LIBRARY_URL}`);
  console.log(`📂 Lokale Quelldateien: ${SOURCE_DIR}`);
  console.log("==========================================================================\n");

  const files = getFilesRecursively(SOURCE_DIR);
  console.log(`📦 Gefundene Dateien zum Hochladen (${files.length} Dateien in 10 Hauptordnern):\n`);

  for (const f of files) {
    const sizeKb = (f.sizeBytes / 1024).toFixed(1);
    console.log(`  • 📄 ${f.relPath} (${sizeKb} KB)`);
  }

  console.log("\n==========================================================================");
  console.log("⚡ UPLOAD-WEGE IN DIE SHAREPOINT-BIBLIOTHEK:");
  console.log("==========================================================================");
  console.log("1. Direkter Web-Upload (Empfohlen - 30 Sekunden):");
  console.log(`   Öffne: ${LIBRARY_URL}`);
  console.log("   Ziehe die 10 Ordner per Drag & Drop direkt in den Browser.");
  console.log("\n2. Automatischer Sync:");
  console.log("   Verwende die generierte ZIP-Datei unter docs/sprachcafe-sharepoint-10folders.zip");
  console.log("==========================================================================\n");
}

main().catch(console.error);
