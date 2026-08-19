#!/usr/bin/env npx tsx
/**
 * Google Calendars iCal Synchronization Script (Phase R1.2)
 * SprachCafé Relaunch Monorepo
 *
 * Purpose:
 * Fetches all 9 public Google Calendars via iCal (.ics feeds), expands RRULE recurring events,
 * derives locationRef and targetAudience directly from calendar metadata, filters events by
 * date window (-7 to +90 days), deduplicates overlapping entries, and generates valid Astro
 * Content Collection Markdown files in `frontend/src/content/events/`.
 */

import fs from 'fs';
import path from 'path';
import ical from 'node-ical';
import he from 'he';

const scriptDir = path.dirname(new URL(import.meta.url).pathname);
const EVENTS_DIR = path.resolve(scriptDir, '../frontend/src/content/events');

// Date Window Configuration (-7 days past to +90 days future)
const PAST_DAYS = 7;
const FUTURE_DAYS = 90;

const now = new Date();
const startWindow = new Date(now.getTime() - PAST_DAYS * 24 * 60 * 60 * 1000);
const endWindow = new Date(now.getTime() + FUTURE_DAYS * 24 * 60 * 60 * 1000);

export interface CalendarSource {
  name: string;
  decodedId: string;
  locationRef: string;
  targetAudience: { de: string; pl: string; en: string };
  defaultImage: string;
}

export const CALENDARS: CalendarSource[] = [
  // Hauptveranstaltungen (Erwachsene & Allgemein)
  {
    name: 'SCP Nord',
    decodedId: '5c43af4b26dc06a1c1f9b94d48f13c31d597bbbb25ce4c2be3a27edb452754c9@group.calendar.google.com',
    locationRef: 'pankow',
    targetAudience: { de: 'Erwachsene & Familien', pl: 'Dorośli i rodziny', en: 'Adults & Families' },
    defaultImage: '/images/events/pankow-event.svg',
  },
  {
    name: 'SCP Süd',
    decodedId: 'a5f096a27b55baa8618e30fcb9f1c7d5c597ac026cacaf2b89685b2c3ac22b8b@group.calendar.google.com',
    locationRef: 'schoeneberg',
    targetAudience: { de: 'Erwachsene & Familien', pl: 'Dorośli i rodziny', en: 'Adults & Families' },
    defaultImage: '/images/events/schoeneberg-event.svg',
  },
  {
    name: 'SCP Süd-Ost',
    decodedId: '817c5d5707afcbf1f9d5a54fd41247dc7c50938594b2064604ecd639ab5f5ae3@group.calendar.google.com',
    locationRef: 'koepenick',
    targetAudience: { de: 'Erwachsene & Familien', pl: 'Dorośli i rodziny', en: 'Adults & Families' },
    defaultImage: '/images/events/koepenick-event.svg',
  },
  {
    name: 'SCP andere Orte',
    decodedId: 'fa938ae5274500ff1f9f683ffb56241e4145839e53d8f4554d544fd5370a9e71@group.calendar.google.com',
    locationRef: 'partnerorte',
    targetAudience: { de: 'Alle Interessierten', pl: 'Wszyscy zainteresowani', en: 'All Interested' },
    defaultImage: '/images/events/default-event.svg',
  },
  {
    name: 'SCP online',
    decodedId: '9581f01fe441e9cdbe7573d6ce7c67f444664812fc00cc59151349125e0cfc84@group.calendar.google.com',
    locationRef: 'online',
    targetAudience: { de: 'Alle Interessierten', pl: 'Wszyscy zainteresowani', en: 'All Interested' },
    defaultImage: '/images/events/default-event.svg',
  },
  {
    name: 'SCiO',
    decodedId: '13a128268712234ccd1139a4f96d530693d8ba92fa7fec8671d41ac4c625214a@group.calendar.google.com',
    locationRef: 'partnerorte',
    targetAudience: { de: 'Netzwerk & SprachCafé Treffen', pl: 'Sieć i spotkania SprachCafé', en: 'Network & LanguageCafé Meetings' },
    defaultImage: '/images/events/default-event.svg',
  },
  // Kinder- & Familienveranstaltungen
  {
    name: 'SCP Kinder Nord',
    decodedId: 'fd80c9e5beead5130f7e445d11a0f7dd356096a07defabed8c2673f033f9b259@group.calendar.google.com',
    locationRef: 'pankow',
    targetAudience: { de: 'Kinder & Eltern', pl: 'Dzieci i rodzice', en: 'Children & Parents' },
    defaultImage: '/images/events/kinder-event.svg',
  },
  {
    name: 'SCP Kinder Süd',
    decodedId: '645fea42657cb3982ae8ced928617fbd26d9b5770c217b0d12598950e3b960ab@group.calendar.google.com',
    locationRef: 'schoeneberg',
    targetAudience: { de: 'Kinder & Eltern', pl: 'Dzieci i rodzice', en: 'Children & Parents' },
    defaultImage: '/images/events/kinder-event.svg',
  },
  {
    name: 'SCP Kinder Süd-Ost',
    decodedId: 'd881fe1105ce6e23368ad5909b4e57b2d1e41ccda2899bba772723e328ac064b@group.calendar.google.com',
    locationRef: 'koepenick',
    targetAudience: { de: 'Kinder & Eltern', pl: 'Dzieci i rodzice', en: 'Children & Parents' },
    defaultImage: '/images/events/kinder-event.svg',
  },
];

