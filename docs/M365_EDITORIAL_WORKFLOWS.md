# M365 Redaktions-Workflows (MS Forms ➔ Power Automate ➔ GitHub Pull Request)

> **Architektur-Ziel**: Ehrenamtliche Redakteur:innen pflegen neue Inhalte (Team-Mitglieder, Ausstellungen, Laden-Artikel) **ausschließlich über vertraute Microsoft Forms Formulare**. 
> Es sind **keinerlei Git-Kenntnisse, GitHub-Logins oder Terminal-Zugriffe erforderlich**. Power Automate verarbeitet die Formulareingaben automatisch, erstellt einen eigenen Feature-Branch und öffnet einen Pull Request gegen die Staging-Umgebung (`beta`).

---

## 📌 Workflow-Übersicht

```mermaid
sequenceDiagram
    autonumber
    actor Redakteurin as Redakteurin (Verein)
    participant MSForms as Microsoft Forms
    participant PA as Power Automate
    participant GitHubAPI as GitHub REST API / Connector
    participant BetaRepo as GitHub Branch (beta)

    Redakteurin->>MSForms: Füllt Formular aus (z. B. Neues Team-Mitglied)
    MSForms-->>PA: Trigger: Neue Formular-Antwort eingetroffen
    PA->>PA: Generiert YAML-Frontmatter & Dateiname
    PA->>GitHubAPI: 1. Erstellt Branch (content/team-20260811-1930) aus beta
    PA->>GitHubAPI: 2. Erstellt Markdown-Datei in frontend/src/content/team/
    PA->>GitHubAPI: 3. Öffnet Pull Request gegen branch 'beta'
    GitHubAPI-->>BetaRepo: PR bereit für Vorschau auf beta.sprachcafe-polnisch.org
```

---

## 📋 1. Microsoft Forms Setup (3 Formulare)

Erstellen Sie in Ihrem Microsoft 365 Vereins-Account drei Formulare mit folgenden Feldern:

### Formular 1: `Neues Team-Mitglied anlegen`
1. **Vollständiger Name** (Text, Pflicht)
2. **Rolle / Funktion (DE)** (Text, Pflicht)
3. **Rolle / Funktion (PL)** (Text, Optional)
4. **Rolle / Funktion (EN)** (Text, Optional)
5. **E-Mail-Adresse** (Text/E-Mail, Optional)
6. **Telefonnummer** (Text, Optional)
7. **Profilfoto-URL** (Text/URL, Pflicht - z. B. S3-Link)
8. **Biografie (DE)** (Mehrzeiliger Text, Optional)
9. **Sortier-Reihenfolge** (Zahl, Standard: 10)

### Formular 2: `Neue Ausstellung / Galerie eintragen`
1. **Titel der Ausstellung (DE)** (Text, Pflicht)
2. **Künstler:in / Urheber:in** (Text, Pflicht)
3. **Startdatum** (Datum, Pflicht)
4. **Enddatum** (Datum, Pflicht)
5. **Beschreibung (DE)** (Mehrzeiliger Text, Pflicht)
6. **Hauptbild-URL** (Text/URL, Pflicht)

### Formular 3: `Neuer Laden-Artikel eintragen`
1. **Artikelname (DE)** (Text, Pflicht)
2. **Beschreibung (DE)** (Mehrzeiliger Text, Pflicht)
3. **Preis / Spendenbeitrag** (Text, Pflicht - z. B. `15,00 € Spendenbeitrag`)
4. **Verfügbarkeit** (Auswahl: `in_stock`, `out_of_stock`, `on_request`)
5. **Produktbild-URL** (Text/URL, Pflicht)

---

## ⚙️ 2. Power Automate Flow-Konfiguration

Erstellen Sie für jedes Formular einen **Automatisierter Flow** in Power Automate.

### Schritt 1: Trigger & Formular-Details abrufen
- **Trigger**: `Beim Übermitteln einer neuen Antwort` (Microsoft Forms) ➔ Formular auswählen.
- **Aktion**: `Antwortdetails abrufen` (Microsoft Forms) ➔ `Antwort-ID` aus Trigger zuweisen.

### Schritt 2: Branch-Namen & Zeitstempel initialisieren
- **Aktion**: `Variable initialisieren`
  - Name: `BranchName`
  - Typ: `Zeichenfolge`
  - Wert: `content/team-@{formatDateTime(utcNow(), 'yyyyMMdd-HHmmss')}`

### Schritt 3: GitHub-Connector Aktionen

#### A) Neuer Branch aus `beta` erstellen (`Create a reference`)
- **Connector**: `GitHub`
- **Aktion**: `Create a reference` / `HTTP-Anforderung an GitHub API`
- **Methode**: `POST`
- **URI**: `https://api.github.com/repos/fuchstv/sprachcafe-relaunch/git/refs`
- **Body**:
  ```json
  {
    "ref": "refs/heads/@{variables('BranchName')}",
    "sha": "@{outputs('Get_beta_branch_SHA')}"
  }
  ```

#### B) Content-Collection Datei erstellen (`Create or update file contents`)
- **Connector**: `GitHub` ➔ `Create or update file contents`
- **Repository**: `fuchstv/sprachcafe-relaunch`
- **Path**: `frontend/src/content/team/@{outputs('Slug')}.md`
- **Branch**: `@{variables('BranchName')}`
- **Message**: `feat(content): add team member @{body('Get_response_details')?['r123']}`
- **Content** (Base64-kodiertes YAML-Frontmatter):
  ```yaml
  ---
  name: "@{body('Get_response_details')?['r123_name']}"
  role:
    de: "@{body('Get_response_details')?['r123_role_de']}"
    pl: "@{body('Get_response_details')?['r123_role_pl']}"
    en: "@{body('Get_response_details')?['r123_role_en']}"
  contact:
    email: "@{body('Get_response_details')?['r123_email']}"
    phone: "@{body('Get_response_details')?['r123_phone']}"
  photo: "@{body('Get_response_details')?['r123_photo']}"
  bio:
    de: "@{body('Get_response_details')?['r123_bio_de']}"
    pl: "@{body('Get_response_details')?['r123_bio_de']}"
    en: "@{body('Get_response_details')?['r123_bio_de']}"
  order: @{body('Get_response_details')?['r123_order']}
  ---
  ```

#### C) Pull Request gegen `beta` erstellen (`Create a pull request`)
- **Connector**: `GitHub` ➔ `Create a pull request`
- **Repository**: `fuchstv/sprachcafe-relaunch`
- **Title**: `[Redaktion] Neues Team-Mitglied: @{body('Get_response_details')?['r123_name']}`
- **Head Branch**: `@{variables('BranchName')}`
- **Base Branch**: `beta`
- **Body**: `Automatisch erstellter PR aus Microsoft Forms. Nach dem Mergen in 'beta' ist der Eintrag auf beta.sprachcafe-polnisch.org sichtbar.`

---

## 🛡️ Sicherheits- & Freigabekonzept

1. **Kein direkter Push auf `main`**: Sämtliche Eingaben fließen zwingend über einen Pull Request gegen den **`beta`** Branch.
2. **Vorschau & Qualitätskontrolle**: Das Team kann den Eintrag auf `beta.sprachcafe-polnisch.org` vor der Freigabe prüfen.
3. **Rechte-Isolierung**: Die Redakteurin füllt lediglich das gewohnte MS-Forms-Formular aus und benötigt kein GitHub-Konto.
