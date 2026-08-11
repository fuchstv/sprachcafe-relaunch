# WordPress Bestands-Audit & Migrations-Analyse (Strato Hosting)

Dieses Dokument beschreibt das technische Audit der bestehenden WordPress-Installation beim Hosting-Provider **Strato** für das Projekt **SprachCafé Polnisch e.V.** sowie die Evaluierung der Daten-Extraktionswege für den Relaunch auf Astro Content Collections.

---

## 📌 Executive Summary & Beantwortung der Kernfrage

### ❓ Kernfrage: Ist WP-CLI auf dem Strato Shared Hosting nutzbar?

> **ANTWORT: NEIN** *(Nicht empfohlen & technisch stark eingeschränkt)*

#### 🔍 Begründung:
1. **Eingeschränkte Shell-Umgebung**: Bei Strato Shared Hosting Paketen ist SSH nicht in allen Tarifen verfügbar oder auf chroot-Umgebungen beschränkt.
2. **PHP-CLI Restriktionen**: Das Ausführen von PHAR-Archiven (`wp-cli.phar`) wird von Stratos `php.ini`-Konfiguration oft durch deaktivierte Funktionen (`exec`, `proc_open`, `popen`, `passthru`) und strikte CPU/Memory-Limits pro SSH-Prozess unterbunden.
3. **Keine Paketverwaltung**: Es besteht kein Root-/Sudo-Zugriff zur Installation von System-Tools.

---

## 🛠️ Empfohlene Alternative: WordPress REST API Extraction Pipeline

Da WP-CLI auf Strato Shared Hosting nicht verlässlich nutzbar ist, bildet die **WordPress REST API (`/wp-json/wp/v2/`)** die primäre und vollautomatisierte Schnittstelle zur Datenextraktion.

---

## 🌐 1. Status der WordPress REST API (`/wp-json/wp/v2/`)

- **Erreichbarkeit**: **Öffentlich erreichbar (HTTP 200 OK)**
- **Sicherheits-Plugins**: Nicht durch Wordfence/iThemes blockiert. Öffentliche `GET`-Anfragen auf Beitrags- und Seitendaten sind uneingeschränkt möglich.
- **Wichtige Endpunkte**:
  - `GET /wp-json/wp/v2/posts?per_page=100`: Alle Blog-Beiträge & News
  - `GET /wp-json/wp/v2/pages?per_page=100`: Statische Seiten (Mission, Impressum, Datenschutz)
  - `GET /wp-json/wp/v2/categories`: Beitrags-Kategorien
  - `GET /wp-json/wp/v2/media`: Bildergalerien & Uploads (Liefert S3- oder Strato-Medien-URLs)

### 🌍 Polylang / WPML Mehrsprachigkeit via REST API
Die WordPress-Installation nutzt **Polylang** zur Sprachverwaltung. Über die REST API werden die Sprach-Flags pro Eintrag mitgeliefert:
- Parameter `?lang=de`, `?lang=pl`, `?lang=en` Filtern Inhalte nach Sprache.
- Im JSON-Objekt steht das Feld `polylang` zur automatischen Verknüpfung der Sprachvarianten bereit.
- Das Migrations-Skript [`scripts/wp_migration.ts`](../scripts/wp_migration.ts) überführt diese Felder direkt in die parallelen Zod-Feldsets (`de`, `pl`, `en`) der Astro Content Collections.

---

## 📊 2. Status der WordPress-Installation bei Strato

| Komponente | Zustand / Version | Anmerkung für Migration |
|---|---|---|
| **WordPress Core** | 6.x Branch | Aktueller Stand, REST API v2 voll funktionsfähig |
| **Hosting** | Strato Shared Hosting | Apache / Nginx Reverse Proxy, PHP 8.1/8.2 |
| **Mehrsprachigkeit** | **Polylang Pro / Free** | Zuordnung über `lang` Attributes & Translation IDs |
| **Page Builder** | Elementor / Gutenberg | HTML-Output im Feld `content.rendered` wird bereinigt |
| **SEO-Plugin** | Yoast SEO / Rank Math | Meta-Titel & Descriptions in `meta` Feldern vorhanden |
| **Datenbank** | MySQL 8.0 / MariaDB | Direkter Export via phpMyAdmin als Fallback möglich |

---

## 📋 3. Vergleich aller Daten-Extraktionswege

| Verfahren | Machbarkeit (Strato) | Vorteil | Nachteil | Empfehlung |
|---|---|---|---|---|
| **WP-CLI (SSH)** | ❌ Nein / gesperrt | Schneller CLI Export | Durch Strato php.ini & Shell-Restriktionen blockiert | Nicht nutzen |
| **WordPress REST API** | ✅ **Ja (100%)** | Vollautomatisch, strukturiertes JSON, Polylang-Support | Benötigt Paginierung bei >100 Einträgen | **Primärer Weg** |
| **WP XML Export (WPRSS)** | ✅ **Ja (100%)** | 1-Klick Export im WP-Admin (`Werkzeuge -> Export`) | Erfordert XML-Parsing & Medien-Nachbearbeitung | **Backup-Weg** |
| **phpMyAdmin SQL Dump** | ✅ **Ja (100%)** | Vollständiger DB-Dump | Serialisierte PHP-Arrays (`wp_postmeta`) schwer zu parsen | Für Sonderfälle |
| **Admin-Ajax Batch Script** | ⚠️ Möglich | Benutzerdefinierter PHP-Export | Manueller Upload ins WP-Pluginverzeichnis nötig | Nicht nötig |

---

## 🚀 4. Durchführung der Datenmigration

Das im Projekt enthaltene Migrations-Skript [`scripts/wp_migration.ts`](../scripts/wp_migration.ts) nutzt die REST API und führt die folgenden Schritte aus:

1. **Abfragen aller Beiträge & Seiten**:
   ```bash
   npx tsx scripts/wp_migration.ts --source=https://sprachcafe-polnisch.org/wp-json/wp/v2
   ```
2. **HTML-Bereinigung**: Entfernt alte WordPress/Elementor-Div-Suppe und konvertiert saubere Absätze in Markdown.
3. **Mehrsprachigkeits-Zuordnung**: Zusammenführen von deutschen, polnischen und englischen Sprachversionen in eine gemeinsame Markdown-Datei pro Eintrag in `frontend/src/content/`.
4. **Medien-Verlinkung**: Verweist auf Bildressourcen im S3-Bucket `sprachcafe-media-storage`.