export interface UnifiedEvent {
  title: { de: string; pl: string; en: string };
  date: Date;
  endDate?: Date;
  locationRef: string;
  targetAudience: { de: string; pl: string; en: string };
  language: ('de' | 'pl' | 'en')[];
  description: { de: string; pl: string; en: string };
  image: { src: string; alt: { de: string; pl: string; en: string } };
  isFeatured: boolean;
  sourceCalendar: string;
  idKey: string;
}

function decodeHtmlEntities(str: string): string {
  if (!str) return '';
  let res = str;
  try {
    if (typeof he !== 'undefined' && he && he.decode) {
      let prev = res;
      res = he.decode(res);
      while (res !== prev && /&[a-zA-Z0-9#]+;/.test(res)) {
        prev = res;
        res = he.decode(res);
      }
      return res;
    }
  } catch (e) {}

  const htmlEntityMap: Record<string, string> = {
    '&quot;': '"',
    '&#34;': '"',
    '&apos;': "'",
    '&#39;': "'",
    '&#039;': "'",
    '&amp;': '&',
    '&#38;': '&',
    '&lt;': '<',
    '&#60;': '<',
    '&gt;': '>',
    '&#62;': '>',
    '&nbsp;': ' ',
    '&#160;': ' ',
    '&ndash;': '–',
    '&#8211;': '–',
    '&mdash;': '—',
    '&#8212;': '—',
    '&lsquo;': '‘',
    '&#8216;': '‘',
    '&rsquo;': '’',
    '&#8217;': '’',
    '&ldquo;': '“',
    '&#8220;': '“',
    '&rdquo;': '”',
    '&#8221;': '”',
    '&bdquo;': '„',
    '&#8222;': '„',
    '&laquo;': '«',
    '&#171;': '«',
    '&raquo;': '»',
    '&#187;': '»',
    '&hellip;': '…',
    '&#8230;': '…',
  };

  res = res.replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)));
  res = res.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
  res = res.replace(/&(?:quot|apos|amp|lt|gt|nbsp|ndash|mdash|lsquo|rsquo|ldquo|rdquo|bdquo|laquo|raquo|hellip);/g, (match) => htmlEntityMap[match] || match);
  return res;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function sanitizeYamlString(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\r?\n/g, ' ');
}

