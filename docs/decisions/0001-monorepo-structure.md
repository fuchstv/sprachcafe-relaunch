# ADR 0001: Wahl einer Monorepo-Struktur für den SprachCafé Relaunch

- **Status**: Akzeptiert
- **Datum**: 2026-08-10
- **Entscheidungsträger**: Team Lead, Lead Architect, DevOps Team

## Kontext

Der Relaunch des SprachCafés erfordert mehrere zusammenspielende Komponenten:
- Ein schnelles, barrierefreies Frontend (Astro)
- Ein flexible Headless CMS inklusive Datenbank
- Infrastruktur-Code (Caddy, Docker Compose, Terraform)
- Migrationsskripte für Alt-Daten (WordPress & Hausbibliothek)
- Automatisierte CI/CD-Pipelines

Ein verteiltes Multi-Repository-Setup würde den Pflegeaufwand und die Synchronisation von Änderungen erheblich erschweren.

## Entscheidung

Wir entscheiden uns für ein **Monorepo** mit folgender Ordnerstruktur:
- `/frontend`: Astro-Projekt
- `/cms`: Headless CMS Configuration & Schemata
- `/infra`: Reverse Proxy, Docker Compose & Infrastructure-as-Code
- `/scripts`: Python-Migrationsskripte
- `/.github/workflows`: Zentrale CI/CD Automation
- `/docs`: Zentrale Architektur- und Betriebsdokumentation

## Konsequenzen

### Positiv
- **Zentrale Versionierung**: Alle Komponenten und deren Konfigurationen bleiben synchron.
- **Einfachere CI/CD**: Eine gemeinsame Pipeline prüft Builds und Infrastruktur-Konsistenz.
- **Gemeinsame Entwicklererfahrung**: Klare Struktur für alle Teammitglieder.

### Negativ
- `.gitignore` und `.env.example` müssen sauber strukturiert sein, um versehentliches Einchecken von Geheimnissen zu verhindern.
