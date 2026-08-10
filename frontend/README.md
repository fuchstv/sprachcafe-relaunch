# Phase 2: Frontend (`/frontend`)

Astro 5-basiertes Frontend für die Website des SprachCafé Polnisch mit nativer i18n Static Site Generation (SSG).

## Technologie Stack & i18n

- **Framework**: Astro 5 (SSG, `output: 'static'`)
- **Sprachen**: Native i18n Routen:
  - Deutsch (`de`): Standard-Sprache (Root `/` ohne Präfix sowie `/de/`)
  - Polnisch (`pl`): `/pl/`
  - Englisch (`en`): `/en/`
- **SEO & Alternate Links**: Automatische Generierung von `<link rel="alternate" hreflang="...">` Tags für alle Sprachvarianten.
- **Komponenten**: Wiederverwendbare `LanguageSwitcher.astro` Komponente.

## Lokale Entwicklung

```bash
npm install
npm run dev
```

Die Anwendung startet standardmäßig auf `http://localhost:3000`.

## Production Build Test

```bash
npx astro build
```

Erzeugt statische HTML-Seiten für `/index.html`, `/de/index.html`, `/pl/index.html` und `/en/index.html` im Ordner `dist/`.
