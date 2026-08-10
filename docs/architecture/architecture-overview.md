# Architektur-Übersicht - SprachCafé Relaunch

Dieses Dokument beschreibt die Gesamtarchitektur, Datenflüsse und Systemkomponenten des SprachCafé Monorepos.

## Systemarchitektur (Mermaid Diagramm)

```mermaid
graph TD
    User["Endnutzer / Besucher"] -->|HTTP/HTTPS| Caddy["Caddy Reverse Proxy (/infra)"]
    
    subgraph Container Setup
        Caddy -->|"/ (Statisch/SSR)"| Astro["Astro Frontend (/frontend)"]
        Caddy -->|"/admin, /items"| CMS["Headless CMS (/cms)"]
        CMS -->|SQL Queries| Postgres[("PostgreSQL DB")]
    end
    
    subgraph Externe Integrationen
        Astro -->|POST Formulare| Webhooks["Power Automate Webhooks"]
        CMS -->|Event Triggers| Webhooks
        CMS -->|Medien-Uploads| S3["AWS S3 Storage"]
    end
    
    subgraph DevOps & Migration
        GitHub["GitHub Repository"] -->|Push / PR| Pipeline["GitHub Actions CI/CD (/.github/workflows)"]
        Pipeline -->|Deploy| Caddy
        WP["Alt-WordPress"] -->|REST API| Migration["Migrationsskripte (/scripts)"]
        Migration -->|Data Import| CMS
    end
```

## Schnittstellen & Datenflüsse

1. **Endnutzer -> Frontend**: Der Caddy Reverse Proxy leitet Anfragen an das Astro Frontend weiter.
2. **CMS -> AWS S3**: Hochgeladene Bilder und Medien der News/Veranstaltungen werden auf S3 gehostet.
3. **Frontend/CMS -> Power Automate**: Formular-Submissions (z.B. Mitgliedsanträge, Hausbibliothek-Ausleihe) werden direkt per Webhook an Power Automate übermittelt.
4. **Migration -> CMS**: Das `/scripts` Paket liest historische WordPress-Daten aus und transformiert sie in die PostgreSQL-Datenbank des CMS.
