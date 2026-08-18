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

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function sanitizeYamlString(str: string): string {
  return str.replace(/"/g, '\\"').replace(/\n/g, ' ');
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
          const dedupeKey = `${slugify(rawTitle)}-${startDate.toISOString()}-${cal.locationRef}`;

          if (processedEventsMap.has(dedupeKey)) {
            continue; // Skip duplicate overlapping event
          }

          const descText = rawDesc ? rawDesc : `Veranstaltung "${rawTitle}" im SprachCafé (${cal.name}).`;

          const eventObj: UnifiedEvent = {
            title: {
              de: rawTitle,
              pl: rawTitle,
              en: rawTitle,
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
                de: rawTitle,
                pl: rawTitle,
                en: rawTitle,
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
}

syncGoogleCalendars().catch((err) => {
  console.error('❌ Error during Google Calendar Sync:', err);
  process.exit(1);
});
