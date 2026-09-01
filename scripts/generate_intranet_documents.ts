/**
 * SprachCafé Polnisch e.V. - Intranet Office Document Generator
 * Erstellt maßgeschneiderte Microsoft Word (.docx), Excel (.xlsx) und Markdown-Dokumente
 * für die 10 definierten SharePoint-Ordner.
 */
import fs from 'node:fs';
import path from 'node:path';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import ExcelJS from 'exceljs';

const BASE_OUT = path.resolve(process.cwd(), 'intranet-content');

const FOLDERS = {
  vorstand: path.join(BASE_OUT, '01_Vorstand'),
  finanzen: path.join(BASE_OUT, '02_Finanzen'),
  mitglieder: path.join(BASE_OUT, '03_Mitgliederverwaltung'),
  veranstaltungen: path.join(BASE_OUT, '04_Veranstaltungen'),
  cafe: path.join(BASE_OUT, '05_Cafébetrieb'),
  pr: path.join(BASE_OUT, '06_Öffentlichkeitsarbeit'),
  it: path.join(BASE_OUT, '07_IT'),
  personal: path.join(BASE_OUT, '08_Personal'),
  vorlagen: path.join(BASE_OUT, '09_Vorlagen'),
  archiv: path.join(BASE_OUT, '10_Archiv')
};

const IT_SUB = {
  server: path.join(FOLDERS.it, '01_Server_und_Architektur'),
  backup: path.join(FOLDERS.it, '02_Datenbanken_und_S3_Backups'),
  m365: path.join(FOLDERS.it, '03_Microsoft_365_und_SharePoint'),
  runbooks: path.join(FOLDERS.it, '04_Notfall_Runbooks_und_Sicherheit')
};

Object.values(FOLDERS).forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});
Object.values(IT_SUB).forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

function burgundyHeading(text: string, level: any) {
  return new Paragraph({
    text,
    heading: level,
    spacing: { before: 240, after: 120 },
    run: {
      color: '8B263E',
      bold: true,
      font: 'Calibri'
    }
  });
}

// 1. Vorlagen (09_Vorlagen)
async function createTemplates() {
  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
        }
      },
      children: [
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          children: [
            new TextRun({ text: 'SprachCafé Polnisch e.V. • Schulzestr. 1 • 13187 Berlin', size: 16, color: '8B263E', bold: true }),
          ]
        }),
        new Paragraph({
          spacing: { before: 400, after: 200 },
          children: [
            new TextRun({ text: 'SprachCafé Polnisch e.V.\nSchulzestr. 1\n13187 Berlin\nDeutschland', size: 20, color: '595959' })
          ]
        }),
        burgundyHeading('Offizieller Briefbogen SprachCafé Polnisch e.V.', HeadingLevel.HEADING_1),
        new Paragraph({
          children: [
            new TextRun({ text: 'Sehr geehrte Damen und Herren,\n\ndies ist die offizielle Vorlage für Mitteilungen und Schriftverkehr des SprachCafé Polnisch e.V.' })
          ]
        })
      ]
    }]
  });
  const buf1 = await Packer.toBuffer(doc);
  fs.writeFileSync(path.join(FOLDERS.vorlagen, 'Offizieller_Briefbogen_SprachCafe_Polnisch_eV.docx'), buf1);

  // Excel Honorarabrechnung
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Honorarabrechnung');
  ws.columns = [
    { header: 'Datum', key: 'datum', width: 15 },
    { header: 'Projekt / Kurs / Tätigkeit', key: 'taetigkeit', width: 35 },
    { header: 'Standort', key: 'standort', width: 20 },
    { header: 'Stunden (UE)', key: 'stunden', width: 15 },
    { header: 'Stundensatz (€)', key: 'satz', width: 15 },
    { header: 'Gesamt (€)', key: 'gesamt', width: 15 }
  ];
  ws.addRow({ datum: '2026-09-01', taetigkeit: 'Polnisch Sprachkurs A1', standort: 'Pankow (Schulzestr. 1)', stunden: 2, satz: 35, gesamt: 70 });
  await wb.xlsx.writeFile(path.join(FOLDERS.vorlagen, 'Vorlage_Honorarabrechnung_und_Auslagenersatz_2026.xlsx'));

  // Copy Figma Tokens & Guide
  fs.copyFileSync(path.resolve(process.cwd(), 'docs/figma-starter/figma-tokens.json'), path.join(FOLDERS.vorlagen, 'figma-tokens.json'));
  fs.copyFileSync(path.resolve(process.cwd(), 'docs/figma-starter/FIGMA_SETUP_AND_IMPORT_GUIDE.md'), path.join(FOLDERS.vorlagen, 'FIGMA_SETUP_AND_IMPORT_GUIDE.md'));
  console.log('✓ 09_Vorlagen befüllt');
}

// 2. Cafébetrieb (05_Cafébetrieb)
async function createCafeDocs() {
  const doc = new Document({
    sections: [{
      children: [
        burgundyHeading('Schichtleitfaden & Checkliste Begegnungscafé Pankow', HeadingLevel.HEADING_1),
        new Paragraph({
          children: [
            new TextRun({ text: 'Standort: Schulzestr. 1, 13187 Berlin\n\n1. Öffnung & Vorbereitung (Kasse zählen, Kaffeemaschine aufheizen, Beleuchtung)\n2. Café-Betrieb (Gäste begrüßen, Barspenden dokumentieren, Ordnung halten)\n3. Schichtabschluss (Kassenabrechnung im Tresor, Spülmaschine starten, Fenster schließen, Alarmanlage scharf)' })
          ]
        })
      ]
    }]
  });
  const buf = await Packer.toBuffer(doc);
  fs.writeFileSync(path.join(FOLDERS.cafe, 'Schichtleitfaden_und_Checkliste_Begegnungscafe_Pankow.docx'), buf);
  console.log('✓ 05_Cafébetrieb befüllt');
}

