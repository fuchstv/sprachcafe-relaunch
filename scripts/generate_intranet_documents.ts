/**
 * SprachCafé Polnisch e.V. - Intranet Office Document Generator
 * Erstellt maßgeschneiderte Microsoft Word (.docx) und Excel (.xlsx) Vorlagen für das Intranet.
 */
import fs from 'node:fs';
import path from 'node:path';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle, UnderlineType } from 'docx';
import ExcelJS from 'exceljs';

const BASE_OUT = path.resolve(process.cwd(), 'intranet-content');
const VORLAGEN_DIR = path.join(BASE_OUT, 'Vorlagencenter');
const STANDORTE_DIR = path.join(BASE_OUT, 'Standorte_und_Schichten');
const NEWS_DIR = path.join(BASE_OUT, 'News_und_Ankuendigungen');
const IT_DIR = path.join(BASE_OUT, 'IT_Infrastruktur');
const IT_SERVER_DIR = path.join(IT_DIR, '01_Architektur_und_Server');
const IT_DB_DIR = path.join(IT_DIR, '02_Datenbanken_und_Backups');
const IT_M365_DIR = path.join(IT_DIR, '03_M365_und_SharePoint_Verwaltung');
const IT_RUNBOOKS_DIR = path.join(IT_DIR, '04_Notfall_Runbooks_und_Eskalation');

[VORLAGEN_DIR, STANDORTE_DIR, NEWS_DIR, IT_DIR, IT_SERVER_DIR, IT_DB_DIR, IT_M365_DIR, IT_RUNBOOKS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Helper for Burgundy Heading
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

// ----------------------------------------------------------------------------
// 1. Offizieller Briefbogen (.docx)
// ----------------------------------------------------------------------------
async function createLetterhead() {
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
        new Paragraph({
          spacing: { before: 400, after: 200 },
          children: [
            new TextRun({ text: 'Empfänger:in / Institution\nAbteilung / Ansprechperson\nStraße und Hausnummer\nPLZ Ort', size: 22 })
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.RIGHT,
          spacing: { before: 200, after: 400 },
          children: [
            new TextRun({ text: `Berlin, den ${new Date().toLocaleDateString('de-DE')}`, size: 20, color: '595959' })
          ]
        }),
        burgundyHeading('Betreff: Offizielle Mitteilung des SprachCafé Polnisch e.V.', HeadingLevel.HEADING_2),
        new Paragraph({
          spacing: { before: 200, after: 200 },
          children: [
            new TextRun({ text: 'Sehr geehrte Damen und Herren, liebe Freundinnen und Freunde des SprachCafés,\n\n', size: 22 }),
            new TextRun({ text: 'dies ist die offizielle Word-Vorlage für die Korrespondenz des SprachCafé Polnisch e.V. Nutzen Sie dieses Dokument für Anträge, Anschreiben, Kooperationsvereinbarungen und behördliche Mitteilungen.\n\n', size: 22 }),
            new TextRun({ text: 'Bitte tragen Sie hier Ihren Text ein. Die Corporate Identity Farben (Weinrot #8B263E) und Schriftgrößen sind gemäß den Vereinsrichtlinien vorkonfiguriert.\n\n', size: 22 }),
            new TextRun({ text: 'Mit freundlichen Grüßen,\n\n\n\n', size: 22 }),
            new TextRun({ text: 'Der Vorstand des SprachCafé Polnisch e.V.\n', bold: true, size: 22 }),
            new TextRun({ text: 'Agata Koch (Vorsitzende) • Elke Albers (Schatzmeisterin)', size: 20, color: '595959' })
          ]
        }),
        new Paragraph({
          spacing: { before: 800 },
          children: [
            new TextRun({ text: '_________________________________________________________________________________\n', color: '8B263E' }),
            new TextRun({ text: 'SprachCafé Polnisch e.V. | Sitz: Berlin | Amtsgericht Charlottenburg VR 35014 B\n', size: 16, color: '595959' }),
            new TextRun({ text: 'Vorstand: Agata Koch, Elke Albers, Agnieszka Ghanname | Steuer-Nr.: 27/677/65842 (FA für Körperschaften I)\n', size: 16, color: '595959' }),
            new TextRun({ text: 'Bankverbindung: Deutsche Skatbank | IBAN: DE79 8306 5408 0004 7795 33 | BIC: GENODEF1SLN\n', size: 16, color: '595959' }),
            new TextRun({ text: 'E-Mail: kontakt@sprachcafe-polnisch.org | Web: https://sprachcafé.org', size: 16, color: '8B263E' })
          ]
        })
      ]
    }]
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(path.join(VORLAGEN_DIR, 'Offizieller_Briefbogen_SprachCafe_Polnisch_eV.docx'), buffer);
  console.log('✓ Vorlage erstellt: Offizieller_Briefbogen_SprachCafe_Polnisch_eV.docx');
}

