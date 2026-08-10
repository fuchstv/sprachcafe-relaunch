# Headless CMS Collections & i18n Konfiguration

Dieses Dokument dokumentiert die 5 im Headless CMS definierten Collections ([`cms/collections/`](../cms/collections/)) und deren mehrsprachige i18n-Felder (Deutsch `de`, Polnisch `pl`, Englisch `en`).

---

## 📂 1. Ubersicht der Collections

### 1. `events` (Veranstaltungen & SprachCafés)
- **JSON Schema**: [`cms/collections/events.json`](../cms/collections/events.json)
- **Felder**:
  - `id`: UUID (Primary Key)
  - `title`: String (i18n: DE/PL/EN)
  - `slug`: Unique String
  - `date_start`: Datetime (ISO 8601)
  - `date_end`: Datetime
  - `location`: Select (`Pankow`, `Schöneberg`, `Köpenick`)
  - `target_group`: Select (`Kinder`, `Erwachsene`, `Familien`, `Jugendliche`, `Alle`)
  - `language`: Select (`DE`, `PL`, `EN`, `Bilingual`)
  - `description`: RichText (i18n: DE/PL/EN)
  - `image`: Media (Path / S3 URL)
  - `max_participants`: Integer
  - `power_automate_trigger`: Boolean

---

### 2. `posts` (Magazin & News)
- **JSON Schema**: [`cms/collections/posts.json`](../cms/collections/posts.json)
- **Felder**:
  - `id`: UUID (Primary Key)
  - `title`: String (i18n: DE/PL/EN)
  - `slug`: Unique String
  - `date`: Date
  - `category`: Select (`Neuigkeiten`, `Kultur`, `SprachCafé`, `Verein`)
  - `location_tag`: Select (`Pankow`, `Schöneberg`, `Köpenick`, `Global`)
  - `content`: RichText (i18n: DE/PL/EN)
  - `featured_image`: Media
  - `author`: String

---

### 3. `books` (Hausbibliothek Katalog)
- **JSON Schema**: [`cms/collections/books.json`](../cms/collections/books.json)
- **Felder**:
  - `id`: UUID (Primary Key)
  - `title`: String
  - `author`: String
  - `isbn`: Unique String
  - `language`: Select (`DE`, `PL`, `EN`, `UKR`)
  - `category`: String
  - `location`: Select (`Pankow`, `Schöneberg`, `Köpenick`)
  - `status`: Select (`verfuegbar`, `ausgeliehen`, `reserviert`)
  - `cover`: Media
  - `description`: Text (i18n: DE/PL/EN)

---

### 4. `team` (Team & Partner)
- **JSON Schema**: [`cms/collections/team.json`](../cms/collections/team.json)
- **Felder**:
  - `id`: UUID (Primary Key)
  - `name`: String
  - `role`: String (i18n: DE/PL/EN)
  - `type`: Select (`team`, `partner`)
  - `email`: String
  - `website`: String
  - `bio`: Text (i18n: DE/PL/EN)
  - `photo`: Media

---

### 5. `pages` (Seiten & Flexible Layouts)
- **JSON Schema**: [`cms/collections/pages.json`](../cms/collections/pages.json)
- **Felder**:
  - `id`: UUID (Primary Key)
  - `title`: String (i18n: DE/PL/EN)
  - `slug`: Unique String
  - `seo_title`: String (i18n: DE/PL/EN)
  - `seo_description`: Text (i18n: DE/PL/EN)
  - `blocks`: Array von flexiblen Layout-Blöcken:
    - **Hero Banner**: `title` (i18n), `subtitle` (i18n), `cta_text` (i18n), `cta_link`, `background_image`
    - **Rich-Text Block**: `heading` (i18n), `body` (i18n RichText)
    - **Karten-Grid**: `heading` (i18n), `items` (Array von `title`, `description`, `icon`, `link`)
    - **Call to Action Banner**: `title` (i18n), `description` (i18n), `button_label` (i18n), `button_url`

---

## 🌐 2. i18n Lokalisierungs-Konfiguration

Für alle Collections ist `i18n: true` mit den Sprachcodes `["de", "pl", "en"]` aktiviert.
- Die Schema-Spezifikationen werden über den API-Endpunkt `GET /api/schema` bereitgestellt.
