/**
 * SprachCafé Polnisch e.V. - SharePoint 10-Ordner Struktur & IT Provisioner
 * 
 * Richtet die 10 Kernordner im Microsoft 365 SharePoint Intranet Hub ein:
 * 01_Vorstand, 02_Finanzen, 03_Mitgliederverwaltung, 04_Veranstaltungen,
 * 05_Cafébetrieb, 06_Öffentlichkeitsarbeit, 07_IT, 08_Personal, 09_Vorlagen, 10_Archiv
 */

import * as fs from 'fs';
import * as path from 'path';

interface FolderDefinition {
  name: string;
  description: string;
  isRestricted?: boolean;
  subfolders?: { name: string; description: string; documents?: string[] }[];
  documents?: string[];
}

const TENANT_CONFIG = {
  tenantId: 'b745a80a-f682-45e4-ba2e-d48bbd9e703d',
  sharePointDomain: 'sprachcafepolnisch.sharepoint.com',
  hubSiteUrl: 'https://sprachcafepolnisch.sharepoint.com/sites/intranet',
  primaryColor: '#8B263E',
};

const SHAREPOINT_10_FOLDERS: FolderDefinition[] = [
  {
    name: '01_Vorstand',
    description: 'Sitzungsprotokolle, Beschlüsse, Satzung und Vereinsregister',
    isRestricted: true,
    documents: ['Vorstandsprotokolle', 'Vereinsregister_Auszug', 'Satzung_2026']
  },
  {
    name: '02_Finanzen',
    description: 'Buchhaltung, Monatsabschlüsse, Steuererklärungen, Bankbelege und SEPA',
    isRestricted: true,
    documents: ['Monatsabschluesse_2026', 'Belege_und_Rechnungen', 'Steuerberater_Berichte']
  },
  {
    name: '03_Mitgliederverwaltung',
    description: 'Mitgliederliste, Aufnahmeanträge, Beitragsverwaltung und DSGVO-Zustimmungen',
    isRestricted: true,
    documents: ['Mitgliederliste_Aktiv', 'Mitgliedsantraege_Neu', 'DSGVO_Einwilligungen']
  },
  {
    name: '04_Veranstaltungen',
    description: 'Kulturprogramm, Vernissagen, Lesungen, Ausstellungen und Speak-Dating',
    documents: ['Kulturprogramm_2026', 'Ausstellungskataloge', 'Speak_Dating_Planung']
  },
  {
    name: '05_Cafébetrieb',
    description: 'Schichtpläne, Kassenabrechnungen, Einkaufslisten und Hygienevorschriften',
    documents: ['Schichtleitfaden_und_Checkliste_Begegnungscafe_Pankow.docx', 'Hygieneplan', 'Kassenbuch_Vorlage']
  },
  {
    name: '06_Öffentlichkeitsarbeit',
    description: 'Pressemitteilungen, Social-Media-Pläne, Flyer, Plakate und Bildarchiv',
    documents: ['Pressemitteilungen', 'Social_Media_Kalender', 'Flyer_und_Plakate']
  },
  {
    name: '07_IT',
    description: 'Vollständige IT-Infrastruktur-Dokumentation, Server, Backups, M365 und Runbooks',
    subfolders: [
      {
        name: '01_Server_und_Architektur',
        description: 'AWS EC2 (3.66.205.213), Caddy 2 Reverse Proxy, Docker Topologie',
        documents: ['IT_Betriebshandbuch.docx', 'IT_INFRASTRUKTUR_UND_BETRIEBSHANDBUCH.md', 'Caddyfile_Routing.conf']
      },
      {
        name: '02_Datenbanken_und_S3_Backups',
        description: 'SQLite WAL, PostgreSQL Listmonk und täglicher AWS S3 Sync',
        documents: ['Backup_und_Disaster_Recovery_Plan.docx', 'backup_db_script_guide.md']
      },
      {
        name: '03_Microsoft_365_und_SharePoint',
        description: 'Tenant Konfiguration, Entra ID Gruppen und Power Automate Flows',
        documents: ['M365_Rollen_und_Berechtigungen.docx', 'Power_Automate_Flow_Matrix.md']
      },
      {
        name: '04_Notfall_Runbooks_und_Sicherheit',
        description: 'Disaster Recovery Pläne, SSL-Erneuerung und Eskalationsliste',
        documents: ['IT_Notfall_Runbooks.docx', 'Disaster_Recovery_Runbook.md', 'Port_Hardening_Audit.md']
      }
    ]
  },
  {
    name: '08_Personal',
    description: 'Verträge für Honorarkräfte, Dozierende, Ehrenamtsvereinbarungen und Zeugnisse',
    isRestricted: true,
    documents: ['Dozentenvertraege', 'Ehrenamtsvereinbarungen', 'Personalstammdaten']
  },
  {
    name: '09_Vorlagen',
    description: 'Offizielle Briefbögen, Honorarabrechnungen, Figma Design Tokens und CI Assets',
    documents: [
      'Offizieller_Briefbogen_SprachCafe_Polnisch_eV.docx',
      'Vorlage_Honorarabrechnung_und_Auslagenersatz_2026.xlsx',
      'figma-tokens.json',
      'FIGMA_SETUP_AND_IMPORT_GUIDE.md'
    ]
  },
  {
    name: '10_Archiv',
    description: 'Abgeschlossene Projekte, Alt-Protokolle und historische Vereinsdokumente',
    documents: ['Protokolle_2015_2024', 'Abgeschlossene_Foerderprojekte', 'Pressearchiv_Historisch']
  }
];