// ----------------------------------------------------------------------------
// 2. Honorarabrechnung & Auslagenersatz (.xlsx)
// ----------------------------------------------------------------------------
async function createExpenseSheet() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'SprachCafé Polnisch e.V.';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('Honorarabrechnung 2026', {
    pageSetup: { orientation: 'portrait', fitToPage: true }
  });

  // Styling
  sheet.columns = [
    { header: 'Pos.', key: 'pos', width: 6 },
    { header: 'Datum', key: 'date', width: 14 },
    { header: 'Leistungsbeschreibung / Kurs / Projekt', key: 'desc', width: 40 },
    { header: 'Standort', key: 'location', width: 18 },
    { header: 'Stunden / Einheiten', key: 'hours', width: 18 },
    { header: 'Stundensatz (€)', key: 'rate', width: 16 },
    { header: 'Gesamtbetrag (€)', key: 'total', width: 18 }
  ];

  // Header Title
  sheet.mergeCells('A1:G1');
  const titleCell = sheet.getCell('A1');
  titleCell.value = 'SPRACHCAFÉ POLNISCH e.V. – HONORAR- UND AUSLAGENABRECHNUNG';
  titleCell.font = { name: 'Calibri', size: 14, bold: true, color: { argb: 'FFFFFFFF' } };
  titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF8B263E' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  sheet.getRow(1).height = 30;

  // Metadata block
  sheet.addRow([]);
  sheet.addRow(['Name Dozent:in / Auftragnehmer:in:', '', 'Mustername Dozierende', '', 'Monat / Jahr:', 'August 2026']);
  sheet.addRow(['Anschrift:', '', 'Musterstraße 12, 10115 Berlin', '', 'Projekt / Förderkennzeichen:', 'Sprachkurse Pankow']);
  sheet.addRow(['IBAN:', '', 'DE12 3456 7890 1234 5678 90', '', 'BIC / Bank:', 'Berliner Sparkasse']);
  sheet.addRow(['Steuernummer / Freibetrag:', '', 'Steuer-ID / § 3 Nr. 26 EStG Übungsleiter', '', 'E-Mail:', 'dozent@example.com']);
  sheet.addRow([]);

  // Table headers row (Row 8)
  const headerRow = sheet.addRow(['Pos.', 'Datum', 'Tätigkeit / Kursmodul', 'Standort', 'Stunden', 'Stundensatz (€)', 'Summe (€)']);
  headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
  headerRow.eachCell(cell => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF8B263E' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
  });

  // Data rows
  const sampleData = [
    [1, '04.08.2026', 'Polnisch Sprachkurs A1.1 (Gruppe 1)', 'Pankow', 2.0, 35.00],
    [2, '11.08.2026', 'Polnisch Sprachkurs A1.1 (Gruppe 1)', 'Pankow', 2.0, 35.00],
    [3, '18.08.2026', 'Polnisch Konversations-Tandem B2', 'Schöneberg', 1.5, 35.00],
    [4, '25.08.2026', 'Polnisch Sprachkurs A1.1 (Gruppe 1)', 'Pankow', 2.0, 35.00],
    [5, '', 'Kopierkosten & Lehrmaterial (Beleg anbei)', 'Pankow', 1.0, 15.50]
  ];

  sampleData.forEach((row, idx) => {
    const rowNum = 9 + idx;
    const r = sheet.addRow([row[0], row[1], row[2], row[3], row[4], row[5], { formula: `E${rowNum}*F${rowNum}` }]);
    r.getCell(6).numFmt = '#,##0.00 €';
    r.getCell(7).numFmt = '#,##0.00 €';
  });

  // Empty rows for user
  for (let i = 0; i < 5; i++) {
    const rowNum = 14 + i;
    const r = sheet.addRow([sampleData.length + 1 + i, '', '', '', '', '', { formula: `E${rowNum}*F${rowNum}` }]);
    r.getCell(6).numFmt = '#,##0.00 €';
    r.getCell(7).numFmt = '#,##0.00 €';
  }

  // Total row
  const totalRow = sheet.addRow(['', '', '', 'GESAMTBETRAG ZUR AUSZAHLUNG:', '', '', { formula: 'SUM(G9:G18)' }]);
  totalRow.font = { bold: true, size: 12 };
  totalRow.getCell(7).numFmt = '#,##0.00 €';
  totalRow.getCell(7).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFDFBF7' } };

  sheet.addRow([]);
  sheet.addRow(['Bestätigung der Richtigkeit:', '', 'Hiermit bestätige ich die sachliche und rechnerische Richtigkeit der Angaben.']);
  sheet.addRow([]);
  sheet.addRow(['_____________________________________', '', '_____________________________________']);
  sheet.addRow(['Datum & Unterschrift Dozent:in', '', 'Freigabe Vorstand / Schatzmeisterin']);

  await workbook.xlsx.writeFile(path.join(VORLAGEN_DIR, 'Vorlage_Honorarabrechnung_und_Auslagenersatz_2026.xlsx'));
  console.log('✓ Vorlage erstellt: Vorlage_Honorarabrechnung_und_Auslagenersatz_2026.xlsx');
}

