# ADR 0003: Eignung von Git/GitHub für redaktionelle Workflows

- **Status**: Akzeptiert
- **Datum**: 2026-08-11
- **Entscheidungsträger**: Team Lead, Redaktionsteam, Vereinsvorstand

## Kontext

Nach dem Verwerfen des Headless-CMS wurde geprüft, ob die ehrenamtlichen Mitarbeiterinnen des SprachCafé Polnisch e.V. redaktionelle Inhalte (z. B. News, Veranstaltungshinweise, Ankündigungen) direkt im GitHub-Repository über Markdown-Dateien und den GitHub Web-Editor pflegen können.

Das SprachCafé arbeitet mit ehrenamtlichen Helferinnen und Helfern mit unterschiedlichsten technischen Vorkenntnissen. Bei der Evaluierung zeigten sich deutliche Hürden:
- **Komplexität von Git/GitHub**: Konzepte wie Branches, Commits, Pull Requests, Merge-Konflikte und Markdown-Formatierung sind für Nicht-Entwicklerinnen schwer vermittelbar.
- **Fehleranfälligkeit**: Unbeabsichtigte Syntaxfehler in Markdown-Dateien oder Frontmatter-Headers können den automatisierten Site-Build blockieren.
- **Hohe Hürde für die Veröffentlichung**: Die Angst vor Fehlern im Git-Repository hemmt die zügige Veröffentlichung von Vereinsnachrichten.

## Entscheidung

Wir entscheiden uns, dass **Git/GitHub als direktes Redaktionswerkzeug für ehrenamtliche Mitarbeiterinnen ausscheidet**.

Stattdessen verfolgen wir folgenden praxisnahen Ansatz:
1. **Nutzung gewohnter Vereins-Tools**: Inhalte und Eingaben werden über die bereits etablierten Oberflächen erfasst (Microsoft 365, Power Automate Forms sowie die Benutzeroberfläche der Hausbibliothek).
2. **Automatisierte Build-Integration**: Änderungen in den Quellsystemen lösen bei Bedarf einen Webhook (`repository_dispatch`) aus, der den Astro-Static-Site-Build in GitHub Actions automatisch neu startet.
3. **Klare Aufgabentrennung**:
   - **Ehrenamtliche Redaktion**: Pflegt Fachdaten in vertrauten Formularen und Systemen.
   - **Web-Team**: Betreut Repository, Templates und technische Strukturen im Monorepo.

## Konsequenzen

### Positiv
- **Keine Schulungshürden**: Ehrenamtliche arbeiten in gewohnten Oberflächen ohne Git-Kenntnisse.
- **Robustheit**: Quellcode und Site-Builds sind vor Formatierungsfehlern geschützt.
- **Effizienz**: Schnelle Erfassung von Anträgen, Kontaktanfragen und Event-Daten über Formulare.

### Negativ
- Aktualisierungen aus externen Quellen werden erst nach Ablauf des automatischen Static-Site-Builds (ca. 1–2 Minuten) auf der Website sichtbar.

---

## Ergänzung (2026-08-19): Einstellung der WordPress-Blog-Aggregation

Im Nachgang zur Einführung der automatisierten Workflows für Google Calendar und Mailchimp wurde auch die bisher pausierte **WordPress-Blog-Aggregation (`/posts/`) endgültig ad acta gelegt** (siehe [ADR 0004: Endgültige Einstellung der WordPress-Blog-Aggregation](./0004-einstellung-wordpress-blog-aggregation.md)):
- **Veranstaltungen**: Werden vollständig über den Google Calendar Sync (`events`) abgedeckt.
- **Vereinsnachrichten & Berichte**: Werden direkt aus dem Mailchimp-Newsletter-Workflow (`news`) zweisprachig per Webhook in Astro Markdown committet.
- Die bisherige Navigation `📰 Blog & Aktuelles` (`/posts/`) wurde durch die zentrale News-Sammlung `/news/` abgelöst. Ein Betrieb oder Polling von WordPress entfällt vollständig.