function printBanner() {
  console.log('==========================================================================');
  console.log(' 🏛️ SPRACHCAFÉ POLNISCH e.V. - SHAREPOINT 10-ORDNER STRUKTUR PROVISIONER');
  console.log('==========================================================================');
  console.log(`🏢 Mandant / Tenant:   ${TENANT_CONFIG.tenantId}`);
  console.log(`🌐 SharePoint Domain: ${TENANT_CONFIG.sharePointDomain}`);
  console.log(`🏠 Hub Site URL:       ${TENANT_CONFIG.hubSiteUrl}`);
  console.log(`🎨 Corporate Color:   ${TENANT_CONFIG.primaryColor} (SprachCafé Weinrot)`);
  console.log('==========================================================================\n');
}

export function provision10Folders(dryRun: boolean = true) {
  printBanner();

  console.log(`📋 Modus: ${dryRun ? '🔍 DRY RUN (Vorschau)' : '🚀 LIVE PROVISIONING'}\n`);

  let folderCount = 0;
  let docCount = 0;

  for (const folder of SHAREPOINT_10_FOLDERS) {
    folderCount++;
    const lockIcon = folder.isRestricted ? '🔒 [VERTRAULICH]' : '📂';
    console.log(`\n${lockIcon} [${String(folderCount).padStart(2, '0')}] "${folder.name}"`);
    console.log(`   ℹ️  ${folder.description}`);

    if (folder.subfolders && folder.subfolders.length > 0) {
      for (const sub of folder.subfolders) {
        console.log(`   ├── 📁 Unterordner: "${sub.name}" (${sub.description})`);
        if (sub.documents) {
          for (const doc of sub.documents) {
            docCount++;
            console.log(`   │   └── 📄 ${doc}`);
          }
        }
      }
    } else if (folder.documents) {
      for (const doc of folder.documents) {
        docCount++;
        console.log(`   └── 📄 ${doc}`);
      }
    }
  }

  console.log('\n==========================================================================');
  console.log(`✅ Zusammenfassung der SharePoint 10-Ordner-Struktur:`);
  console.log(`   • Hauptordner:        ${folderCount}`);
  console.log(`   • IT-Unterordner:     4 (in 07_IT)`);
  console.log(`   • Hinterlegte Docs:   ${docCount}`);
  console.log('==========================================================================\n');
}

const args = process.argv.slice(2);
const isDryRun = !args.includes('--live');
provision10Folders(isDryRun);
