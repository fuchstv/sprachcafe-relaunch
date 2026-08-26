# Frontend Architecture & Existing Components Technical Analysis

**Investigator**: Explorer 1 (Frontend Architecture & Existing Components Investigator)  
**Date**: 2026-08-26  
**Scope**: `/home/ubuntu/sprachcafe-relaunch/frontend` (Astro 5 + Tailwind CSS v3)  
**Reference Designs**: `/home/ubuntu/sprachcafe-relaunch/docs/stitch-designs/` (Screens 01–05)  
**Integrity Mode**: Read-only Investigation

---

## 1. Executive Summary & Core Architectural Findings

The frontend is an **Astro 5.0 SSG (Static Site Generation)** application integrated with **Tailwind CSS v3.4.17**, **Pagefind v1.5.2** (client-side static search indexer), and native Astro i18n routing (`de` as default without prefix, `pl` and `en` with prefix).

### Key Architectural Strengths:
1. **Zero External Dependency / 100% DSGVO-by-Design**: All fonts (*Literata*, *Montserrat*, *Open Sans*, *Plus Jakarta Sans*) are fully self-hosted in `public/fonts/` (woff2 format) with `@font-face` definitions in `src/styles/fonts.css`.
2. **Robust Build & SSG Scalability**: `npm run build` generates **1,766 static HTML pages** across German, Polish, and English routes, including dynamic routes for 400+ books (`/hausbibliothek/[id]`) and 140+ calendar events (`/events/[slug]`), and indexes 1,658 pages into Pagefind in ~41 seconds.
3. **Structured Content Collections**: 9 Zod-validated content collections in `src/content/config.ts` (`events`, `locations`, `team`, `pages`, `testimonials`, `downloads`, `exhibitions`, `shopItems`, `news`) support typed multilingual schemas (`de`, `pl`, `en`).
4. **Client-Side Live Availability Hydration**: Both the catalog and book detail pages implement client-side fetch hydration against `https://hausbibliothek.org/api/export/books` with graceful fallback to static build data.

### Critical Gaps & Inconsistencies Identified:
1. **Component / Route Parity Divergence (Events)**:
   - German `/events/` (`src/pages/events/index.astro`) imports and renders `VintageEventTicketCard.astro`.
   - Polish `/pl/events/` (`src/pages/pl/events/index.astro`) **does not use** `VintageEventTicketCard.astro` and instead renders standard generic `<article>` cards.
2. **Component / Route Parity Divergence (Hausbibliothek)**:
   - German `/hausbibliothek/` (`src/pages/hausbibliothek/index.astro`) includes the `<BookshelfWidget maxBooks={10} />` banner above the filter controls.
   - Polish `/pl/hausbibliothek/` (`src/pages/pl/hausbibliothek/index.astro`) **omits** `<BookshelfWidget />` entirely.
   - Card markup differs (`status-badge` vs `book-status-badge`, `data-pagefind-body` missing on Polish page).
3. **Hardcoded Strings & i18n Gaps in Core Components**:
   - `HeroSection.astro`: Trust badges ("Eintritt frei / Spendenbasis", "Bilingual Deutsch & Polnisch", "3 Standorte in Berlin") and image `alt` attributes are hardcoded in German regardless of the `lang` prop.
   - `VintageEventTicketCard.astro`: Date time label hardcodes `" Uhr"` suffix (German-only).
4. **Design Token Discrepancies**:
   - Primary wine-red token is `#8B1E2D` in `tailwind.config.mjs`, but several pages and subcomponents use `#8B263E` or `#8B263E/10`.
   - `PagefindSearch.astro` and `MegaMenuNav.astro` contain legacy dark theme classes (`bg-slate-900`, `text-slate-400`, `text-sky-400`) incompatible with the warm café palette (`#FAF6EE`, `#24201E`, `#8B1E2D`, `#D97706`).
5. **Stitch UI Visual Fidelity Gap**:
   - **Hero (`HeroSection.astro`)**: Lacks the torn paper cutout accent layer and Polish Poster School ("Polska Szkoła Plakatu") visual styling from Screen 02.
   - **Kiez Hubs (`KiezHubSelector.astro`)**: Uses CSS gradients instead of the 3 custom architectural illustrations (Pankow bridge, Schöneberg café, Köpenick castle & riverboat) specified in Screen 05.
   - **Bookshelf & Catalog (`BookshelfWidget.astro`, `/hausbibliothek/`)**: Catalog cards lack the vintage card index ("Karteikarten") texture and rubber stamp ("Verfügbar") visual cues shown in Screen 03.
   - **Event Tickets (`VintageEventTicketCard.astro`)**: Perforated ticket styling is basic CSS, lacking linocut category artwork and "Add to Calendar" / ICS action from Screen 04.

