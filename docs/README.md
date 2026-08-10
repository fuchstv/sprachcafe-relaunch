# Projekt-Dokumentation (`/docs`)

Willkommen in der zentralen Dokumentation des SprachCafé Relaunch Projekts.

## Übersicht der Dokumente

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