async function syncGoogleCalendars() {
  console.log('⚡ STARTING GOOGLE CALENDAR ICAL SYNC (BUILD STEP R1.2)');
  console.log(`📅 Date Window: ${startWindow.toISOString().split('T')[0]} to ${endWindow.toISOString().split('T')[0]}`);

  const processedEventsMap = new Map<string, UnifiedEvent>();
  let totalRawParsed = 0;
  let totalExpandedInWindow = 0;

  for (const cal of CALENDARS) {
    const icalUrl = `https://calendar.google.com/calendar/ical/${encodeURIComponent(cal.decodedId)}/public/basic.ics`;
    console.log(`📡 Fetching Calendar [${cal.name}] (${cal.locationRef})...`);

    try {
      const rawData = await ical.async.fromURL(icalUrl);
      const rawKeys = Object.keys(rawData);
      totalRawParsed += rawKeys.length;

      for (const k of rawKeys) {
        const item = rawData[k];
        if (!item || item.type !== 'VEVENT') continue;

        const rawTitle = (item.summary || 'Veranstaltung').trim();
        const rawDesc = (item.description || '').trim();
        const cleanTitle = decodeHtmlEntities(rawTitle).trim();
        const cleanDesc = decodeHtmlEntities(rawDesc).trim();
        const eventDuration = item.end && item.start ? item.end.getTime() - item.start.getTime() : 2 * 60 * 60 * 1000;

        let instanceDates: Date[] = [];

        if (item.rrule) {
          // Expand RRULE recurrences within window
          try {
            instanceDates = item.rrule.between(startWindow, endWindow, true);
          } catch (e) {
            // Fallback if rrule fails
            if (item.start >= startWindow && item.start <= endWindow) {
              instanceDates = [item.start];
            }
          }
        } else if (item.start && item.start >= startWindow && item.start <= endWindow) {
          instanceDates = [item.start];
        }

        for (const startDate of instanceDates) {
          totalExpandedInWindow++;
          const endDate = new Date(startDate.getTime() + eventDuration);

          // Unique Deduplication Key: title + startDate + locationRef
          const dedupeKey = `${slugify(cleanTitle)}-${startDate.toISOString()}-${cal.locationRef}`;

          if (processedEventsMap.has(dedupeKey)) {
            continue; // Skip duplicate overlapping event
          }

          const descText = cleanDesc ? cleanDesc : `Veranstaltung "${cleanTitle}" im SprachCafé (${cal.name}).`;

          const eventObj: UnifiedEvent = {
            title: {
              de: cleanTitle,
              pl: cleanTitle,
              en: cleanTitle,
            },
            date: startDate,
            endDate: endDate,
            locationRef: cal.locationRef,
            targetAudience: cal.targetAudience,
            language: ['de', 'pl'],
            description: {
              de: descText,
              pl: descText,
              en: descText,
            },
            image: {
              src: cal.defaultImage,
              alt: {
                de: cleanTitle,
                pl: cleanTitle,
                en: cleanTitle,
              },
            },
            isFeatured: false,
            sourceCalendar: cal.name,
            idKey: dedupeKey,
          };

          processedEventsMap.set(dedupeKey, eventObj);
        }
      }
    } catch (err: any) {
      console.warn(`⚠️ Warning: Could not fetch calendar [${cal.name}]:`, err.message);
    }
  }

  const allEvents = Array.from(processedEventsMap.values());
  // Sort events chronologically
  allEvents.sort((a, b) => a.date.getTime() - b.date.getTime());

  // Mark top 3 upcoming events as featured
  let featuredCount = 0;
  for (const ev of allEvents) {
    if (ev.date >= now && featuredCount < 3) {
      ev.isFeatured = true;
      featuredCount++;
    }
  }

  console.log(`✅ Extracted ${allEvents.length} unique events after deduplication (from ${totalExpandedInWindow} total instances across ${totalRawParsed} raw items).`);

  // Clean old gcal-*.md auto-generated files from content/events directory
  if (!fs.existsSync(EVENTS_DIR)) {
    fs.mkdirSync(EVENTS_DIR, { recursive: true });
  }

  const existingFiles = fs.readdirSync(EVENTS_DIR);
  for (const file of existingFiles) {
    if (file.startsWith('gcal-') && file.endsWith('.md')) {
      fs.unlinkSync(path.join(EVENTS_DIR, file));
    }
  }

  // Write new Markdown files for Content Collection
  let writtenFilesCount = 0;
  for (const ev of allEvents) {
    const slugDate = ev.date.toISOString().split('T')[0];
    const fileSlug = `gcal-${slugDate}-${slugify(ev.title.de).substring(0, 30)}-${ev.locationRef}`;
    const filePath = path.join(EVENTS_DIR, `${fileSlug}.md`);

    const markdownContent = `---
title:
  de: "${sanitizeYamlString(ev.title.de)}"
  pl: "${sanitizeYamlString(ev.title.pl)}"
  en: "${sanitizeYamlString(ev.title.en)}"
date: ${ev.date.toISOString()}
endDate: ${ev.endDate ? ev.endDate.toISOString() : ''}
locationRef: "${ev.locationRef}"
targetAudience:
  de: "${sanitizeYamlString(ev.targetAudience.de)}"
  pl: "${sanitizeYamlString(ev.targetAudience.pl)}"
  en: "${sanitizeYamlString(ev.targetAudience.en)}"
language:
  - "de"
  - "pl"
description:
  de: "${sanitizeYamlString(ev.description.de)}"
  pl: "${sanitizeYamlString(ev.description.pl)}"
  en: "${sanitizeYamlString(ev.description.en)}"
image:
  src: "${ev.image.src}"
  alt:
    de: "${sanitizeYamlString(ev.image.alt.de)}"
    pl: "${sanitizeYamlString(ev.image.alt.pl)}"
    en: "${sanitizeYamlString(ev.image.alt.en)}"
isFeatured: ${ev.isFeatured}
---
`;

    fs.writeFileSync(filePath, markdownContent, 'utf-8');
    writtenFilesCount++;
  }

  console.log(`🚀 Successfully wrote ${writtenFilesCount} event files to ${EVENTS_DIR}`);

  // ============================================================================
  // 📊 KPI & POWER BI / SHAREPOINT REPORTING AGGREGATION (Task S.2 / S.3)
  // ============================================================================
  generateKpiReports(allEvents);
}