// ----------------------------------------------------------------------------
// 3. Schichtleitfaden & Checkliste (.docx)
// ----------------------------------------------------------------------------
async function createShiftGuide() {
  const doc = new Document({
    sections: [{
      children: [
        burgundyHeading('Leitfaden & Checkliste: Schichtdienst im Begegnungscafé Pankow', HeadingLevel.HEADING_1),
        new Paragraph({
          children: [
            new TextRun({ text: 'Standort: Schulzestr. 1, 13187 Berlin • SprachCafé Polnisch e.V.\n', bold: true, size: 22, color: '595959' }),
            new TextRun({ text: 'Gültig ab: August 2026 • Ansprechpartnerin: Agata Koch / Elke Albers\n\n', size: 20, color: '595959' })
          ]
        }),
        burgundyHeading('1. Vor Beginn der Schicht (Öffnungsvorbereitung)', HeadingLevel.HEADING_2),
        new Paragraph({
          bullet: { level: 0 },
          children: [new TextRun({ text: 'Schlüsselkasten öffnen und Café-Haupteingang entriegeln.', size: 22 })]
        }),
        new Paragraph({
          bullet: { level: 0 },
          children: [new TextRun({ text: 'Räume lüften, Beleuchtung und Hintergrundmusik (dezent) einschalten.', size: 22 })]
        }),
        new Paragraph({
          bullet: { level: 0 },
          children: [new TextRun({ text: 'Kaffeemaschine, Wasserkocher und Teestation vorbereiten; Spülmaschine prüfen.', size: 22 })]
        }),
        new Paragraph({
          bullet: { level: 0 },
          children: [new TextRun({ text: 'Wechselgeldkasse zählen (Soll-Stand: 50,00 €) und Kassenbuch bereitlegen.', size: 22 })]
        }),
        new Paragraph({
          bullet: { level: 0 },
          children: [new TextRun({ text: 'WLAN-Zugangsdaten für Gäste aushängen und Info-Flyer bereitlegen.', size: 22 })]
        }),
        burgundyHeading('2. Während des Café-Betriebs', HeadingLevel.HEADING_2),
        new Paragraph({
          bullet: { level: 0 },
          children: [new TextRun({ text: 'Gäste herzlich begrüßen und über das deutsch-polnische Kultur- und Sprachangebot informieren.', size: 22 })]
        }),
        new Paragraph({
          bullet: { level: 0 },
          children: [new TextRun({ text: 'Hausbibliothek: Ausleihen und Rückgaben über das Portal (https://hausbibliothek.org) erfassen.', size: 22 })]
        }),
        new Paragraph({
          bullet: { level: 0 },
          children: [new TextRun({ text: 'Spenden für Kaffee, Kuchen und Laden-Artikel direkt in die Kasse einbuchen.', size: 22 })]
        }),
        burgundyHeading('3. Nach Ende der Schicht (Schließcheckliste)', HeadingLevel.HEADING_2),
        new Paragraph({
          bullet: { level: 0 },
          children: [new TextRun({ text: 'Tische abwischen, Stühle ordentlich stellen, Geschirr in Spülmaschine einräumen und starten.', size: 22 })]
        }),
        new Paragraph({
          bullet: { level: 0 },
          children: [new TextRun({ text: 'Tageseinnahmen zählen, Differenz ins Kassenbuch eintragen; Bargeld im Tresor deponieren.', size: 22 })]
        }),
        new Paragraph({
          bullet: { level: 0 },
          children: [new TextRun({ text: 'Kaffeemaschine ausschalten, Stecker prüfen, Mülleimer leeren.', size: 22 })]
        }),
        new Paragraph({
          bullet: { level: 0 },
          children: [new TextRun({ text: 'Alle Fenster schließen, Heizung regulieren, Licht ausschalten, Eingangstür zweifach abschließen.', size: 22 })]
        }),
        burgundyHeading('4. Notfallkontakte', HeadingLevel.HEADING_2),
        new Paragraph({
          children: [
            new TextRun({ text: '• Agata Koch (Vorstand): +49 170 1234567\n• Elke Albers (Finanzen): +49 171 7654321\n• Hausverwaltung / Havariedienst: 030 / 90293-0\n• Polizei: 110 | Feuerwehr / Notarzt: 112', size: 22 })
          ]
        })
      ]
    }]
  });

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(path.join(STANDORTE_DIR, 'Schichtleitfaden_und_Checkliste_Begegnungscafe_Pankow.docx'), buffer);
  console.log('✓ Vorlage erstellt: Schichtleitfaden_und_Checkliste_Begegnungscafe_Pankow.docx');
}

