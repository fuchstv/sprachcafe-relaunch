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
- [Design-Token Übertragung & Alignment (Hausbibliothek App)](./design-tokens-alignment.md): Übertragung von Farben, Typografie & Logoeinbindung auf das Konto-Portal.
- [Mehrsprachigkeit & Deep-Linking (Astro <-> Hausbibliothek App)](./i18n-library-deep-linking.md): Dokumentation der Sprach-Parameter (?lang=de/pl) & English UI Fallback.
- [WordPress Bestands-Audit & Strato-Analyse](./wordpress-audit.md): Analyse von WP-CLI Restriktionen, REST API Erreichbarkeit & Polylang Extraktion.
- [Entscheidungsprotokoll: Wahl einer Monorepo-Struktur (ADR 0001)](./decisions/0001-monorepo-structure.md)
- [Entscheidungsprotokoll: Verwerfen des Headless-CMS-Ansatzes (ADR 0002)](./decisions/0002-cms-verworfen.md)
- [Entscheidungsprotokoll: Eignung von Git/GitHub für redaktionelle Workflows (ADR 0003)](./decisions/0003-github-ungeeignet-fuer-redaktion.md)
- [Entscheidungsprotokoll: Endgültige Einstellung der WordPress-Blog-Aggregation (ADR 0004)](./decisions/0004-einstellung-wordpress-blog-aggregation.md)
- [KPI-Anforderungsanalyse & Projektabrechnungen](./kpi-anforderungen.md): Kennzahlen, Erfassungskonzepte für offene Events (Headcount), Projekt-Tagging & Reporting-Roadmap (S.1–S.4).
- [Automatisierter Kalender-KPI-Sync & Power BI Anbindung](./CALENDAR_KPI_POWERBI_SYNC.md): Aggregation nach Monat, Standort, Sprache & Zielgruppe via SharePoint-Connector für Power BI.
- [Power BI Reporting-Handbuch (2-Seiten-Konzept & PDF/PPT-Export)](./POWER_BI_REPORT_GUIDE.md): Internes Monitoring vs. Sponsoren-Wirkungsbericht, Web-Preview & SharePoint-Sync.
- [Zentrales Gesamtdashboard & M365 Adaptive Cards Flows](./UNIFIED_DASHBOARD_AND_FLOWS.md): All-in-One Cockpit (Events + Headcounts + Cloudflare + Finanzen), tägliche Outlook Cards (Dorota Stasińska), Kassennotizen (Peter Fuchs) & Buchhaltung (Agnieszka Kubalewska-Strohmeyer).
- [Mailchimp Webhook Setup & Automatisierte News-Veröffentlichung](./MAILCHIMP_WEBHOOK_SETUP.md): Cloudflare Pages Webhook, zweisprachiger Split (🇵🇱/🇩🇪) & direkter GitHub-Commit nach `beta`.
- [Offene Content- & Navigations-Gaps (TODO-Liste)](./content-gaps.md): Übersicht offener Platzhalter & Navigationspunkte für R2/R3/R4.
- [Vollständiges Content-Inventar (Phase R4 Migration)](./content-inventory.md): Erfassung aller Live-Unterseiten, Texte, Bilder, Übersetzungen & PDFs.
- [Google Kalender Audit & iCal-Integration](./calendar-audit.md): Dekodierung & Zuordnung aller 9 Google-Kalender für iCal-Abruf ohne API-Key.
- [Leitfaden für die Redaktion: Termine im Google Calendar pflegen](./kalender-pflege.md): Nicht-technische Anleitung für das Redaktionsteam.
- [M365 Redaktions-Workflows (MS Forms -> Power Automate -> GitHub PR)](./M365_EDITORIAL_WORKFLOWS.md): Vorlagen & Schritt-für-Schritt-Anleitung für Team, Ausstellungen & Laden-Artikel.
- [Redaktions-Anleitung: Neue Inhalte veröffentlichen](./redaktion-anleitung.md): Übersichtlicher Leitfaden mit Formular-Links & Ablaufdiagrammen.
- [Power Automate Redaktions-Workflow (Formulare -> Webhook -> GitHub PR)](./POWER_AUTOMATE_REDAKTION_FLOW.md): JSON-Schema & Flow-Architektur für Team, Ausstellung & Laden.
- [Cloudflare Pages Setup & Custom Domain Deployment Guide](./CLOUDFLARE_PAGES_SETUP.md): CLI vs. API Methoden, Subdomain-Anbindung (`redaktion.sprachcafé.org`) & Deployment.
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
