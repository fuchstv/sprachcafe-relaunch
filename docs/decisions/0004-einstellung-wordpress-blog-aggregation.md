# ADR 0004: Endgültige Einstellung der WordPress-Blog-Aggregation

- **Status**: Akzeptiert (Ad acta gelegt)
- **Datum**: 2026-08-19
- **Entscheidungsträger**: Team Lead, Vereinsvorstand, Redaktionsteam

---

## 1. Kontext & Ausgangslage

Im ursprünglichen Konzept des Relaunchs (Phase E) wurde erwogen, Beiträge aus der bestehenden WordPress-Installation (`sprachcafe-polnisch.org/wp-json/wp/v2/posts`) über eine automatisierte Aggregations-Pipeline fortlaufend in eine lokale `posts`-Collection zu überführen und unter `/posts/` darzustellen.

Diese Aggregation wurde zunächst pausiert, um den tatsächlichen redaktionellen Nutzen und die Datenqualität im Detail zu analysieren.

### Ergebnisse der Bestandsanalyse:
1. **Hoher Anteil an rein temporären Event-Hinweisen**:
   Über 90 % der historischen WordPress-Beiträge waren reine Ankündigungen für konkrete Veranstaltungstermine (z. B. wöchentliche Sprachcafés, Speak-Dating, Lesungen, Theaterworkshops), die nach Ablauf des Termins ihren Informationswert verloren haben.
2. **Redundanz zu Mailchimp-Newslettern**:
   Die verbleibenden allgemeinen Vereinsberichte und redaktionellen Zusammenfassungen wurden im Verein stets parallel über den Mailchimp-Newsletter an Mitglieder und Interessierte verschickt.
3. **Wartungsaufwand & technische Schulden**:
   Eine fortlaufende WordPress-REST-API-Synchronisation würde voraussetzen, dass die WordPress-Instanz bei Strato dauerhaft gepflegt, mit Sicherheitsupdates versorgt und gegen Angriffe abgesichert werden müsste, obwohl kein aktives Blogging mehr in WordPress stattfindet.

---

## 2. Entscheidung

Wir entscheiden uns, die **fortlaufende WordPress-Blog-Aggregation endgültig ad acta zu legen** und den Kanal `/posts/` vollständig durch die neuen, spezialisierten Zielsysteme zu ersetzen:

1. **Veranstaltungen & Termine $\rightarrow$ Google Calendar Sync (`events`)**:
   - Alle aktuellen und zukünftigen Vereinstermine werden von den Verantwortlichen wie gewohnt im Vereins-Google-Kalender gepflegt.
   - Der automatisierte Calendar-Sync (`gcal-sync`) überführt Termine direkt in die Astro-Collection `events` (`/veranstaltungen/`) inklusive Filter, Kategorien, ICS-Kalender-Export und Schema.org `Event`-Markup.
2. **Aktuelles & Redaktionelle Berichte $\rightarrow$ Mailchimp Newsletter Sync (`news`)**:
   - Neuigkeiten, Monatsrückblicke und Berichte werden direkt aus dem bestehenden Mailchimp-Workflow via Cloudflare Pages Webhook (`api/webhooks/mailchimp`) zweisprachig (Polnisch/Deutsch) aufbereitet.
   - Die bereinigten Artikel werden automatisch per GitHub REST API als Markdown-Dateien in die neue Astro-Collection `news` (`/news/`) committet und mit Sprach-Badges (🇵🇱/🇩🇪) dargestellt.
3. **Navigation & Frontend-Routen**:
   - Der bisherige Navigationspunkt `📰 Blog & Aktuelles` (`/posts/`) wurde in der Hauptnavigation, im Mega-Menu und in der mobilen Navigation durch die neue, zentrale News-Seite `/news/` ersetzt.
   - Für die WordPress-REST-API wird kein Produktions-Sync, Polling oder Cronjob mehr betrieben.

---

## 3. Konsequenzen

### Positiv
- **Zero Maintenance & maximale Sicherheit**: Keine Notwendigkeit für laufende WordPress-Wartung, Plugin-Updates oder Shared-Hosting-Kosten bei Strato für das Bloggen.
- **Nahtloser Redaktions-Workflow**: Ehrenamtliche müssen keine neuen CMS-Oberflächen lernen. Sie nutzen weiterhin ausschließlich Google Calendar (für Termine) und Mailchimp (für Newsletter).
- **Keine Inhaltsüberlappung**: Saubere funktionale Trennung zwischen zeitgebundenen Terminen (`/veranstaltungen/`) und lesbaren Vereinsnachrichten (`/news/`).
- **Höhere Code- & Layoutqualität**: Befreit von WordPress-/Elementor-HTML-Resten; alle News-Artikel werden über die semantische Mailchimp-Sanitizer-Pipeline in modernes, barrierefreies (WCAG 2.1 AA) und DSGVO-konformes Astro-Markup überführt.

### Negativ
- Historische WordPress-Kurzhinweise aus den Jahren vor 2024 werden nicht als eigenständige Blogposts migriert (relevante statische Inhaltsseiten wurden bereits direkt in Astro-Pages überführt; ältere Newsletter-Highlights sind im News-Archiv abrufbar).

---

## 4. Referenzen
- [ADR 0003: Eignung von Git/GitHub für redaktionelle Workflows](./0003-github-ungeeignet-fuer-redaktion.md)
- [ADR 0002: Verwerfen eines separaten Headless-CMS](./0002-cms-verworfen.md)
- [Dokumentation: Mailchimp Webhook Setup](../MAILCHIMP_WEBHOOK_SETUP.md)