---

## 2. Configuration & Build Pipeline Breakdown

### 2.1 `package.json`
- **Astro**: `^5.0.0`
- **Tailwind CSS**: `^3.4.17` with `@astrojs/tailwind` `^5.1.4`
- **TypeScript**: `^5.7.0` with `@astrojs/check` `^0.9.4`
- **Pagefind**: `^1.3.0` (static WASM search index)
- **Key Scripts**:
  - `npm run build`: Executes `sync_hausbibliothek_catalog.ts` -> `sync_google_calendars.ts` -> `astro build` -> `pagefind --site dist`.
  - `npm run dev`: Starts local dev server at `http://localhost:3000`.
  - `npm run test:a11y`: Lints generated HTML in `dist/` for skip-links, semantic landmarks, and lang attributes.

### 2.2 `astro.config.mjs`
```javascript
export default defineConfig({
  site: process.env.PUBLIC_ASTRO_SITE_URL || 'https://xn--sprachcaf-j4a.org',
  output: 'static',
  integrations: [tailwind()],
  i18n: {
    defaultLocale: 'de',
    locales: ['de', 'pl', 'en'],
    routing: {
      prefixDefaultLocale: false,
      redirectToDefaultLocale: true
    }
  },
  server: { port: 3000, host: true }
});
```

### 2.3 `tailwind.config.mjs` Design System Tokens
| Token Category | Key | Hex Value | Intended Usage |
|---|---|---|---|
| **Surface** | `surface.DEFAULT` | `#FAF6EE` | Warm salon background (Light mode) |
| | `surface.paper` | `#FDFBF7` | Card / paper container background |
| | `surface.dark` | `#181615` | Deep dark mode page background |
| | `surface.dark-surface` | `#24201E` | Card container (Dark mode) |
| | `surface.container` | `#F2ECE4` | Secondary pill / neutral container |
| **Primary** | `primary.DEFAULT` | `#8B1E2D` | Deep Polish Carmine / Wine Red (WCAG AA > 6:1) |
| | `primary.hover` | `#6E1420` | Primary button hover |
| | `primary.dark` | `#FF758F` | Primary accent in dark mode |
| **Tertiary** | `tertiary.DEFAULT` | `#3B6B35` | Warm Olive / Sage Green |
| | `tertiary.dark` | `#78B871` | Olive accent in dark mode |
| **Accent** | `accent.amber-honey` | `#D97706` | Warm amber highlight |
| | `accent.wood-dark` | `#3E2723` | Bookshelf wood frame |
| | `accent.wood-shelf` | `#8D6E63` | Shelf ledge gradient |
| **Typography** | `sans` | Plus Jakarta Sans, Open Sans, Inter | Body text & UI controls |
| | `serif` / `heading` | Literata, Lora, Georgia | Headings, book titles, literary accents |

---

## 3. Layout & Navigation Architecture (`Layout.astro`)

### 3.1 Head & SEO Features:
- **Canonical URLs & Hreflangs**: Automated `hreflang` generation for `de`, `pl`, `en`, and `x-default` via `getHreflangLinks()` in `src/i18n/utils.ts`.
- **Anti-FOUC Theme Script**: Inline script evaluating `localStorage.getItem('theme')` or `prefers-color-scheme`.
- **Structured Data**: Accepts dynamic `jsonLd` schema prop (rendered on Event, Book, and Location detail pages).
- **Brand Assets**: Uses official `/brand-assets/favicon.png` and `/brand-assets/logo.webp`.

### 3.2 Header & Navigation:
- Sticky header (`h-20`) with backdrop blur (`bg-[#FAF6EE]/90 dark:bg-[#181615]/90`).
- Desktop dropdown navigation for **Über uns** (`/ueber-uns/`), **Entdecken** (`/ueber-uns/ausstellungen/`, `/mehrsprachigkeit/`, `/hausbibliothek/`, `/news/`), **Mitmachen** (`/mitmachen/`), and top-level links for `/events/`, `/news/`, `/hausbibliothek/`, and `/kontakt/`.
- Dynamic path prefixing via `getLocalizedPath(path, lang)` in `src/i18n/utils.ts`.
- `MegaMenuNav.astro` is an orphaned legacy component; the active navigation is built directly into `Layout.astro`.