// ----------------------------------------------------------------------------
// 4. News Artikel (.docx & .md)
// ----------------------------------------------------------------------------
async function createNewsArticles() {
  const news1 = {
    title: 'Willkommen im neuen SprachCafé Intranet – So arbeiten wir ab sofort zusammen',
    date: '18. August 2026',
    author: 'Der Vorstand',
    content: `Liebes Team, liebe Dozierende und Ehrenamtliche,\n\nwir freuen uns sehr, heute unser neues internes Intranet unter http://intranet.sprachcafé.org in Betrieb zu nehmen!\n\nDas Intranet dient als zentraler Hub für alle unsere 3 Standorte (Pankow, Schöneberg, Köpenick) und bündelt:\n• Offizielle Briefbögen, Satzung und Formulare im Vorlagencenter\n• Schichtpläne und Standort-Leitfäden\n• Direkter Zugriff auf die Hausbibliothek (hausbibliothek.org)\n• Redaktions-Formulare für neue Teammitglieder, Ausstellungen und Ladenartikel\n\nBitte speichert euch die Adresse in euren Lesezeichen ab. Bei Fragen oder Anregungen wendet euch jederzeit an den Vorstand.`
  };

  const news2 = {
    title: 'Kultur & Begegnung: Neue Ausstellungsstaffel im Begegnungscafé Pankow',
    date: '15. August 2026',
    author: 'Kulturteam Pankow',
    content: `Ab September 2026 startet in unseren Räumlichkeiten in der Schulzestr. 1 eine neue Kunstausstellung deutsch-polnischer Künstlerinnen.\n\nAlle Vorbereitungen für die Vernissage laufen auf Hochtouren. Die Einladungsflyer und Plakate findet ihr ab sofort in der Medienbibliothek des Intranets.\n\nHelferinnen und Helfer für den Empfang und das Catering werden noch gesucht – bitte tragt euch in die Helferliste im Bereich 'Standorte & Schichten' ein!`
  };

  const news3 = {
    title: 'Hausbibliothek wächst: Über 400 Medien & Standort-Updates Köpenick & Schöneberg',
    date: '12. August 2026',
    author: 'Bibliotheks-Team',
    content: `Dank zahlreicher Buchspenden umfasst unsere Hausbibliothek mittlerweile über 400 katalogisierte Titel in deutscher und polnischer Sprache.\n\nDie Bestände in Köpenick (Am Wiesengraben 7a) und Schöneberg (Hauptstr. 121 A) wurden aktualisiert und stehen allen Vereinsmitgliedern zur kostenfreien Ausleihe bereit.\n\nDie Ausleihe und Recherche erfolgt digital und unkompliziert unter https://hausbibliothek.org.`
  };

  const allNews = [news1, news2, news3];

  for (let i = 0; i < allNews.length; i++) {
    const item = allNews[i];
    const doc = new Document({
      sections: [{
        children: [
          burgundyHeading(item.title, HeadingLevel.HEADING_1),
          new Paragraph({
            children: [
              new TextRun({ text: `Veröffentlicht am: ${item.date} • Autor: ${item.author}\n\n`, size: 20, color: '595959', italics: true })
            ]
          }),
          new Paragraph({
            children: [
              new TextRun({ text: item.content, size: 22 })
            ]
          })
        ]
      }]
    });

    const buffer = await Packer.toBuffer(doc);
    const filenameDocx = `News_${String(i+1).padStart(2, '0')}_${item.title.substring(0, 30).replace(/[^a-zA-Z0-9]/g, '_')}.docx`;
    const filenameMd = `News_${String(i+1).padStart(2, '0')}_${item.title.substring(0, 30).replace(/[^a-zA-Z0-9]/g, '_')}.md`;
    
    fs.writeFileSync(path.join(NEWS_DIR, filenameDocx), buffer);
    fs.writeFileSync(path.join(NEWS_DIR, filenameMd), `# ${item.title}\n\n*${item.date} | ${item.author}*\n\n${item.content}\n`);
    console.log(`✓ News erstellt: ${filenameDocx}`);
  }
}