const LOCATION_NAMES: Record<string, string> = {
  pankow: 'Pankow (Schulzestraße / Stadtteilzentrum)',
  schoeneberg: 'Schöneberg',
  koepenick: 'Köpenick',
  partnerorte: 'Partnerorte / Bibliotheken',
  online: 'Online / Digital',
};

const MONTH_NAMES_DE = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'
];

const WEEKDAY_NAMES_DE = [
  'Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'
];

function deriveCategory(title: string, sourceCalendar: string): string {
  const t = (title + ' ' + sourceCalendar).toLowerCase();
  if (t.includes('kinder') || t.includes('dzieci') || t.includes('rodzic') || t.includes('eltern') || t.includes('fauler sonntag') || t.includes('poczytajmy')) {
    return 'Kinder & Familie';
  }
  if (t.includes('tandem') || t.includes('speak') || t.includes('język') || t.includes('polnisch') || t.includes('deutsch') || t.includes('konversation') || t.includes('lernen')) {
    return 'Sprachpraxis & Tandem';
  }
  if (t.includes('team') || t.includes('spotkanie') || t.includes('treffen') || t.includes('zebranie') || t.includes('mitglied')) {
    return 'Ehrenamt & Vereinsleben';
  }
  return 'Kunst, Kultur & Literatur';
}

function extractProject(title: string, desc: string): string {
  const fullText = `${title} ${desc}`;
  const matchHashtag = fullText.match(/#(projekt|project)-([a-zA-Z0-9_-]+)/i);
  if (matchHashtag) return matchHashtag[2].toUpperCase();

  const matchBracket = fullText.match(/\[(?:projekt|project):\s*([^\]]+)\]/i);
  if (matchBracket) return matchBracket[1].trim();

  return 'Regulärer Vereinsbetrieb';
}

