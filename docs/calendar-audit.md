# Google Calendar Audit & Integration-Konzept (`/docs/calendar-audit.md`)

Dieses Dokument enthält das Audit aller auf `sprachcafe-polnisch.org` eingebetteten Google Kalender, deren Dekodierung, Zuordnung zu den Standorten/Zielgruppen des SprachCafé Polnisch e.V. sowie den präferierten Zugriffsweg für das Astro Frontend.

---

## 📊 Zusammenfassung & Architektur-Entscheidung

- **Gefundene Kalender**: **9 öffentliche Kalender** (6 auf `/veranstaltungen/` für Erwachsene/Allgemein, 3 weitere auf `/sprachcafe-fuer-kinder/`).
- **Zugriffsweg**: **Direkter öffentlicher iCal-Feed (`.ics`)**.
- **Ergebnis der Erreichbarkeits-Prüfung**: **100% der Kalender sind öffentlich freigegeben (`HTTP 200 OK`)**.
- **Vorteil**: **Kein Google-Cloud-Projekt, kein API-Key und keine OAuth-Kosten erforderlich**. Die Termine können beim Static-Site-Build (Astro SSG) oder zur Laufzeit via nativem `.ics`-Parser (z. B. `ical.js` / Node-fetch) direkt verarbeitet und performant gerendert werden.

---

## 📅 Audit-Tabelle aller Google-Kalender

### 1. Veranstaltungen (Erwachsene & Allgemein auf `/veranstaltungen/`)

| Kalender-Name | Standort / Zielgruppe | Farb-Code | Dekodierte Kalender-ID | Öffentlicher `.ics` Feed Access | Gewählter Zugriffsweg |
|---|---|---|---|---|---|
| **SCP Nord** | **Pankow** (Schulzestr. 1) | `#f09300` (Orange) | `5c43af4b26dc06a1c1f9b94d48f13c31d597bbbb25ce4c2be3a27edb452754c9@group.calendar.google.com` | `200 OK` | **iCal (.ics Feed)** |
| **SCP Süd** | **Schöneberg** (Hauptstr. 121 A) | `#3f51b5` (Indigo/Blau) | `a5f096a27b55baa8618e30fcb9f1c7d5c597ac026cacaf2b89685b2c3ac22b8b@group.calendar.google.com` | `200 OK` | **iCal (.ics Feed)** |
| **SCP Süd-Ost** | **Köpenick** (Am Wiesengraben 7a) | `#7986cb` (Hellblau) | `817c5d5707afcbf1f9d5a54fd41247dc7c50938594b2064604ecd639ab5f5ae3@group.calendar.google.com` | `200 OK` | **iCal (.ics Feed)** |
| **SCP andere Orte** | **Externe Partnerorte** | `#7986cb` (Hellblau) | `fa938ae5274500ff1f9f683ffb56241e4145839e53d8f4554d544fd5370a9e71@group.calendar.google.com` | `200 OK` | **iCal (.ics Feed)** |
| **SCP online** | **Virtuell / Zoom / Teams** | `#4285f4` (Google Blau) | `9581f01fe441e9cdbe7573d6ce7c67f444664812fc00cc59151349125e0cfc84@group.calendar.google.com` | `200 OK` | **iCal (.ics Feed)** |
| **SCiO** | **Partner-Netzwerke** | `#616161` (Grau) | `13a128268712234ccd1139a4f96d530693d8ba92fa7fec8671d41ac4c625214a@group.calendar.google.com` | `200 OK` | **iCal (.ics Feed)** |

---

### 2. Kinder- & Familienveranstaltungen (auf `/sprachcafe-fuer-kinder/`)

| Kalender-Name | Standort / Zielgruppe | Farb-Code | Dekodierte Kalender-ID | Öffentlicher `.ics` Feed Access | Gewählter Zugriffsweg |
|---|---|---|---|---|---|
| **SCP Kinder Nord** | **Kinder Pankow** | `#9e69af` (Lila) | `fd80c9e5beead5130f7e445d11a0f7dd356096a07defabed8c2673f033f9b259@group.calendar.google.com` | `200 OK` | **iCal (.ics Feed)** |
| **SCP Kinder Süd** | **Kinder Schöneberg** | `#c0ca33` (Lime) | `645fea42657cb3982ae8ced928617fbd26d9b5770c217b0d12598950e3b960ab@group.calendar.google.com` | `200 OK` | **iCal (.ics Feed)** |
| **SCP Kinder Süd-Ost** | **Kinder Köpenick** | `#009688` (Türkis) | `d881fe1105ce6e23368ad5909b4e57b2d1e41ccda2899bba772723e328ac064b@group.calendar.google.com` | `200 OK` | **iCal (.ics Feed)** |

---

## 🛠️ Dekodierungs-Methodik (Base64 -> Google Calendar ID)

Die im `src`-Parameter des Google Calendar Embed-Iframes angegebenen Zeichenketten sind Standard **Base64-kodierte Google Calendar IDs**.

### Beispiel-Dekodierung:
- **Embed URL Parameter**: `src=NWM0M2FmNGIyNmRjMDZhMWMxZjliOTRkNDhmMTNjMzFkNTk3YmJiYjI1Y2U0YzJiZTNhMjdlZGI0NTI3NTRjOUBncm91cC5jYWxlbmRhci5nb29nbGUuY29t`
- **Base64 Decode**: `5c43af4b26dc06a1c1f9b94d48f13c31d597bbbb25ce4c2be3a27edb452754c9@group.calendar.google.com`
- **iCal Feed URL Format**:
  `https://calendar.google.com/calendar/ical/<DECODED_CALENDAR_ID>/public/basic.ics`

---

## ⚡ Implementierungsempfehlung für Astro Frontend

1. **Kein Google Cloud API-Key erforderlich**: Da alle Kalender öffentlich sind, entfällt die Registrierung eines Google Cloud Projekts und die Nutzung kostenpflichtiger/quotenbegrenzter Google API Keys.
2. **SSG Build-Sync / Dynamic Fetching**:
   - Die Termine können beim Astro Static Site Build abgerufen und gecacht werden.
   - Alternativ kann eine leichte Client-Side Komponente oder Astro Server Endpunkte (`/api/events.json`) die `.ics`-Dateien parsen.
3. **Filterung & Farbschema**:
   - Die in der Tabelle dokumentierten Farb-Codes (`#f09300`, `#3f51b5`, `#9e69af` etc.) können direkt im Tailwind/CSS-Designsystem für Standort- und Zielgruppen-Badges übernommen werden.
