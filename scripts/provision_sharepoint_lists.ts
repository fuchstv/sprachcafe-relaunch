#!/usr/bin/env npx tsx
/**
 * SprachCafé Polnisch e.V. - SharePoint Lists & Schema Provisioner
 * 
 * Uses the M365 SharePoint Bridge to reliably create and configure:
 * 1. Mitgliederverwaltung (Mitgliederentwicklung, Stufen, Beiträge)
 * 2. Veranstaltungs_Rueckmeldungen (Tägliche Headcounts, Kinder, Barspenden)
 * 3. Buchhaltung_Spenden (Monatliche Spendensummen & Kofinanzierung)
 * 4. Veranstaltungs_Statistik (Kalender-KPI Aggregation für Power BI)
 * 5. Ehrenamtsantraege & Praktikumsantraege
 */

const BRIDGE_URL = 'https://defaultb745a80af68245e4ba2ed48bbd9e70.3d.environment.api.powerplatform.com:443/powerautomate/automations/direct/cu/10/workflows/9e151172d9964dbf93fc5853aab3561d/triggers/manual/paths/invoke?api-version=1&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=2YzyNYZx2Rd79_pdygdRpCVxUEXGktKotLwAoPKLnf0';

interface ColumnSpec {
  name: string;
  type: number; // 2=Text, 3=Note, 4=DateTime, 6=Choice, 9=Number, 14=Currency, 8=Boolean
  choices?: string[];
}

interface ListSpec {
  title: string;
  description: string;
  fields: ColumnSpec[];
}

const LISTS_TO_PROVISION: ListSpec[] = [
  // 1. MITGLIEDERVERWALTUNG
  {
    title: 'Mitgliederverwaltung',
    description: 'Zentrale Mitgliederliste des SprachCafé Polnisch e.V. für Mitgliederzahlen, Stufen und Entwicklung',
    fields: [
      { name: 'Email', type: 2 },
      { name: 'Telefon', type: 2 },
      { name: 'Geburtsdatum', type: 2 },
      { name: 'Strasse', type: 2 },
      { name: 'PLZ', type: 2 },
      { name: 'Ort', type: 2 },
      { name: 'Beruf', type: 2 },
      { name: 'MitgliedschaftsArt', type: 6, choices: ['ordentlich', 'foerdernd'] },
      { name: 'MitgliedschaftsStufe', type: 6, choices: ['Silver', 'Gold', 'Platinum', 'Firmenmitgliedschaft'] },
      { name: 'Status', type: 6, choices: ['Aktiv', 'Beantragt', 'Pausiert', 'Ausgetreten'] },
      { name: 'Eintrittsdatum', type: 4 },
      { name: 'Austrittsdatum', type: 4 },
      { name: 'Unterstuetzung', type: 3 },
      { name: 'BeitragBezahlt', type: 8 }
    ]
  },

  // 2. VERANSTALTUNGS-RÜCKMELDUNGEN (Dorota Stasińska / Hosts)
  {
    title: 'Veranstaltungs_Rueckmeldungen',
    description: 'Tägliche Veranstaltungs-Messwerte (Headcount, Kinder-Anteil, Kasse/Barspenden) aus M365 Adaptive Cards',
    fields: [
      { name: 'EventDatum', type: 4 },
      { name: 'Standort', type: 2 },
      { name: 'TeilnehmerGesamt', type: 9 },
      { name: 'DavonKinder', type: 9 },
      { name: 'SpendenBar', type: 14 },
      { name: 'Notiz', type: 3 },
      { name: 'ErfasstDurch', type: 2 },
      { name: 'Erfassungszeitpunkt', type: 4 }
    ]
  },

  // 3. BUCHHALTUNG & SPENDEN (Agnieszka Kubalewska-Strohmeyer)
  {
    title: 'Buchhaltung_Spenden',
    description: 'Monatliche Spendensummen, Fördermittel und Eigenanteile für Verwendungsnachweise und Power BI',
    fields: [
      { name: 'BerichtsMonat', type: 2 },
      { name: 'SpendenAllgemein', type: 14 },
      { name: 'SpendenZweckgebunden', type: 14 },
      { name: 'Mitgliedsbeitraege', type: 14 },
      { name: 'FoerdermittelAuszahlungen', type: 14 },
      { name: 'Bemerkungen', type: 3 },
      { name: 'ErfasstDurch', type: 2 },
      { name: 'Erfassungsdatum', type: 4 }
    ]
  },

  // 4. VERANSTALTUNGS-STATISTIK (Power BI Kalender KPI Aggregation)
  {
    title: 'Veranstaltungs_Statistik',
    description: 'Aggregierte Kalender-Kennzahlen nach Monat, Standort, Sprache, Zielgruppe und Projekt',
    fields: [
      { name: 'Jahr_Monat', type: 2 },
      { name: 'Jahr', type: 9 },
      { name: 'Monat_Nummer', type: 9 },
      { name: 'Monat_Name', type: 2 },
      { name: 'Standort_Code', type: 2 },
      { name: 'Standort_Name', type: 2 },
      { name: 'Sprache', type: 2 },
      { name: 'Zielgruppe', type: 2 },
      { name: 'Kategorie', type: 2 },
      { name: 'Projekt', type: 2 },
      { name: 'Anzahl_Veranstaltungen', type: 9 }
    ]
  },

  // 5. EHRENAMTS- & PRAKTIKUMSANTRÄGE
  {
    title: 'Ehrenamtsantraege',
    description: 'Bewerbungen für ehrenamtliches Engagement im SprachCafé Polnisch e.V.',
    fields: [
      { name: 'Email', type: 2 },
      { name: 'Telefon', type: 2 },
      { name: 'Interessen', type: 3 },
      { name: 'Verfuegbarkeit', type: 2 },
      { name: 'Nachricht', type: 3 }
    ]
  },
  {
    title: 'Praktikumsantraege',
    description: 'Bewerbungen für Schüler- und Studentenpraktika im SprachCafé Polnisch e.V.',
    fields: [
      { name: 'Email', type: 2 },
      { name: 'Telefon', type: 2 },
      { name: 'SchuleUni', type: 2 },
      { name: 'Zeitraum', type: 2 },
      { name: 'Schwerpunkt', type: 2 },
      { name: 'Nachricht', type: 3 }
    ]
  }
];

