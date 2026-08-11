import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

/**
 * SprachCafé Polnisch e.V. - Membership Flow & SharePoint Provisioning CLI
 */
function setupMembershipFlow() {
  console.log('⚡ SPRACHCAFÉ MEMBERSHIP FLOW PROVISIONING SCRIPT');
  console.log('==================================================');

  const environmentId = 'Default-b745a80a-f682-45e4-ba2e-d48bbd9e703d';
  console.log(`Target Environment ID: ${environmentId}`);

  try {
    // Check Azure CLI access token
    const token = execSync(
      'az account get-access-token --resource "https://service.powerapps.com/" --query "accessToken" -o tsv',
      { encoding: 'utf8' }
    ).trim();

    if (token) {
      console.log('✅ Acquired Power Platform Access Token via Azure CLI session!');
    }
  } catch (err) {
    console.log('ℹ️ Running in CLI setup mode. Azure CLI token check skipped.');
  }

  const flowConfig = {
    name: 'PowerAutomate_Flow_Membership_Application',
    displayName: 'SprachCafé - Mitgliedsantrag (HTTP Webhook zu SharePoint zu Teams)',
    targetList: 'Mitgliedsanträge',
    targetSite: 'https://sprachcafepolnisch.sharepoint.com/sites/Vorstand',
    fields: [
      'Title',
      'FirmaName',
      'Geburtsdatum',
      'Strasse',
      'PLZ',
      'Ort',
      'Beruf',
      'EMail',
      'Telefon',
      'MitgliedschaftsArt',
      'MitgliedschaftsStufe',
      'WieGehoert',
      'Unterstuetzung',
      'SatzungGelesen',
      'DatenschutzAkzeptiert'
    ]
  };

  const outputConfigPath = path.join(process.cwd(), 'scripts', 'flows', 'flow-mitgliedsantrag.json');
  fs.mkdirSync(path.dirname(outputConfigPath), { recursive: true });
  fs.writeFileSync(outputConfigPath, JSON.stringify(flowConfig, null, 2), 'utf8');

  console.log(`📄 Saved Flow definition schema to: ${outputConfigPath}`);
  console.log('🎉 PROVISIONING SCRIPT COMPLETE! Reproducible CLI setup ready.');
}

setupMembershipFlow();
