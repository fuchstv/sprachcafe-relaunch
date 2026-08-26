# Original User Request

## 2026-08-26T10:01:00Z

Relaunch and authentic redesign of the bilingual (German/Polish) web platform for SprachCafé Polnisch (sprachcafé.org) based on the Stitch UI project specifications (ID: 15954072998866877120), featuring a hybrid warm salon/cafe foundation with Polish Poster School (Polska Szkoła Plakatu) artistic collage accents.

Working directory: /home/ubuntu/sprachcafe-relaunch
Integrity mode: development

## Reference Materials
- Design References: `/home/ubuntu/sprachcafe-relaunch/docs/stitch-designs/` (01_home_variant_1.png, 02_home_variant_2.png, 03_hausbibliothek_katalog.png, 04_programmkalender_events.png, 05_standorte_kiez_hub.png)
- Redesign Execution Plan: `/home/ubuntu/.gemini/antigravity-cli/brain/84bb44db-bf75-448c-9268-25bf73d6a62e/plan_multi_agent_sprachcafe_redesign.md`
- Frontend Codebase: `/home/ubuntu/sprachcafe-relaunch/frontend` (Astro + Tailwind CSS)

## Requirements

### R1. Authentic Asset Sourcing & Visual Illustrations
Sourcing and generating visual assets aligned with the Stitch design reference screens:
- Extract real community and cafe event photographs from `https://sprachcafe-polnisch.org/` and `/public/images/`.
- Produce custom vintage architectural illustrations for the 3 Kiez-Hubs (Pankow bridge & green kiez, Schöneberg lively street cafe, Köpenick castle & riverboat).
- Generate Polish Poster School ("Polska Szkoła Plakatu") style linocut/woodcut event illustrations for cultural categories.
- Implement CSS/SVG textures for perforated ticket borders, torn paper edges, and rubber library stamps.

### R2. Core Astro & Tailwind Component Revamp
Refactor and polish the 4 core UI areas in `frontend/src/components/` and corresponding pages:
1. **Homepage (`HeroSection.astro`, `index.astro`)**: Hybrid warm salon background (`#FAF6EE`), organic 3-photo collage, Polish Poster paper accents, trust badges, and CTA pills.
2. **Hausbibliothek (`BookshelfWidget.astro`, `/hausbibliothek/`)**: 3D wooden bookshelf banner, library card index catalog layout, torn search bar, and "Verfügbar" library stamps.
3. **Programmkalender & Events (`VintageEventTicketCard.astro`, `/events/`)**: Perforated ticket stubs, stamped typewriter date badges, category filters, and "Add to Calendar" action.
4. **Standorte & Kiez-Hubs (`KiezHubSelector.astro`)**: 3-column illustrated Kiez cards (Pankow, Schöneberg, Köpenick) with themed color headers, S-Bahn badges, and local group listings.

### R3. Bilingual (DE/PL) Content & Accessibility Synchronization
Ensure full symmetric localization and accessibility:
- German and Polish route and content parity (`/` and `/pl/`).
- Accessible alt texts for all images and WCAG AA contrast compliance.

## Acceptance Criteria

### Visual & Component Fidelity
- [ ] Homepage hero, events ticket cards, library catalog, and Kiez-hub selector visually match the Stitch references in `/docs/stitch-designs/`.
- [ ] Responsive rendering verified on Desktop (1376px+) and Mobile viewports (375px+).

### Build & Code Verification
- [ ] Astro production build (`npm run build` inside `/frontend`) succeeds with 0 errors and 0 unresolved imports.
- [ ] TypeScript type checks pass cleanly across all Astro components.

### Automated Testing & Quality
- [ ] Automated Playwright visual and navigation tests execute and pass.
- [ ] Zero broken links or missing image assets across both `/` (German) and `/pl/` (Polish) paths.