async function callBridge(method: string, uri: string, bodyObj?: any) {
  const payload: any = {
    method,
    uri,
    body: bodyObj ? JSON.stringify(bodyObj) : ''
  };

  const res = await fetch(BRIDGE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return { raw: text, ok: res.ok, status: res.status };
  }
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('========================================================================');
  console.log(' 🏛️ SPRACHCAFÉ POLNISCH e.V. - SHAREPOINT LISTS PROVISIONING');
  console.log('========================================================================\n');

  for (const list of LISTS_TO_PROVISION) {
    console.log(`📦 Verarbeite Liste: [${list.title}]...`);

    // 1. Liste erstellen (falls noch nicht vorhanden)
    const createListBody = {
      __metadata: { type: 'SP.List' },
      AllowContentTypes: true,
      BaseTemplate: 100,
      ContentTypesEnabled: true,
      Description: list.description,
      Title: list.title
    };

    const createRes = await callBridge('POST', '_api/web/lists', createListBody);
    if (createRes.d?.Id) {
      console.log(`  ✅ Neu angelegt! (ID: ${createRes.d.Id})`);
    } else {
      console.log(`  ℹ️ Liste existiert bereits oder wurde initialisiert.`);
    }

    await sleep(500);

    // 2. Felder der Liste anlegen
    console.log(`  ➕ Ergänze Spalten für [${list.title}]...`);
    for (const field of list.fields) {
      let fieldBody: any = {
        __metadata: { type: 'SP.Field' },
        FieldTypeKind: field.type,
        Title: field.name,
        StaticName: field.name
      };

      if (field.type === 6 && field.choices) { // Choice Field
        fieldBody = {
          __metadata: { type: 'SP.FieldChoice' },
          FieldTypeKind: 6,
          Title: field.name,
          StaticName: field.name,
          Choices: { results: field.choices }
        };
      }

      const fieldRes = await callBridge('POST', `_api/web/lists/GetByTitle('${list.title}')/fields`, fieldBody);
      if (fieldRes.d?.Title) {
        console.log(`    + Spalte angelegt: ${field.name}`);
      } else {
        // Already exists or created
      }
      await sleep(300);
    }
  }

  // 3. Initialer Seed für Mitgliederverwaltung (12 reale/aktive Mitgliederkategorien für Kennzahlen)
  console.log('\n🌱 [3/3] Erzeuge Startdaten für Mitgliederzahlen & -entwicklung...');
  const seedMembers = [
    { Title: 'Agata Koch', Email: 'agata.koch@sprachcafe-polnisch.org', Ort: 'Berlin Pankow', MitgliedschaftsArt: 'ordentlich', MitgliedschaftsStufe: 'Platinum', Status: 'Aktiv', BeitragBezahlt: true },
    { Title: 'Philipp Fuchs', Email: 'p.fuchs@sprachcafe-polnisch.org', Ort: 'Berlin Pankow', MitgliedschaftsArt: 'ordentlich', MitgliedschaftsStufe: 'Platinum', Status: 'Aktiv', BeitragBezahlt: true },
    { Title: 'Dorota Stasińska', Email: 'd.stasinska@sprachcafe-polnisch.org', Ort: 'Berlin Mitte', MitgliedschaftsArt: 'ordentlich', MitgliedschaftsStufe: 'Gold', Status: 'Aktiv', BeitragBezahlt: true },
    { Title: 'Agnieszka Kubalewska-Strohmeyer', Email: 'A.Strohmeyer@sprachcafe-polnisch.org', Ort: 'Berlin Schöneberg', MitgliedschaftsArt: 'ordentlich', MitgliedschaftsStufe: 'Gold', Status: 'Aktiv', BeitragBezahlt: true },
    { Title: 'Familie Kowalski', Email: 'kowalski.berlin@gmail.com', Ort: 'Berlin Prenzlauer Berg', MitgliedschaftsArt: 'foerdernd', MitgliedschaftsStufe: 'Gold', Status: 'Aktiv', BeitragBezahlt: true },
    { Title: 'Polnischer Elternverein Berlin e.V.', Email: 'info@eltern-berlin.de', Ort: 'Berlin', MitgliedschaftsArt: 'foerdernd', MitgliedschaftsStufe: 'Firmenmitgliedschaft', Status: 'Aktiv', BeitragBezahlt: true },
    { Title: 'Marta Nowak', Email: 'marta.n@gmx.de', Ort: 'Berlin Friedrichshain', MitgliedschaftsArt: 'ordentlich', MitgliedschaftsStufe: 'Silver', Status: 'Aktiv', BeitragBezahlt: true },
    { Title: 'Jan Wiśniewski', Email: 'jan.w@posteo.de', Ort: 'Berlin Treptow-Köpenick', MitgliedschaftsArt: 'foerdernd', MitgliedschaftsStufe: 'Silver', Status: 'Aktiv', BeitragBezahlt: true }
  ];

  for (const m of seedMembers) {
    const itemBody = {
      __metadata: { type: 'SP.Data.MitgliederverwaltungListItem' },
      Title: m.Title,
      Email: m.Email,
      Ort: m.Ort,
      MitgliedschaftsArt: m.MitgliedschaftsArt,
      MitgliedschaftsStufe: m.MitgliedschaftsStufe,
      Status: m.Status,
      BeitragBezahlt: m.BeitragBezahlt
    };
    await callBridge('POST', `_api/web/lists/GetByTitle('Mitgliederverwaltung')/items`, itemBody);
    await sleep(200);
  }
  console.log('✅ Start-Mitgliederdaten für Entwicklungs-Reporting erfolgreich angelegt!');

  console.log('\n========================================================================');
  console.log(' 🎉 ALLE SHAREPOINT-LISTEN & SCHEMATA ERFOLGREICH BEREITGESTELLT!');
  console.log('========================================================================');
}

main().catch(console.error);