### 3.3 Mobile Menu Drawer & Controls:
- Hamburger button with animated SVG path toggle.
- `LanguageSwitcher.astro` pill component (`DE`, `PL`, `EN` with flags).
- Theme toggle button (`☀️`/`🌙`).

### 3.4 Accessibility (a11y) Compliance:
- WCAG 2.1 AA Skip Link (`href="#main-content"`).
- Semantic landmarks present (`header[role="banner"]`, `nav[role="navigation"]`, `main#main-content`, `footer[role="contentinfo"]`).

---

## 4. Deep-Dive Inspection of the 4 Core Components

### 4.1 `HeroSection.astro` (Homepage Hero)
- **Props**: `title`, `subtitle`, `badge`, `primaryCtaText`, `primaryCtaLink`, `secondaryCtaText`, `secondaryCtaLink`, `images`, `lang`.
- **Current Layout**:
  - 12-column responsive grid (7 cols text + CTA, 5 cols 3-image collage).
  - Background radial glows (`#D97706`/10 and `#8B1E2D`/10).
  - 3-photo organic collage with rounded borders (`rounded-3xl`) and shadow.
- **Issues & Gaps**:
  1. Trust badges ("Eintritt frei / Spendenbasis", "Bilingual Deutsch & Polnisch", "3 Standorte in Berlin") are hardcoded in German in the component template.
  2. Image `alt` texts are hardcoded in German.
  3. Missing the artistic Polish Poster School ("Polska Szkoła Plakatu") paper collage background elements (Stitch Screen 02).

### 4.2 `BookshelfWidget.astro` (3D Wooden Bookshelf)
- **Props**: `title`, `subtitle`, `lang`, `maxBooks` (default 12).
- **Data Source**: Calls `getBooks()` from `src/lib/cms-api.ts` which loads `src/data/books.json` (400+ books).
- **Current Layout**:
  - Dark wood container (`bg-[#2B1810]`, `border-4 border-[#3E2723]`, `rounded-3xl`) with wooden ledge at bottom.
  - Horizontal smooth-scrolling track with Prev/Next buttons.
  - Upright standing books with spine gradient overlay, glossy sheen on hover, and metadata tag below.
- **Issues & Gaps**:
  1. Included on German `/` and `/hausbibliothek/`, but **missing** on Polish `/pl/hausbibliothek/`.
  2. No fallback image handling if `book.cover` fails to load at runtime (relies on static conditional).

### 4.3 `VintageEventTicketCard.astro` (Perforated Ticket Card)
- **Props**: `slug`, `title`, `dateStart`, `location`, `language`, `targetGroup`, `description`, `image`, `lang`.
- **Current Layout**:
  - Card container with watermark circle ("SPRACHCAFÉ POLNISCH").
  - Date stamp box (Month, Day, Time).
  - Perforated dashed divider line with semi-circle edge cutouts (`-ml-8 rounded-r-full`).
  - Event title, description excerpt (`line-clamp-2`), and CTA pill.
- **Issues & Gaps**:
  1. Hardcoded `" Uhr"` time suffix (German format; in Polish it should be omitted or formatted without "Uhr").
  2. Missing linocut / woodcut event category illustration thumbnails from Stitch Screen 04.
  3. Missing "Add to Calendar" / `.ics` export button.
  4. Used on German `/events/` but **not on Polish `/pl/events/`**.

### 4.4 `KiezHubSelector.astro` (3 Standorte / Kiez-Hub Selector)
- **Props**: `lang` (default `'de'`).
- **Data Source**: `getCollection('locations')` querying `src/content/locations/` (Pankow, Schöneberg, Köpenick).
- **Current Layout**:
  - Tab buttons: "Alle Standorte", "Standort Pankow 🌿", "Standort Schöneberg ☕", "Standort Köpenick ⛵".
  - 3-column card grid with themed gradient headers (`#2C5E7A` Pankow, `#4A6741` Schöneberg, `#8B5A2B` Köpenick).
  - Shows address, opening hours, directions / transit, email, and Google Maps link.
  - Client-side tab switching via vanilla JS `data-target` / `data-hub`.
