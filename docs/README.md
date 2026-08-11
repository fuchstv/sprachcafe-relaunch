# Projekt-Dokumentation (`/docs`)

Willkommen in der zentralen Dokumentation des SprachCafé Relaunch Projekts.

## Übersicht der Dokumente

- [Anleitung: Power Automate Flow 1 (Mitgliedsanträge)](./M365_POWER_AUTOMATE_SETUP_GUIDE.md): Schritt-für-Schritt Anleitung für Power Automate -> SharePoint -> Teams.
- [Power Automate Kontakt-Flow & M365 Exchange Relay](./POWER_AUTOMATE_CONTACT_FLOW.md): DSGVO-by-Design Kontaktformular (`ContactForm.astro`), 0 DB-Speicherung.
- [Power Automate Flow Integration](./POWER_AUTOMATE_FLOW.md): Client-Side Formular (`ApplicationForm.astro`), JSON Webhook -> SharePoint -> MS Teams.
- [GitHub Actions Webhook Dispatch](./CMS_WEBHOOK_DISPATCH.md): CMS-Webhook Trigger (`repository_dispatch`) für automatische Astro-Rebuilds.
- [Direktes S3 Media-Streaming](./CMS_S3_MEDIA.md): In-Memory Buffer -> S3 Streaming (0 Bytes SSD Cache) & HTTPS URLs.
- [CMS Collections & i18n Feldtypisierung](./CMS_COLLECTIONS.md): Schemas für Events, Posts, Books, Team & Pages (flexible Layout-Blöcke).
- [Headless CMS Setup & SQLite Backups](./CMS_SETUP.md): Node.js CMS Container (Port 3000), SQLite WAL, Token-Auth & Cron-Backups.
- [Such-Komponente & Performance-Benchmark](./SEARCH_BENCHMARK.md): Pagefind Client-Side Suchkomponente, Filter & Benchmark (< 15 ms Latency).
- [Pagefind Statische Volltextsuche](./PAGEFIND_SEARCH.md): Integration in Astro-Build (`pagefind --site dist`), `data-pagefind-filter` Attribute.
- [Design-Entscheidungsprotokoll](./design-decisions.md): Bewertung bestehender UI-Muster (Cookie-Banner Entfall, CSS-Scroll-Snap vs. Slider-Plugins).
- [DSGVO-Datenschutz-Konzept & Sicherheits-Audit](./DSGVO_KONZEPT.md): Zero-Attack-Surface vs. Hausbibliothek, Auth-Audit, Löschkonzept für inaktive Konten.
- [Hausbibliothek Audit & Architektur-Bewertung](./hausbibliothek-audit.md): Technischer Aufbau, PHP 8.4/MySQL 8.0, RAM/CPU-Messungen, Integrationsempfehlung.
- [Self-Hosted Schriftarten & Performance](./SELF_HOSTED_FONTS.md): Lokale WOFF2-Einbindung (`font-display: swap`), 0 externe Font-Anfragen, DSGVO & LCP < 1,5s.
- [WordPress zu Astro Komponenten-Mapping](./COMPONENT_MAPPING.md): Zuordnung aller Theme-Sektionen zu wiederverwendbaren Astro/Tailwind-Komponenten.
- [Marken-Assets & S3 Sync](./BRAND_ASSETS.md): Optimierung & S3-Upload aller Logos, Favicons, Social- & Herz-Icons.
- [Design-Tokens & WCAG Audit](./DESIGN_TOKENS.md): Benannte Tailwind-Tokens (Farben, Text-Marker, Typografie, Radien) & Kontrast-Matrix.
- [Visuelles Inventar & Design Audit](./design-audit.md): UI-Inventar der bestehenden Website (Desktop & Mobile) & wiederkehrende Muster.
- [Ressourcen- & Speicher-Optimierung](./RESOURCE_OPTIMIZATION.md): Analyse Hausbibliothek MySQL, SQLite-Wahl für CMS & Memory Budget.
- [Secrets Management & Sicherheit](./SECRETS_MANAGEMENT.md): Übersicht aller Secrets, Trennung GitHub Actions vs. Server `.env`, Pre-Commit & Gitleaks.
- [Lightsail Server-Struktur & Rechte](./LIGHTSAIL_SERVER_SETUP.md): Verzeichnislayout unter `/opt/sprachcafe/`, Rechte-Matrix & Hausbibliothek-Isolierung.
- [Branch-Strategie & Deployment-Pipeline](./BRANCHING_STRATEGY.md): Definition von `main`/`beta`, Caddy-Routing, Branch Protection & CI/CD Trigger.
- [System-Architektur & Diagramme](./architecture/architecture-overview.md): Übersicht über Komponenten, Schnittstellen und Datenflüsse.
- [Rollback-Prozedur (ROLLBACK.md)](./ROLLBACK.md): Schritt-für-Schritt-Anleitung zur Wiederherstellung bei kritischen Deployment-Fehlern.
- [WordPress Bestands-Audit & Strato-Analyse](./wordpress-audit.md): Analyse von WP-CLI Restriktionen, REST API Erreichbarkeit & Polylang Extraktion.
- [Redaktions-Workflow & Content-Pflege](./content-workflow.md): Anleitung & Evaluierung für Redakteur:innen (GitHub Web vs. Decap CMS).
- [Entscheidungsprotokoll: Verwerfen von Directus CMS zugunsten von Node.js Express & SQLite (ADR 0003)](./decisions/0003-retire-directus-cms.md): Dokumentation der Architektur-Entscheidung.
- [Entscheidungsprotokolle (ADRs)](./decisions/): Architectural Decision Records (ADRs) für wichtige technische Entscheidungen.

## Phasenübersicht des Relaunch-Projekts

| Phase | Bereich | Pfad | Beschreibung |
|-------|---------|------|--------------|
| **Phase 1** | Infrastruktur | `/infra` | Caddy Reverse Proxy, Docker-Compose, AWS Terraform Setup |
| **Phase 2** | Frontend | `/frontend` | Astro SSG/SSR Webanwendung, Component Design System |
| **Phase 3** | Formulare & Automatisierung | `/.env.example` / CMS | Power Automate Webhooks für Mitgliedsanträge, Anmeldungen |
| **Phase 4** | Headless CMS | `/cms` | Schemata, Collections, Content Management API & DB Setup |
| **Phase 5** | Hausbibliothek | `/cms` & `/frontend` | Bücherkatalog, Ausleihverwaltung, Webhook-Integration |
| **Phase 6** | Datenmigration | `/scripts` | Export & Transformation aus WordPress & Hausbibliothek DB |
| **Phase 7** | CI/CD Pipeline | `/.github/workflows` | Automation, Build-Checks & AWS Deployment Pipeline |