interface KpiSummaryRow {
  jahrMonat: string;
  jahr: number;
  monatNummer: number;
  monatName: string;
  standortCode: string;
  standortName: string;
  sprache: string;
  zielgruppe: string;
  kategorie: string;
  projekt: string;
  anzahlVeranstaltungen: number;
}

function generateKpiReports(allEvents: UnifiedEvent[]) {
  console.log('\n📊 Generating KPI Summary & Power BI Export Tables...');

  const summaryMap = new Map<string, KpiSummaryRow>();
  const detailRows: string[] = [
    'Event_ID,Titel,Datum,Uhrzeit_Start,Uhrzeit_Ende,Dauer_Minuten,Jahr_Monat,Jahr,Monat,Wochentag,Standort_Code,Standort_Name,Zielgruppe_DE,Zielgruppe_PL,Sprachen,Kategorie,Projekt,Kalender_Quelle'
  ];

  for (const ev of allEvents) {
    const d = ev.date;
    const year = d.getFullYear();
    const monthNum = d.getMonth() + 1;
    const yearMonth = `${year}-${String(monthNum).padStart(2, '0')}`;
    const monthName = MONTH_NAMES_DE[d.getMonth()];
    const weekday = WEEKDAY_NAMES_DE[d.getDay()];
    const locationName = LOCATION_NAMES[ev.locationRef] || ev.locationRef;
    const category = deriveCategory(ev.title.de, ev.sourceCalendar);
    const project = extractProject(ev.title.de, ev.description.de);
    const languages = 'Polnisch / Deutsch';
    const targetAudience = ev.targetAudience.de;

    // Grouping Key for Aggregation
    const groupKey = `${yearMonth}|${ev.locationRef}|${languages}|${targetAudience}|${category}|${project}`;

    if (!summaryMap.has(groupKey)) {
      summaryMap.set(groupKey, {
        jahrMonat: yearMonth,
        jahr: year,
        monatNummer: monthNum,
        monatName: monthName,
        standortCode: ev.locationRef,
        standortName: locationName,
        sprache: languages,
        zielgruppe: targetAudience,
        kategorie: category,
        projekt: project,
        anzahlVeranstaltungen: 0,
      });
    }

    const row = summaryMap.get(groupKey)!;
    row.anzahlVeranstaltungen++;

    // Detail row formatting
    const timeStart = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
    const timeEnd = ev.endDate
      ? `${String(ev.endDate.getHours()).padStart(2, '0')}:${String(ev.endDate.getMinutes()).padStart(2, '0')}`
      : '';
    const durationMin = ev.endDate ? Math.round((ev.endDate.getTime() - d.getTime()) / 60000) : 120;
    const dateStr = d.toISOString().split('T')[0];

    const safeTitle = `"${ev.title.de.replace(/"/g, '""')}"`;
    const safeSource = `"${ev.sourceCalendar.replace(/"/g, '""')}"`;

    detailRows.push(
      `"${ev.idKey}",${safeTitle},${dateStr},${timeStart},${timeEnd},${durationMin},${yearMonth},${year},${monthNum},"${weekday}","${ev.locationRef}","${locationName}","${ev.targetAudience.de}","${ev.targetAudience.pl}","${languages}","${category}","${project}",${safeSource}`
    );
  }

  const summaryList = Array.from(summaryMap.values());
  // Sort summary by YearMonth, Location, Category
  summaryList.sort((a, b) => a.jahrMonat.localeCompare(b.jahrMonat) || a.standortCode.localeCompare(b.standortCode));

  // Build CSV with UTF-8 BOM (\uFEFF) for 100% native Excel / Power BI encoding compatibility
  const summaryCsvHeader = 'Jahr_Monat,Jahr,Monat_Nummer,Monat_Name,Standort_Code,Standort_Name,Sprache,Zielgruppe,Kategorie,Projekt,Anzahl_Veranstaltungen\n';
  const summaryCsvBody = summaryList
    .map(
      (r) =>
        `"${r.jahrMonat}",${r.jahr},${r.monatNummer},"${r.monatName}","${r.standortCode}","${r.standortName}","${r.sprache}","${r.zielgruppe}","${r.kategorie}","${r.projekt}",${r.anzahlVeranstaltungen}`
    )
    .join('\n');

  const summaryCsvContent = '\uFEFF' + summaryCsvHeader + summaryCsvBody;
  const detailCsvContent = '\uFEFF' + detailRows.join('\n');

  // Export Directories
  const scriptDir = path.dirname(new URL(import.meta.url).pathname);
  const EXPORTS_DIR = path.resolve(scriptDir, 'kpi_exports');
  const PUBLIC_DATA_DIR = path.resolve(scriptDir, '../frontend/public/data');

  if (!fs.existsSync(EXPORTS_DIR)) fs.mkdirSync(EXPORTS_DIR, { recursive: true });
  if (!fs.existsSync(PUBLIC_DATA_DIR)) fs.mkdirSync(PUBLIC_DATA_DIR, { recursive: true });

  // 1. Write Summary CSVs & JSON for Web & Local Power BI
  const summaryCsvPath = path.join(EXPORTS_DIR, 'Veranstaltungs_Kennzahlen.csv');
  const detailCsvPath = path.join(EXPORTS_DIR, 'Events_Detail_PowerBI.csv');
  const publicSummaryCsvPath = path.join(PUBLIC_DATA_DIR, 'calendar-kpi-summary.csv');
  const publicSummaryJsonPath = path.join(PUBLIC_DATA_DIR, 'calendar-kpi-summary.json');

  fs.writeFileSync(summaryCsvPath, summaryCsvContent, 'utf-8');
  fs.writeFileSync(detailCsvPath, detailCsvContent, 'utf-8');
  fs.writeFileSync(publicSummaryCsvPath, summaryCsvContent, 'utf-8');
  fs.writeFileSync(publicSummaryJsonPath, JSON.stringify(summaryList, null, 2), 'utf-8');

  console.log(`✅ Wrote KPI Summary Table: ${summaryCsvPath} (${summaryList.length} aggregated rows)`);
  console.log(`✅ Wrote Events Detail Table: ${detailCsvPath} (${detailRows.length - 1} event instances)`);
  console.log(`✅ Wrote Public Data Files to ${PUBLIC_DATA_DIR}`);

  // 2. Trigger Optional SharePoint / OneDrive Sync
  syncToSharePoint(summaryCsvContent, summaryList);
}

