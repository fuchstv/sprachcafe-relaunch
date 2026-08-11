#!/usr/bin/env npx tsx
/**
 * CLI Power Automate Flow Management Script (Phase R3.2)
 * SprachCafé Relaunch Monorepo
 *
 * Deploys Power Automate flows for Team, Ausstellungen, and Laden-Artikel
 * directly to the SprachCafé Polnisch e.V. Power Platform environment via Azure CLI (az rest).
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const scriptDir = path.dirname(new URL(import.meta.url).pathname);
const FLOWS_DIR = path.resolve(scriptDir, 'flows');
const DEFAULT_ENV_ID = 'Default-b745a80a-f682-45e4-ba2e-d48bbd9e703d';
const FLOW_API_ENDPOINT = 'https://germany.api.flow.microsoft.com';

function runAzRest(method: string, url: string, body?: object): any {
  let bodyFlag = '';
  let tempJsonPath = '';
  if (body) {
    tempJsonPath = path.join(scriptDir, `temp_payload_${Date.now()}.json`);
    fs.writeFileSync(tempJsonPath, JSON.stringify(body), 'utf-8');
    bodyFlag = `--body "@${tempJsonPath}"`;
  }

  const cmd = `az rest --method ${method} --uri "${url}" --resource https://service.powerapps.com/ ${bodyFlag}`;
  try {
    const output = execSync(cmd, { encoding: 'utf-8' });
    if (tempJsonPath && fs.existsSync(tempJsonPath)) fs.unlinkSync(tempJsonPath);
    return JSON.parse(output || '{}');
  } catch (err: any) {
    if (tempJsonPath && fs.existsSync(tempJsonPath)) fs.unlinkSync(tempJsonPath);
    console.error(`❌ REST API Result [${method} ${url}]:`, err.stdout || err.message);
    return null;
  }
}

async function main() {
  const args = process.argv.slice(2);
  const environmentId = args[0] || DEFAULT_ENV_ID;

  console.log('⚡ SPRACHCAFÉ POWER AUTOMATE AZURE CLI DEPLOYMENT TOOL');
  console.log(`Environment ID: ${environmentId}`);

  // Step 1: Verify Azure CLI Login Status
  try {
    const accountOutput = execSync('az account show', { encoding: 'utf-8' });
    const account = JSON.parse(accountOutput);
    console.log(`✅ Authenticated User: ${account.user.name} (Tenant: ${account.tenantId})`);
  } catch (e) {
    console.error('❌ Azure CLI is not logged in. Run: az login --allow-no-subscriptions');
    process.exit(1);
  }

  // Step 2: List existing flows to prevent duplicates
  const listUrl = `${FLOW_API_ENDPOINT}/providers/Microsoft.ProcessSimple/environments/${environmentId}/flows?api-version=2016-11-01`;
  const existingFlows = runAzRest('get', listUrl);
  const existingNames = (existingFlows?.value || []).map((f: any) => f.properties?.displayName);

  // Step 3: Deploy Each Flow
  const files = fs.readdirSync(FLOWS_DIR).filter((f) => f.endsWith('.json'));

  for (const file of files) {
    const filePath = path.join(FLOWS_DIR, file);
    const flowJson = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    console.log(`\n🚀 Deploying Flow: [${flowJson.displayName}]...`);

    if (existingNames.includes(flowJson.displayName)) {
      console.log(`ℹ️ Flow [${flowJson.displayName}] is already deployed in tenant.`);
      continue;
    }

    const createUrl = `${FLOW_API_ENDPOINT}/providers/Microsoft.ProcessSimple/environments/${environmentId}/flows?api-version=2016-11-01`;

    const payload = {
      properties: {
        displayName: flowJson.displayName,
        state: 'Started',
        definition: flowJson.definition,
      },
    };

    const res = runAzRest('post', createUrl, payload);
    if (res && res.name) {
      console.log(`✨ Successfully Deployed Flow [${res.properties?.displayName || flowJson.displayName}]!`);
      console.log(`   Flow Name: ${res.name}`);
      console.log(`   State: ${res.properties?.state || 'Started'}`);
    }
  }

  console.log('\n🎉 REDAKTION FLOWS CHECKED & DEPLOYED VIA AZURE CLI!');
}

main().catch((err) => {
  console.error('❌ Fatal deployment error:', err);
  process.exit(1);
});
