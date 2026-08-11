#!/usr/bin/env npx tsx
/**
 * Power Automate Flow Packaging Script
 * Packs the 3 JSON flow definitions into a Power Automate compatible ZIP package
 * for 1-click import into Microsoft 365.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const scriptDir = path.dirname(new URL(import.meta.url).pathname);
const repoRoot = path.resolve(scriptDir, '..');
const flowsDir = path.join(scriptDir, 'flows');
const outputZip = path.join(repoRoot, 'docs/sprachcafe-m365-flows-package.zip');

async function main() {
  console.log('📦 PACKAGING POWER AUTOMATE FLOWS FOR M365 IMPORT...');

  // Create temporary directory structure for Power Automate Package
  const tempDir = path.join(scriptDir, 'temp_package');
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
  fs.mkdirSync(tempDir, { recursive: true });

  const manifest = {
    schema: "1.0.0.0",
    details: {
      displayName: "SprachCafé Polnisch e.V. - Redaktion Workflows (Team, Ausstellungen, Laden)",
      description: "Automatische Content-PRs für beta.sprachcafe-polnisch.org aus Microsoft Forms"
    },
    resources: {
      "flow-team": {
        type: "Microsoft.Flow/flows",
        suggestedCreationType: "Update",
        details: { displayName: "SprachCafé - Redaktion Team-Mitglied" },
        configurableBy: "User"
      },
      "flow-exhibitions": {
        type: "Microsoft.Flow/flows",
        suggestedCreationType: "Update",
        details: { displayName: "SprachCafé - Redaktion Ausstellung" },
        configurableBy: "User"
      },
      "flow-shop": {
        type: "Microsoft.Flow/flows",
        suggestedCreationType: "Update",
        details: { displayName: "SprachCafé - Redaktion Laden-Artikel" },
        configurableBy: "User"
      }
    }
  };

  fs.writeFileSync(path.join(tempDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  fs.copyFileSync(path.join(flowsDir, 'flow-team.json'), path.join(tempDir, 'flow-team.json'));
  fs.copyFileSync(path.join(flowsDir, 'flow-exhibitions.json'), path.join(tempDir, 'flow-exhibitions.json'));
  fs.copyFileSync(path.join(flowsDir, 'flow-shop.json'), path.join(tempDir, 'flow-shop.json'));

  execSync(`python3 -m zipfile -c "${outputZip}" *`, { cwd: tempDir, stdio: 'inherit' });
  fs.rmSync(tempDir, { recursive: true, force: true });

  console.log(`✅ SUCCESS! Created ready-to-import Power Automate ZIP Package at:\n   ${outputZip}`);
}

main().catch(err => {
  console.error('❌ Error packaging flows:', err);
  process.exit(1);
});