/**
 * Optional SharePoint / Power Automate Webhook Synchronizer
 * If SHAREPOINT_REPORTING_WEBHOOK is defined in environment, push summary table directly.
 */
async function syncToSharePoint(csvData: string, summary: KpiSummaryRow[]) {
  const webhookUrl = process.env.SHAREPOINT_REPORTING_WEBHOOK || process.env.REPORTING_WEBHOOK_URL;
  if (!webhookUrl) {
    console.log('ℹ️  SharePoint Webhook URL not set. Local files ready for SharePoint Folder / OneDrive sync.');
    return;
  }

  try {
    console.log('📡 Syncing KPI Summary Table to SharePoint via Power Automate Webhook...');
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileName: 'Veranstaltungs_Kennzahlen.csv',
        fileContentBase64: Buffer.from(csvData, 'utf-8').toString('base64'),
        rowCount: summary.length,
        timestamp: new Date().toISOString(),
        summaryData: summary,
      }),
    });

    if (response.ok) {
      console.log('✅ Successfully updated SharePoint Reporting Table!');
    } else {
      console.warn(`⚠️ SharePoint Webhook responded with status: ${response.status}`);
    }
  } catch (err: any) {
    console.warn('⚠️ Could not trigger SharePoint Webhook:', err.message);
  }
}

syncGoogleCalendars().catch((err) => {
  console.error('❌ Error during Google Calendar Sync:', err);
  process.exit(1);
});
