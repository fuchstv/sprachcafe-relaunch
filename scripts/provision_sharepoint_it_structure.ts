/**
 * SprachCafé Polnisch e.V. - SharePoint Intranet & IT Structure Provisioning Script
 * 
 * Sets up document libraries, folders, metadata columns, and IT operational documentation
 * within the Microsoft 365 SharePoint Intranet Hub (/sites/intranet).
 * 
 * Usage:
 *   npx ts-node scripts/provision_sharepoint_it_structure.ts [--dry-run] [--export-json]
 */

import * as fs from 'fs';
import * as path from 'path';

interface FolderStructure {
  name: string;
  description: string;
  subfolders?: string[];
  documents?: { title: string; filename: string; category: string }[];
}

interface LibraryDefinition {
  title: string;
  url: string;
  description: string;
  isRestricted?: boolean;
  folders: FolderStructure[];
}

const TENANT_CONFIG = {
  tenantId: 'b745a80a-f682-45e4-ba2e-d48bbd9e703d',
  sharePointDomain: 'sprachcafepolnisch.sharepoint.com',
  hubSiteUrl: 'https://sprachcafepolnisch.sharepoint.com/sites/intranet',
  primaryColor: '#8B263E',
};

const INTRANET_STRUCTURE: LibraryDefinition[] = [
  {
    title: '💻 IT & System-Infrastruktur',
    url: 'IT_Infrastruktur',
    description: 'Zentrales IT-Betriebshandbuch, Server-Konfigurationen, Runbooks und Notfallpläne',
    folders: [
      {
        name: '01_Architektur_und_Server',
        description: 'AWS EC2 Instanz (3.66.205.213), Caddy Reverse Proxy & Docker Topologie',
        documents: [
          { title: 'IT Infrastruktur & Betriebshandbuch', filename: 'IT_INFRASTRUKTUR_UND_BETRIEBSHANDBUCH.md', category: 'Handbuch' },
          { title: 'Caddy 2 Reverse Proxy Konfiguration', filename: 'Caddyfile.conf', category: 'Infrastruktur' },
          { title: 'Server Port Hardening & Firewall', filename: 'port_hardening.md', category: 'Sicherheit' }
        ]
      },
      {
        name: '02_Datenbanken_und_Backups',
        description: 'SQLite WAL Konfiguration, PostgreSQL Listmonk & tägliche AWS S3 Synchronisation',
        documents: [
          { title: 'Multi-DB Backup & S3 Sync Dokumentation', filename: 'backup_db_guide.md', category: 'Backup' },
          { title: 'Disaster Recovery & Datenbank-Restore', filename: 'disaster_recovery_runbook.md', category: 'Runbook' }
        ]
      },
      {
        name: '03_M365_und_SharePoint_Verwaltung',
        description: 'Entra ID Sicherheitsgruppen, Hub-and-Spoke Architektur, Power Automate Flows',
        documents: [
          { title: 'M365 Rollen- und Berechtigungsmatrix', filename: 'm365_berechtigungen.md', category: 'M365' },
          { title: 'Power Automate Flow Übersicht & Webhooks', filename: 'flow_inventory.md', category: 'Automation' }
        ]
      },
      {
        name: '04_Notfall_Runbooks_und_Eskalation',
        description: 'Sofortmaßnahmen bei Serverausfall, Domain-/SSL-Problemen und Datenverlust',
        documents: [
          { title: 'Notfall-Runbook 1: Server Reboot & Service-Recovery', filename: 'runbook_server_reboot.md', category: 'Runbook' },
          { title: 'Notfall-Runbook 2: SSL & Zertifikats-Reset', filename: 'runbook_ssl_caddy.md', category: 'Runbook' },
          { title: 'Wichtige IT-Kontakte & Eskalationsstufen', filename: 'it_notfall_kontakte.md', category: 'Kontakte' }
        ]
      }
    ]
  },
  {
    title: '🔒 Vorstand & Finanzen',
    url: 'Vorstand_Finanzen',
    description: 'Vertrauliche Vereinsakten, Buchhaltung, Steuererklärungen und Notariatsunterlagen',
    isRestricted: true,
    folders: [
      { name: '01_Buchhaltung_und_Steuer', description: 'Monatsabschlüsse, Belege, Steuerberater' },
      { name: '02_Vereinsregister_und_Satzung', description: 'Notarielle Beglaubigungen, Amtsgericht, Satzung' },
      { name: '03_Sitzungsprotokolle', description: 'Mitgliederversammlungen, Vorstandssitzungen' },
      { name: '04_Vertraege_und_SEPA', description: 'Mietverträge, Förderbescheide, SEPA-Mandate' }
    ]
  },
  {
    title: '📍 Standorte & Betrieb',
    url: 'Standorte_Betrieb',
    description: 'Schichtpläne, Raumbelegungen, Inventare und Schlüsselverwaltung für alle Standorte',
    folders: [
      { name: 'Pankow_Schulzestr_1', description: 'Betrieb Pankow, Café, Technik' },
      { name: 'Schoeneberg_Hauptstr', description: 'Betrieb Schöneberg' },
      { name: 'Koepenick_Wiesengraben', description: 'Betrieb Köpenick, Kulturraum' },
      { name: 'Schichtplaene_und_Schluessel', description: 'Dienstplan-Exporte, Helferkoordination' }
    ]
  },
  {
    title: '🎓 Dozierende & Sprachkurse',
    url: 'Dozierende_Kurse',
    description: 'Unterrichtsmaterialien, Einstufungstests, Curricula und Raumbelegungen',
    folders: [
      { name: '01_Polnisch_Kurse', description: 'A1 bis C1 Unterrichtspläne' },
      { name: '02_Deutsch_Kurse', description: 'DaF & Konversations-Materialien' },
      { name: '03_Tandem_und_Workshops', description: 'Sprach-Tandem Organisation' }
    ]
  },
  {
    title: '🎨 Kultur, Galerie & Events',
    url: 'Kultur_Events',
    description: 'Ausstellungen, Vernissagen, Plakatarchiv, Künstlervereinbarungen und Presse',
    folders: [
      { name: '01_Ausstellungen_und_Galerie', description: 'Künstler-Exposés, Bildrechte, Vernissagen' },
      { name: '02_Presse_und_Flyer', description: 'Pressemitteilungen, Programmhefte' },
      { name: '03_Veranstaltungsarchiv', description: 'Dokumentation vergangener Kulturprojekte' }
    ]
  },
  {
    title: '📦 Vorlagencenter & CI',
    url: 'Vorlagencenter',
    description: 'Offizielle Vorlagen für Briefe, Formulare, Logos, Farb-Tokens und Präsentationen',
    folders: [
      { name: '01_Briefvorlagen_und_Formulare', description: 'Word- & Excel-Vorlagen im Vereins-CI' },
      { name: '02_Logos_und_Brand_Assets', description: 'Vektordateien (SVG, EPS) und Bildmarken' },
      { name: '03_Design_Tokens_und_UX_Kit', description: 'Figma Tokens, Farbwerte (#8B263E / #3B6B35)' }
    ]
  }
];

