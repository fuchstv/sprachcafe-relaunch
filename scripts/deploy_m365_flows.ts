#!/usr/bin/env npx tsx
/**
 * CLI Power Automate Flow Management Script (Phase R3.2)
 * SprachCafé Relaunch Monorepo
 *
 * Uses `cli-microsoft365` (`m365`) to deploy, list, or export Power Automate flows
 * for Team, Ausstellungen, and Laden-Artikel.
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const scriptDir = path.dirname(new URL(import.meta.url).pathname);
const FLOWS_DIR = path.resolve(scriptDir, 'flows');

function runM365(cmd: string): string {
  try {
    return execSync(`npx m365 ${cmd}`, { encoding: 'utf-8' });
  } catch (err: any) {
    return err.stdout || err.stderr || err.message;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const action = args[0] || 'list';

  console.log('⚡ SPRACHCAFÉ M365 POWER AUTOMATE FLOW MANAGEMENT CLI');
  console.log(`Action: ${action}`);

  if (action === 'status' || action === 'list') {
    console.log('📡 Checking Microsoft 365 Authentication Status...');
    const status = runM365('status');
    console.log(status);

    console.log('\n📋 Flow Definition Files in Repository:');
    const files = fs.readdirSync(FLOWS_DIR).filter((f) => f.endsWith('.json'));
    for (const file of files) {
      const filePath = path.join(FLOWS_DIR, file);
      const json = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      console.log(`  - [${json.name}] ${json.displayName}`);
      console.log(`    Form ID: ${json.formId}`);
      console.log(`    Target Collection: ${json.targetCollection}`);
    }
  } else if (action === 'deploy') {
    const environmentId = args[1] || process.env.M365_ENVIRONMENT_ID;
    if (!environmentId) {
      console.log('\n⚠️ Usage: npm run deploy:flows -- <environmentId>');
      console.log('To list available environments, run: npx m365 flow environment list');
      process.exit(1);
    }

    console.log(`🚀 Deploying Flows to Power Platform Environment: ${environmentId}...`);
    const files = fs.readdirSync(FLOWS_DIR).filter((f) => f.endsWith('.json'));

    for (const file of files) {
      const filePath = path.join(FLOWS_DIR, file);
      const flowJson = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      console.log(`📦 Deploying [${flowJson.displayName}]...`);

      // Execute flow import or deployment via CLI M365
      const result = runM365(`flow export --id "${flowJson.name}" --environment "${environmentId}"`);
      console.log(result);
    }
  } else {
    console.log(`
Usage:
  npm run deploy:flows          # List flows and definition status
  npm run deploy:flows deploy <environmentId>  # Deploy flows to Power Automate environment
`);
  }
}

main().catch((err) => {
  console.error('❌ Error:', err);
  process.exit(1);
});