// ----------------------------------------------------------------------------
// 5. IT-Infrastruktur & Betriebsdokumente (.docx & .md)
// ----------------------------------------------------------------------------
async function createITDocuments() {
  // 1. IT Handbuch Docx
  const doc1 = new Document({
    sections: [{
      children: [
        burgundyHeading('SprachCafé Polnisch e.V. – IT-Betriebshandbuch', HeadingLevel.HEADING_1),
        new Paragraph({
          children: [
            new TextRun({ text: 'Mandant: b745a80a-f682-45e4-ba2e-d48bbd9e703d • Server: AWS EC2 3.66.205.213\n\n', italics: true, color: '595959' }),
            new TextRun({ text: '1. Server & Reverse Proxy: Caddy 2 mit automatischem TLS (Let\'s Encrypt) für sprachcafé.org, beta.sprachcafe-polnisch.org, hausbibliothek.org, team.sprachcafé.org, kurse.sprachcafé.org, newsletter.sprachcafé.org.\n\n' }),
            new TextRun({ text: '2. Applikationen: Astro 5 SSG, Hausbibliothek (PHP 8.4 + SQLite WAL), Dienstplan Node.js (Port 3200), Kurse Fastify (Port 3300), Listmonk Newsletter (Port 9000).\n\n' }),
            new TextRun({ text: '3. Backups: Tägliche atomare SQLite Online Backups & S3 Sync nach s3://sprachcafe-backups-secure/.\n\n' }),
            new TextRun({ text: '4. M365 Intranet: Hub Site sprachcafepolnisch.sharepoint.com/sites/intranet mit rollenbasierter Entra ID Rechteverwaltung.\n' })
          ]
        })
      ]
    }]
  });
  const buf1 = await Packer.toBuffer(doc1);
  fs.writeFileSync(path.join(IT_SERVER_DIR, 'IT_Betriebshandbuch.docx'), buf1);
  fs.copyFileSync(path.resolve(process.cwd(), 'docs/IT_INFRASTRUKTUR_UND_BETRIEBSHANDBUCH.md'), path.join(IT_SERVER_DIR, 'IT_INFRASTRUKTUR_UND_BETRIEBSHANDBUCH.md'));
  console.log('✓ IT-Dokumente erstellt: 01_Architektur_und_Server');

  // 2. Backup Plan Docx
  const doc2 = new Document({
    sections: [{
      children: [
        burgundyHeading('Backup- & Disaster-Recovery-Plan', HeadingLevel.HEADING_1),
        new Paragraph({
          children: [
            new TextRun({ text: 'Multi-Database Backup Strategie & S3 Offsite Synchronisation\n\n', italics: true, color: '595959' }),
            new TextRun({ text: '• SQLite Online Backup API ohne Tabellensperren\n• PostgreSQL 17 pg_dump Kompression\n• 30 Tage lokale Vorhaltezeit\n• AWS S3 Bucket: s3://sprachcafe-backups-secure/ (eu-central-1)\n' })
          ]
        })
      ]
    }]
  });
  const buf2 = await Packer.toBuffer(doc2);
  fs.writeFileSync(path.join(IT_DB_DIR, 'Backup_und_Disaster_Recovery_Plan.docx'), buf2);
  console.log('✓ IT-Dokumente erstellt: 02_Datenbanken_und_Backups');

  // 3. M365 Berechtigungen Docx
  const doc3 = new Document({
    sections: [{
      children: [
        burgundyHeading('Microsoft 365 & SharePoint Rollen- & Berechtigungsmatrix', HeadingLevel.HEADING_1),
        new Paragraph({
          children: [
            new TextRun({ text: 'Sicherheitsgruppen: SG-SprachCafe-Vorstand, SG-SprachCafe-Standortleitung, SG-SprachCafe-Dozierende, SG-SprachCafe-Ehrenamtliche.\n' })
          ]
        })
      ]
    }]
  });
  const buf3 = await Packer.toBuffer(doc3);
  fs.writeFileSync(path.join(IT_M365_DIR, 'M365_Rollen_und_Berechtigungen.docx'), buf3);
  console.log('✓ IT-Dokumente erstellt: 03_M365_und_SharePoint_Verwaltung');

  // 4. Notfall-Runbooks Docx
  const doc4 = new Document({
    sections: [{
      children: [
        burgundyHeading('IT Notfall-Runbooks & Eskalation', HeadingLevel.HEADING_1),
        new Paragraph({
          children: [
            new TextRun({ text: 'Sofortmaßnahmen bei Ausfall:\n1. Server Reboot: docker compose up -d\n2. S3 Restore: aws s3 sync s3://sprachcafe-backups-secure/ /home/ubuntu/backups/restore/\n3. SSL Reset: docker exec caddy caddy reload\n' })
          ]
        })
      ]
    }]
  });
  const buf4 = await Packer.toBuffer(doc4);
  fs.writeFileSync(path.join(IT_RUNBOOKS_DIR, 'IT_Notfall_Runbooks.docx'), buf4);
  console.log('✓ IT-Dokumente erstellt: 04_Notfall_Runbooks_und_Eskalation');
}

async function main() {
  console.log('================================================================');
  console.log(' 📄 GENERIERE INTRANET OFFICE DOKUMENTE & VORLAGEN');
  console.log('================================================================\n');

  await createLetterhead();
  await createExpenseSheet();
  await createShiftGuide();
  await createNewsArticles();
  await createITDocuments();

  console.log('\n================================================================');
  console.log(' 🎉 ALLE INTRANET DOKUMENTE WURDEN ERFOLGREICH GENERIERT!');
  console.log('================================================================\n');
}

main().catch(console.error);