// 3. IT Dokumentation (07_IT)
async function createITDocs() {
  // 01 Server & Architektur
  const doc1 = new Document({
    sections: [{
      children: [
        burgundyHeading('SprachCafé Polnisch e.V. – IT-Betriebshandbuch & Server-Architektur', HeadingLevel.HEADING_1),
        new Paragraph({
          children: [
            new TextRun({ text: 'Mandant: b745a80a-f682-45e4-ba2e-d48bbd9e703d • Host: AWS EC2 (3.66.205.213)\n\n' }),
            new TextRun({ text: '1. Caddy Reverse Proxy mit automatischem TLS für alle 6 Domains (sprachcafé.org, beta, hausbibliothek.org, team, kurse, newsletter).\n2. Applikationen: Astro 5 SSG, Hausbibliothek (PHP 8.4 + SQLite WAL), Dienstplan Node.js, Fastify Kurse, Listmonk Newsletter.\n3. Sicherheit: Port-Hardening (nur 80/443 offen), geschlossene DB-Ports, Basic-Auth für Reports.\n' })
          ]
        })
      ]
    }]
  });
  const buf1 = await Packer.toBuffer(doc1);
  fs.writeFileSync(path.join(IT_SUB.server, 'IT_Betriebshandbuch.docx'), buf1);
  fs.copyFileSync(path.resolve(process.cwd(), 'docs/IT_INFRASTRUKTUR_UND_BETRIEBSHANDBUCH.md'), path.join(IT_SUB.server, 'IT_INFRASTRUKTUR_UND_BETRIEBSHANDBUCH.md'));

  // 02 Datenbanken & S3 Backups
  const doc2 = new Document({
    sections: [{
      children: [
        burgundyHeading('Multi-DB Backup Strategie & S3 Offsite Synchronisation', HeadingLevel.HEADING_1),
        new Paragraph({
          children: [
            new TextRun({ text: '• SQLite Online Backup API (/home/ubuntu/backups/backup_db.sh)\n• PostgreSQL 17 Dump für Listmonk\n• 30 Tage lokale Aufbewahrungsfrist\n• AWS S3 Destination: s3://sprachcafe-backups-secure/ (eu-central-1)\n' })
          ]
        })
      ]
    }]
  });
  const buf2 = await Packer.toBuffer(doc2);
  fs.writeFileSync(path.join(IT_SUB.backup, 'Backup_und_Disaster_Recovery_Plan.docx'), buf2);

  // 03 M365 & SharePoint
  const doc3 = new Document({
    sections: [{
      children: [
        burgundyHeading('Microsoft 365, SharePoint & Power Automate Architektur', HeadingLevel.HEADING_1),
        new Paragraph({
          children: [
            new TextRun({ text: '• Tenant: sprachcafepolnisch.sharepoint.com\n• Hub Site: /sites/intranet\n• 10 Standard-Ordnerstruktur (01_Vorstand bis 10_Archiv)\n• Sicherheitsgruppen: Vorstand, Standortleitung, Dozierende, Ehrenamtliche\n' })
          ]
        })
      ]
    }]
  });
  const buf3 = await Packer.toBuffer(doc3);
  fs.writeFileSync(path.join(IT_SUB.m365, 'M365_Rollen_und_Berechtigungen.docx'), buf3);

  // 04 Notfall-Runbooks
  const doc4 = new Document({
    sections: [{
      children: [
        burgundyHeading('IT Notfall-Runbooks & Disaster Recovery', HeadingLevel.HEADING_1),
        new Paragraph({
          children: [
            new TextRun({ text: 'Sofortmaßnahmen:\n1. Server Neustart: cd /home/ubuntu/minimalist_home_library && docker compose up -d\n2. S3 DB-Restore: aws s3 sync s3://sprachcafe-backups-secure/ /home/ubuntu/backups/restore/\n3. SSL Reset: docker exec caddy caddy reload\n4. Frontend Rollback: git checkout <TAG> && ./scripts/deploy.sh production\n' })
          ]
        })
      ]
    }]
  });
  const buf4 = await Packer.toBuffer(doc4);
  fs.writeFileSync(path.join(IT_SUB.runbooks, 'IT_Notfall_Runbooks.docx'), buf4);
  console.log('✓ 07_IT vollständig mit 4 Unterbereichen und Dokumenten befüllt');
}

async function main() {
  console.log('================================================================');
  console.log(' 📄 GENERIERE DOKUMENTE FÜR DIE 10 SHAREPOINT ORDNER');
  console.log('================================================================\n');

  await createTemplates();
  await createCafeDocs();
  await createITDocs();

  console.log('\n================================================================');
  console.log(' 🎉 ALLE DOKUMENTE WURDEN ERFOLGREICH GENERIERT!');
  console.log('================================================================\n');
}

main().catch(console.error);
