# Phase 4: Headless CMS (`/cms`)

Verzeichnis für die Headless CMS Konfiguration, Collections-Schemata und Docker-Container-Setup.

## Datenbank-Engine: Embedded SQLite

Aus Ressourcen-Gründen auf der 2 GB Lightsail-Instanz nutzt das Headless CMS eine **eingebettete SQLite-Datenbank** (`DB_CLIENT=sqlite3`).
- **Dateipfad**: `/opt/sprachcafe/cms-data/cms.db`
- **Vorteil**: Null RAM-Overhead für einen zweiten RDBMS-Server-Daemon, spart ~250 MB RAM im Vergleich zu PostgreSQL.

## Struktur

- `collections/`: JSON-Definitionen der Inhaltstypen/Collections (Veranstaltungen, News, Statische Seiten, Hausbibliothek).
- `Dockerfile`: Container-Image Bauanleitung für das CMS.
- `index.js`: Service Entrypoint & API Server.

## Integration mit Power Automate

Bei Erstellung oder Aktualisierung von Anmeldungen oder Formulardaten (z. B. Mitgliedsanträge, Event-Anmeldungen) löst das CMS Webhooks zu Microsoft Power Automate aus (siehe `.env.example`).
