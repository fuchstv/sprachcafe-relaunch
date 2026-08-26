# Project: SprachCafé Polnisch Bilingual Web Platform Relaunch

## Architecture
- **Framework**: Astro 5 (Static Site Generation / SSG) + Tailwind CSS 3.4 + TypeScript
- **i18n System**: Astro built-in routing with default German (`/`) and Polish prefix (`/pl/`), plus English (`/en/`).
- **Data Stores**: Static Markdown content collections (`src/content/events/`), JSON catalogs (`src/data/books.json`), and CMS API bridges (`src/lib/cms-api.ts`).
- **Search Engine**: Pagefind static client-side multi-language search (`pagefind --site dist`).
- **Design Language**: Hybrid Warm Cultural Salon (`#FAF6EE`, `#8B1E2D`, Literata Serif) combined with Polska Szkoła Plakatu (Polish Poster School) artistic accents (linocut cultural artwork, torn paper cutouts, perforated ticket stubs, library date stamps).

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Kiez Architectural Illustrations | 3 vintage ink/woodcut illustrations for Pankow, Schöneberg, and Köpenick | M1 | Stitch Screen 05 |
| 2 | Polish Poster Linocut Artwork | 6 cultural linocut category illustrations (Literatur, Jazz, Tandem, Kunst, Familie, Film) | M1 | Stitch Screen 04 |
| 3 | Stamps & Textures Library | SVG textures for ticket perforations, torn paper edges, and library stamps ("Verfügbar", "Ausgeliehen", Seal) | M1 | Stitch Screens 02-04 |
| 4 | Hero Section Revamp | Organic 3-photo collage with warm glow, Polish poster accents, localized trust badges & CTA pills | M2 | Stitch Screen 01/02 |
| 5 | Hausbibliothek 3D Bookshelf & Catalog | 3D shadowbox wooden bookshelf with standing book covers, torn search bar, library card index catalog layout with stamps | M2 | Stitch Screen 03 |
| 6 | Vintage Ticket Card & Events Revamp | Perforated ticket cards with scalloped punch notches, typewriter date boxes, linocut covers, calendar action | M2 | Stitch Screen 04 |
| 7 | Kiez-Hub Selector Revamp | 3-column architectural cards with Kiez illustrations, colored headers, S-Bahn badges | M2 | Stitch Screen 05 |
| 8 | Symmetrical i18n Dictionary & Routes | Complete `src/i18n/ui.ts` dictionary keys, localized alt texts, mirrored components on `/pl/events/` and `/pl/hausbibliothek/` | M3 | Requirement R3 |
| 9 | TypeScript & Astro Check Cleanliness | Fix `BookItem` typing in `BookshelfWidget.astro` and collection types in dynamic routes | M3 | Requirement R3 |
| 10 | Playwright E2E & Visual Verification | Automated test suite covering Tiers 1-4 (Route parity, visual component fidelity, responsive layout, WCAG AA) | M4 | Requirement R3 & AC |
| 11 | Forensic Integrity Audit | Binary veto audit ensuring genuine implementation, zero mocks, authentic logic | M5 | Audit Framework |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Asset Generation & Sourcing | Kiez illustrations (Pankow, Schöneberg, Köpenick), 6 Polish Poster Linocuts, SVG stamps & textures, optimized hero images | Survey | PLANNED |
| M2 | Core Components & UI Revamp | `HeroSection.astro`, `BookshelfWidget.astro`, `VintageEventTicketCard.astro`, `KiezHubSelector.astro`, and design token normalization | M1 | PLANNED |
| M3 | Bilingual Parity & Type Safety | Symmetrical i18n (`src/i18n/ui.ts`, `/pl/` routes parity), `npx astro check` 0 errors, WCAG 2.1 AA a11y | M2 | PLANNED |
| M4 | E2E Testing & Test Pass | Playwright test suites (Tiers 1-4), SSG build verification (1,766 pages), Reviewers & Challengers | M3 | PLANNED |
| M5 | Forensic Integrity Audit | Systematic integrity check verifying authentic implementation and zero hardcoded fake data | M4 | PLANNED |

## Code Layout
```
sprachcafe-relaunch/
├── docs/stitch-designs/               # Reference UI screen captures (Screens 01-05)
├── frontend/
│   ├── public/
│   │   └── images/
│   │       ├── illustrations/         # 3 Kiez etchings + 6 Polish Poster linocuts
│   │       ├── stamps/                # SVG library stamps & seal textures
│   │       ├── hero/                  # Authentic community photography
│   │       └── covers/                # Book covers for catalog
│   ├── src/
│   │   ├── components/
│   │   │   ├── HeroSection.astro      # Relaunched hero with 3-photo collage
│   │   │   ├── BookshelfWidget.astro  # 3D shadowbox wooden shelf
│   │   │   ├── VintageEventTicketCard.astro # Perforated ticket stub
│   │   │   ├── KiezHubSelector.astro  # 3-column illustrated Kiez hubs
│   │   │   └── MegaMenuNav.astro      # Localized navigation
│   │   ├── i18n/
│   │   │   ├── ui.ts                  # DE / PL / EN dictionaries
│   │   │   └── utils.ts               # Localized path helpers
│   │   ├── pages/                     # German routes (/, /events/, /hausbibliothek/, etc.)
│   │   └── pages/pl/                  # Polish routes (/pl/, /pl/events/, /pl/hausbibliothek/, etc.)
│   └── tailwind.config.mjs            # Primary brand tokens (#8B1E2D, #FAF6EE, Literata)
├── tests/                             # Playwright E2E test specs (Tiers 1-4)
└── playwright.config.ts               # Playwright configuration
```

## Interface Contracts
### `VintageEventTicketCard.astro`
- Props: `event: EventItem`, `lang: 'de' | 'pl' | 'en'`, `variant?: 'ticket' | 'mini' | 'featured'`
- Visual elements: Top/bottom perforation notches, stamped date box, category linocut artwork, "Add to Calendar" / "Details" actions.

### `BookshelfWidget.astro`
- Props: `maxBooks?: number`, `lang: 'de' | 'pl' | 'en'`
- Visual elements: 3D shadowbox shelf with bottom ledge, interactive horizontal scroll, book cover hover elevation, library catalog link.

### `KiezHubSelector.astro`
- Props: `lang: 'de' | 'pl' | 'en'`, `initialHub?: 'pankow' | 'schoeneberg' | 'koepenick'`
- Visual elements: 3 architectural illustration cards with themed header badges, transport badges, address, and local group listings.

### `HeroSection.astro`
- Props: `lang: 'de' | 'pl' | 'en'`
- Visual elements: Hybrid salon `#FAF6EE` background, organic 3-photo collage with warm glow and torn paper accents, localized trust badges and CTA buttons.
