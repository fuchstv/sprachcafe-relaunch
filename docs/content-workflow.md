# Redaktions-Workflow & Content-Pflege (`content-workflow.md`)

Inhalte der SprachCafé Polnisch Website werden als typsichere Astro Content Collections im Format **Markdown/YAML** direkt im Git-Repository geführt (`frontend/src/content/`).

Dieses Dokument beschreibt die Evaluierung der Bearbeitungswege für Redakteur:innen ohne Git-Kenntnisse sowie den gewählten Standard-Workflow.

---

## ⚖️ 1. Vergleich der Bearbeitungs-Optionen

| Kriterium | Option (a): GitHub Web-Interface (Standard) | Option (b): Decap CMS / Tina CMS (Komfortschicht) |
|---|---|---|
| **Architektur** | Direkte Web-Oberfläche auf github.com | Client-Side SPA (HTML/JS) via GitHub REST API |
| **Server-Overhead** | **0 MB RAM** (kein eigener Serverprozess) | **0 MB RAM** (statische HTML-Datei im Build) |
| **Setup-Aufwand** | **Sofort einsatzbereit** (0 Konfiguration) | Mittel (OAuth-Gateway & `admin/config.yml`) |
| **Benutzererfahrung** | Bearbeitung von YAML/Markdown im Browser | Formular-Oberfläche mit WYSIWYG-Editor |
| **Freigabe & PRs** | Automatischer Pull-Request ("Propose changes") | Automatisches Erstellen von Commits/PRs |
| **Sicherheit & Audit** | Volle Transparenz, Audit-Log & Rollback | Volle Transparenz über Git-Commits |

---

## 🎯 2. Begründete Entscheidung

### ✅ Hauptentscheidung: **Option (a) GitHub Web-Interface** als primärer Standard-Workflow

**Begründung**:
1. **Vollständige Wartungsfreiheit**: Es wird keine externe Abhängigkeit (z. B. OAuth-Token-Broker oder Drittanbieter-Services) benötigt.
2. **Qualitätssicherung & Review**: Der GitHub "Propose changes"-Mechanismus erzeugt automatisch einen Pull Request (PR). Änderungen können vor dem Veröffentlichen geprüft werden, woraufhin GitHub Actions das automatische Deployment auslöst.
3. **Einfachheit der YAML-Dateien**: Dank der in `src/content/config.ts` definierten Zod-Schemas sind die Content-Dateien sehr übersichtlich strukturiert (z. B. `de:`, `pl:`, `en:` Blöcke).

### 💡 Optionale Komfortschicht: **Option (b) Decap CMS (Netlify CMS)**

Falls Redakteur:innen in Zukunft eine grafische Formular-Oberfläche bevorzugen, kann **Decap CMS** als rein statische HTML/JS-Komfortschicht (`frontend/public/admin/index.html`) ergänzt werden. Decap CMS nutzt die GitHub API direkt und schreibt Commits/PRs, ohne dass ein eigener Serverprozess erforderlich ist.

---

## 📖 3. Schritt-für-Schritt Anleitung für Redakteur:innen (GitHub Web-Interface)

Diese Anleitung richtet sich an Redakteur:innen **ohne Git- oder Programmierkenntnisse**.

### Schritt 1: Inhalt auswählen
1. Melde dich bei [GitHub.com](https://github.com) an.
2. Navigiere im Repository zum Ordner des gewünschten Inhalts:
   - 📅 **Veranstaltungen**: `frontend/src/content/events/`
   - 📍 **Standorte**: `frontend/src/content/locations/`
   - 👥 **Team**: `frontend/src/content/team/`
   - 💬 **Erfahrungsberichte**: `frontend/src/content/testimonials/`
   - 🖼️ **Ausstellungen**: `frontend/src/content/exhibitions/`
   - 🛒 **Shop-Artikel**: `frontend/src/content/shopItems/`
   - 📄 **Seiten & Rechtliches**: `frontend/src/content/pages/`
3. Klicke auf die Datei, die du bearbeiten möchtest (z. B. `sommerfest-2026.md`).

### Schritt 2: Bearbeitung starten
1. Klicke oben rechts über der Dateiansicht auf das **Stiftsymbol 📝 ("Edit this file")**.
2. Du siehst nun den Text der Datei.

### Schritt 3: Text anpassen (Mehrsprachigkeit beachten)
Ppasse die entsprechenden Sprachblöcke an. Beispiel:

```yaml
title:
  de: "Polnisch-Deutsches SprachCafé Sommerfest"
  pl: "Letni Piknik Językowy Polsko-Niemiecki"
  en: "Polish-German LanguageCafé Summer Festival"
```

### Schritt 4: Änderungen vorschlagen ("Propose changes")
1. Scrolle nach unten zum Bereich **"Commit changes"**.
2. Gib eine kurze Zusammenfassung ein (z. B. *„Uhrzeit für Sommerfest aktualisiert“*).
3. Stelle sicher, dass **"Create a new branch for this commit and start a pull request"** ausgewählt ist.
4. Klicke auf den grünen Button **"Propose changes"**.

### Schritt 5: Pull Request erstellen & Veröffentlichen
1. Klicke auf **"Create pull request"**.
2. Das Entwicklungs-Team/Management prüft die Änderung kurz.
3. Sobald der PR auf **"Merge"** geklickt wird, baut GitHub Actions die Website automatisch neu und veröffentlicht die Änderung innerhalb von 1–2 Minuten.

---

## 🛠️ 4. Technische Dokumentation für Entwickler

### Content-Schema Struktur (`src/content/config.ts`)

Alle Collections nutzen parallele i18n-Felder:

```typescript
import { defineCollection, z } from 'astro:content';

export const i18nString = z.object({
  de: z.string(),
  pl: z.string(),
  en: z.string(),
});
```

### Rollback-Prozedur bei Fehlern
Sollte eine Textänderung versehentlich falsche Informationen enthalten, kann in GitHub unter **Pull Requests ➔ Closed** der jeweilige PR geöffnet und mit einem Klick auf **"Revert"** sofort rückgängig gemacht werden.