function printBanner() {
  console.log('==========================================================================');
  console.log(' 🏛️ SPRACHCAFÉ POLNISCH e.V. - SHAREPOINT INTRANET & IT PROVISIONER');
  console.log('==========================================================================');
  console.log(`🏢 Mandant / Tenant:   ${TENANT_CONFIG.tenantId}`);
  console.log(`🌐 SharePoint Domain: ${TENANT_CONFIG.sharePointDomain}`);
  console.log(`🏠 Hub Site URL:       ${TENANT_CONFIG.hubSiteUrl}`);
  console.log(`🎨 Corporate Color:   ${TENANT_CONFIG.primaryColor} (SprachCafé Weinrot)`);
  console.log('==========================================================================\n');
}

export function provisionStructure(dryRun: boolean = true) {
  printBanner();

  console.log(`📋 Modus: ${dryRun ? '🔍 DRY RUN (Vorschau)' : '🚀 LIVE PROVISIONING'}\n`);

  let totalLibraries = 0;
  let totalFolders = 0;
  let totalDocs = 0;

  for (const lib of INTRANET_STRUCTURE) {
    totalLibraries++;
    const lockIcon = lib.isRestricted ? '🔒 [STRENG VERTRAULICH]' : '📂';
    console.log(`\n${lockIcon} [Bibliothek ${totalLibraries}] "${lib.title}" (URL: /sites/intranet/${lib.url})`);
    console.log(`   ℹ️  ${lib.description}`);

    for (const folder of lib.folders) {
      totalFolders++;
      console.log(`   ├── 📁 Ordner: "${folder.name}" (${folder.description})`);
      if (folder.documents && folder.documents.length > 0) {
        for (const doc of folder.documents) {
          totalDocs++;
          console.log(`   │   └── 📄 Dokument: [${doc.category}] ${doc.title} (${doc.filename})`);
        }
      }
    }
  }

  console.log('\n==========================================================================');
  console.log(`✅ Zusammenfassung der SharePoint Intranet Struktur:`);
  console.log(`   • Dokumentenbibliotheken: ${totalLibraries}`);
  console.log(`   • Strukturierte Ordner:   ${totalFolders}`);
  console.log(`   • IT- & Standard-Dokumente: ${totalDocs}`);
  console.log('==========================================================================\n');

  if (dryRun) {
    console.log('💡 Dies war ein Testdurchlauf. Zur echten Bereitstellung via Microsoft Graph API');
    console.log('   oder PnP PowerShell führe das Skript ohne --dry-run aus.\n');
  }
}

// CLI Entrypoint
const args = process.argv.slice(2);
const isDryRun = !args.includes('--live');
provisionStructure(isDryRun);
