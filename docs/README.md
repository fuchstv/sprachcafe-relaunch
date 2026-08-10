# Projekt-Dokumentation (`/docs`)

Willkommen in der zentralen Dokumentation des SprachCafé Relaunch Projekts.

## Übersicht der Dokumente

- [Pagefind Statische Volltextsuche](./PAGEFIND_SEARCH.md): Integration in Astro-Build (`pagefind --site dist`), `data-pagefind-filter` Attribute.
- [Design-Entscheidungsprotokoll](./design-decisions.md): Bewertung bestehender UI-Muster (Cookie-Banner Entfall, CSS-Scroll-Snap vs. Slider-Plugins).
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
