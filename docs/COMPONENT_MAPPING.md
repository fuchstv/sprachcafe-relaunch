# WordPress Theme-Sektionen zu Astro Komponeten-Mapping

Dieses Dokument ordnet jede wiederkehrende WordPress-Theme-Sektion aus dem Design-Audit ([`docs/design-audit.md`](./design-audit.md)) einer neu gebauten, wiederverwendbaren Astro/Tailwind-Komponente zu.

---

## 🗺️ Mapping-Matrix

| WordPress Theme-Sektion | Astro Komponente | Pfad in Frontend | Props & Schnittstellen | Datenquelle / CMS Collection |
|-------------------------|------------------|------------------|------------------------|------------------------------|
| **Hero mit Bildcollage** | `HeroSection.astro` | `src/components/HeroSection.astro` | `title`, `subtitle`, `badge`, `primaryCtaText`, `primaryCtaLink`, `secondaryCtaText`, `secondaryCtaLink`, `images` | Pages / CMS Collection |
| **Öffnungszeiten-Karten pro Standort** | `LocationOpeningHoursCard.astro` | `src/components/LocationOpeningHoursCard.astro` | `location`, `address`, `hours`, `contactEmail`, `mapUrl` | Locations Collection / CMS |
| **Zitat-/Testimonial-Grid** | `TestimonialGrid.astro` | `src/components/TestimonialGrid.astro` | `title`, `subtitle`, `testimonials` | Testimonials / CMS Collection |
| **Mega-Menü Navigation** | `MegaMenuNav.astro` | `src/components/MegaMenuNav.astro` | `currentLang` | Site Navigation Config |
| **Sprach-Umschalter** | `LanguageSwitcher.astro` | `src/components/LanguageSwitcher.astro` | `currentLang` | i18n Dictionary (`src/i18n/ui.ts`) |
| **Globales Layout** | `Layout.astro` | `src/layouts/Layout.astro` | `title`, `description`, `lang` | Global Header, Footer, Marken-Assets |

---

## 🧩 Details der erstellten Komponenten

### 1. `HeroSection.astro`
- **Beschreibung**: Prominenter Startseiten-Banner mit Bildcollage, Haupt-Titel, Untertitel und primären/sekundären CTA-Buttons.
- **Props**:
  - `title`: `string`
  - `subtitle`: `string`
  - `badge`?: `string`
  - `primaryCtaText`?: `string`, `primaryCtaLink`?: `string`
  - `secondaryCtaText`?: `string`, `secondaryCtaLink`?: `string`
  - `images`?: `string[]`

### 2. `LocationOpeningHoursCard.astro`
- **Beschreibung**: Wiederverwendbare Standort-Karte mit Adresse, Öffnungszeiten je Wochentag, E-Mail-Kontakt und Routenplaner.
- **Props**:
  - `location`: `'Pankow' | 'Schöneberg' | 'Köpenick'`
  - `address`: `string`
  - `hours`: `Array<{ day: string, time: string }>`
  - `contactEmail`?: `string`, `mapUrl`?: `string`

### 3. `TestimonialGrid.astro`
- **Beschreibung**: 3-Spalten Testimonial-Grid mit Zitaten aus der Community (Sprachschüler, Künstler, Familien).
- **Props**:
  - `title`?: `string`, `subtitle`?: `string`
  - `testimonials`?: `Array<{ quote: string, name: string, role?: string, location?: string }>`

### 4. `MegaMenuNav.astro`
- **Beschreibung**: Barrierefreie Header-Navigation mit ausklappbarem Standorte-Mega-Dropdown (Pankow, Schöneberg, Köpenick).
- **Props**:
  - `currentLang`: `'de' | 'pl' | 'en'`
