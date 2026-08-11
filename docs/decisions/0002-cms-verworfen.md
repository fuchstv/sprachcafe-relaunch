# ADR 0002: Verwerfen des Headless-CMS-Ansatzes zugunsten entkoppelter Workflows

- **Status**: Akzeptiert
- **Datum**: 2026-08-11
- **Entscheidungsträger**: Team Lead, Redaktionsteam, Lead Architect

## Kontext

Im ursprünglichen Entwurf des Relaunchs war der Betrieb eines eigenen Headless-CMS (Node.js/SQLite bzw. Directus) vorgesehen. Dieses sollte dynamische Seiten (z. B. Impressum, Ausleihregeln, Events) und Blogposts verwalten.

Bei der Evaluierung zeigten sich jedoch gravierende Nachteile für den Vereinsalltag:
- **Doppelpflege & Inkonsistenz**: Die Bibliotheks-App (`hausbibliothek.org`) besitzt bereits ein eigenes System für Ausleihregeln und Bibliotheksinhalte. Ein zweiter Editor im CMS führte zu unklarer Datenhoheit und drohender Doppelpflege.
- **Ressourcenverbrauch**: Der Betrieb eines CMS-Service samt Datenbank bindet auf dem 2 GB RAM Lightsail-Host wertvollen Arbeitsspeicher.
- **Wartungsaufwand**: Sicherheitsupdates, Datenbank-Backups und Benutzerverwaltung für ein weiteres CMS-Backend belasten das ehrenamtliche IT-Team.

## Entscheidung

Wir entscheiden uns, den **Headless-CMS-Ansatz vollständig zu verwerfen** und die CMS-Komponente ersatzlos aus dem Monorepo und der Docker-Infrastruktur zu entfernen.

Stattdessen gilt folgende Architektur (Phase R1/R2 des Relaunch-Plans):
1. **Single Source of Truth**: Die Bibliotheks-App (`hausbibliothek.org`) bleibt der alleinige Ort für Bibliotheksinhalte, Regeln und Buchbestände. Das Frontend zieht diese Daten beim Build per API (`scripts/sync_hausbibliothek_catalog.ts`).
2. **Microsoft 365 & Power Automate**: Formular-Eingaben (Kontakt, Mitgliedsanträge, Event-Anmeldungen) werden direkt an die beim Verein bereits etablierten Power Automate Webhooks übermittelt.
3. **Statische Generierung (Astro SSG)**: Redaktionelle Artikel und Seiten werden als strukturierte Content Collections direkt im Frontend gepflegt.

## Konsequenzen

### Positiv
- **Keine Doppelpflege**: Klare Abgrenzung der Systeme und Datenhoheiten.
- **Maximale Performance & RAM-Einsparung**: Entlastung des 2 GB RAM Servers um einen kompletten Service-Stack.
- **Höhere Sicherheit**: Keine Angriffsfläche durch CMS-Admin-Panels (`/admin`), JWT-Tokens oder Datenbank-Sicherheitslücken.

### Negativ
- Redaktionelle Anpassungen von Kernseiten müssen über strukturierte Dateien oder die angebundenen Fachsysteme (Hausbibliothek/M365) erfolgen.
