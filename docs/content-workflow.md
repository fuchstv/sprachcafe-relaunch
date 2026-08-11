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

---

## 🖼️ 5. Umgang mit Medien & Dateien (Bilder, PDFs & S3 Storage)

### Grundsatz: Keine Binärdateien im Git-Repository
Um das Git-Repository leichtgewichtig, schnell und wartbar zu halten, werden **keine Bilder, PDFs oder sonstige Binärdateien im Git-Repository eingecheckt**.

Alle Medien werden zentral im AWS S3-Bucket **`sprachcafe-media-storage`** gespeichert. In den Content-Collection-Dateien (`.md` / `.yaml`) wird ausschließlich die resultierende HTTPS-S3-URL hinterlegt.

---

### 📤 3 Wege zum Hochladen von Medien in S3

#### Weg 1: Upload-Skript (Empfohlen für lokale Bearbeitung)
Im Ordner `scripts/` steht ein einfaches CLI-Tool zur Verfügung:

```bash
# Bild für ein Event hochladen:
python3 scripts/upload_media_to_s3.py ./sommerfest.jpg --folder events

# PDF für Downloads hochladen:
python3 scripts/upload_media_to_s3.py ./satzung.pdf --folder downloads
```

**Ausgabe des Skripts**:
Das Skript gibt direkt die fertige S3-URL sowie den passenden YAML-Schnipsel zum Kopieren aus:
```
✅ Upload Complete! Resulting S3 URLs:

📄 File: sommerfest.jpg
🔗 S3 URL: https://sprachcafe-media-storage.s3.eu-central-1.amazonaws.com/events/sommerfest.jpg
📋 YAML Snippet:
  src: "https://sprachcafe-media-storage.s3.eu-central-1.amazonaws.com/events/sommerfest.jpg"
```

#### Weg 2: AWS CLI
```bash
aws s3 cp ./satzung.pdf s3://sprachcafe-media-storage/downloads/satzung.pdf --content-type "application/pdf"
```

#### Weg 3: AWS Management Console (Browser)
1. Bei der **AWS Console** anmelden ➔ Dienst **S3** öffnen.
2. Bucket **`sprachcafe-media-storage`** auswählen.
3. In den Ziel-Ordner navigieren (z. B. `events/`, `team/`, `downloads/`).
4. Auf **"Upload"** klicken und Datei hineinziehen.
5. Nach dem Upload die **Object URL** kopieren (z. B. `https://sprachcafe-media-storage.s3.eu-central-1.amazonaws.com/...`).

---

### 📝 Referenzieren der S3-URL in Content Collections

In der Markdown-/YAML-Datei wird die kopierte S3-URL im entsprechenden Bild- oder Datei-Feld eingetragen:

```yaml
# Beispiel Event (frontend/src/content/events/sommerfest.md)
image:
  src: "https://sprachcafe-media-storage.s3.eu-central-1.amazonaws.com/events/sommerfest.jpg"
  alt:
    de: "Eingangsbereich beim Sommerfest"
    pl: "Wejście na festyn letni"
    en: "Entrance at the summer festival"

# Beispiel Download (frontend/src/content/downloads/satzung.md)
title:
  de: "Vereinssatzung (PDF)"
  pl: "Statut stowarzyszenia (PDF)"
  en: "Association Statutes (PDF)"
s3FileUrl: "https://sprachcafe-media-storage.s3.eu-central-1.amazonaws.com/downloads/satzung.pdf"
```