- **Issues & Gaps**:
  1. Lacks the custom vintage architectural illustrations (Pankow bridge & greenery, Schöneberg street café, Köpenick castle & riverboat) from Stitch Screen 05.
  2. Gradient backgrounds are purely CSS; adding SVG/WebP illustrated headers will significantly enhance authentic aesthetic.

---

## 5. Page-by-Page Comparison & Route Parity Matrix

| Feature / Page Area | German Route (`/`) | Polish Route (`/pl/`) | Status & Parity Notes |
|---|---|---|---|
| **Homepage Hero** | `src/pages/index.astro` (uses `HeroSection.astro`) | `src/pages/pl/index.astro` (uses `HeroSection.astro`) | ⚠️ Partial: `HeroSection` internal trust badges & alt texts hardcoded in DE |
| **Homepage Ticket Cards** | Uses `VintageEventTicketCard.astro` | Uses `VintageEventTicketCard.astro` | ✅ Parity achieved on homepages |
| **Homepage Bookshelf** | Uses `BookshelfWidget.astro` | Uses `BookshelfWidget.astro` | ✅ Parity achieved on homepages |
| **Homepage Kiez Selector** | Uses `KiezHubSelector.astro` | Uses `KiezHubSelector.astro` | ✅ Parity achieved on homepages |
| **Events Overview** | `src/pages/events/index.astro` | `src/pages/pl/events/index.astro` | ❌ **Divergence**: DE uses `VintageEventTicketCard`, PL uses plain `<article>` cards |
| **Event Details** | `src/pages/events/[slug].astro` | `src/pages/pl/events/[slug].astro` | ✅ Both generate static paths from collection; JSON-LD locale localized |
| **Hausbibliothek Catalog** | `src/pages/hausbibliothek/index.astro` | `src/pages/pl/hausbibliothek/index.astro` | ❌ **Divergence**: DE includes `<BookshelfWidget>`, PL omits it; card CSS classes differ |
| **Book Details** | `src/pages/hausbibliothek/[id].astro` | `src/pages/pl/hausbibliothek/[id].astro` | ✅ Both generate paths for 400+ books with client hydration |
| **Standorte / Locations** | Rendered via `KiezHubSelector` & `/kontakt/` | Rendered via `KiezHubSelector` & `/pl/kontakt/` | ✅ Parity achieved |

---

## 6. Recommendations & Action Items for Implementation Phase

### Priority 1: Component Refactoring (`ui-engineer`)
1. **Refactor `HeroSection.astro`**:
   - Accept localized trust badges (`trustBadges?: string[]`) or provide default arrays per locale (`de`, `pl`, `en`).
   - Add localized image alt texts.
   - Implement warm paper texture and Polish poster graphic collage accents behind the image grid.
2. **Standardize `VintageEventTicketCard.astro`**:
   - Fix time formatting to respect `lang` (avoid hardcoded `" Uhr"` on PL/EN).
   - Integrate linocut category artwork / category badge icons.
   - Add "Termin / Add to Calendar" link or action.
3. **Enhance `KiezHubSelector.astro`**:
   - Replace or overlay gradient headers with high-resolution vintage architectural illustrations (`/images/locations/pankow-hub.webp`, `schoeneberg-hub.webp`, `koepenick-hub.webp`).
4. **Refactor `BookshelfWidget.astro` & Catalog**:
   - Add `<BookshelfWidget />` to `src/pages/pl/hausbibliothek/index.astro`.
   - Update catalog book cards in both DE and PL to follow the "Karteikarten-Katalog" styling with authentic library stamps.

### Priority 2: i18n & Route Parity (`i18n-sync`)
1. **Update `src/pages/pl/events/index.astro`**:
   - Replace plain `<article>` cards with `VintageEventTicketCard.astro` matching the German page layout.
2. **Align Design Tokens**:
   - Standardize all occurrences of `#8B263E` to the canonical `#8B1E2D` (`primary.DEFAULT`).
   - Update `PagefindSearch.astro` color schemes from `slate-900` to the warm surface tokens (`surface-paper`, `surface-dark`, `border-[#E2D8CC]`).

### Priority 3: Visual Assets Sourcing (`asset-generator`)
1. Sourcing real community photos for hero collage from `public/images/` and `sprachcafe-polnisch.org`.
2. Generating 3 custom vintage architectural illustrations for Kiez-Hubs (Pankow, Schöneberg, Köpenick).
3. Generating 6 linocut/woodcut category badges for cultural events in Polska Szkoła Plakatu style.

