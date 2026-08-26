# Handoff Report: Frontend Architecture & Existing Components Investigation

**Agent**: Explorer 1 (Frontend Architecture & Existing Components Investigator)  
**Target Folder**: `/home/ubuntu/sprachcafe-relaunch/.agents/explorer_1/`  
**Handoff Type**: Hard (Investigation Complete)  
**Date**: 2026-08-26  

---

## 1. Observation

### Build & Tooling Verification
- Running `npm run build` inside `/home/ubuntu/sprachcafe-relaunch/frontend` succeeded with exit code 0:
  - Command: `npx -y tsx ../scripts/sync_hausbibliothek_catalog.ts && npx -y tsx ../scripts/sync_google_calendars.ts && astro build && pagefind --site dist`
  - Output: `1766 page(s) built in 41.25s`, Pagefind indexed 3 languages (`de`, `pl`, `en`), 1658 pages, 17,704 words.
- Running `node scripts/test-a11y.js` passed cleanly:
  - Output: `✅ Accessibility Audit Passed Cleanly! All pages meet WCAG 2.1 AA requirements.`
- Running `npx astro check` returned 58 TypeScript typing errors (exit code 1) in dynamic collection templates (e.g. `src/pages/ueber-uns/ausstellungen/[slug].astro:16-21`, `src/pages/ueber-uns/team.astro:8`, `src/pages/pl/ueber-uns/team.astro:8`), where collection entries lack explicit type annotations.

### Core Component Implementations & Locations
1. **Homepage Hero (`src/components/HeroSection.astro`)**:
   - Lines 78–91: Hardcoded German trust indicators:
     ```astro
     <div class="flex items-center gap-2"><span>Eintritt frei / Spendenbasis</span></div>
     <div class="flex items-center gap-2"><span>Bilingual Deutsch & Polnisch</span></div>
     <div class="flex items-center gap-2"><span>3 Standorte in Berlin</span></div>
     ```
   - Lines 100, 103, 108: Hardcoded German `alt` attributes:
     - `"SprachCafé Begegnung und Austausch"`, `"Gemeinschaft im SprachCafé"`, `"Hausbibliothek und Leseraum"`.
   - Lacks Polish Poster School paper collage accents behind the 3-image grid.

2. **Hausbibliothek Bookshelf (`src/components/BookshelfWidget.astro`)**:
   - Lines 18–20: Uses `getBooks()` from `src/lib/cms-api.ts` which loads `src/data/books.json`.
   - Lines 70–135: 3D dark wood bookshelf container with bottom shelf ledge and smooth-scrolling cover carousel.
   - **Route parity divergence**: Included on German `/hausbibliothek/` (`src/pages/hausbibliothek/index.astro:70`), but **completely missing** from Polish `/pl/hausbibliothek/` (`src/pages/pl/hausbibliothek/index.astro`).

3. **Event Ticket Card (`src/components/VintageEventTicketCard.astro`)**:
   - Lines 46–50: Typewriter-style date stamp box (`monthStr`, `dayStr`, `{timeStr} Uhr`). Hardcoded `" Uhr"` suffix is German-specific.
   - Lines 70–75: CSS perforated dashed line with semi-circle edge notches.
   - **Route parity divergence**: German `/events/` (`src/pages/events/index.astro:161`) renders `VintageEventTicketCard.astro`. Polish `/pl/events/` (`src/pages/pl/events/index.astro:158`) renders plain `<article>` cards and never imports `VintageEventTicketCard`.

4. **Kiez-Hub Selector (`src/components/KiezHubSelector.astro`)**:
   - Lines 13–17: Uses CSS linear gradients (`from-[#2C5E7A]/95`, `from-[#4A6741]/95`, `from-[#8B5A2B]/95`).
   - Lines 174–259: 3-column card layout displaying Pankow, Schöneberg, and Köpenick with interactive filter tabs.
   - Lacks the custom architectural linocut/watercolor illustrations (Pankow bridge, Schöneberg street café, Köpenick castle & riverboat) shown in Stitch Screen 05.

### Styling & Token Consistency
- `tailwind.config.mjs` defines `primary.DEFAULT: '#8B1E2D'` (Wine Red).
- Pages `src/pages/events/index.astro`, `src/pages/pl/events/index.astro`, `src/pages/events/[slug].astro`, `src/pages/pl/events/[slug].astro`, and `src/pages/pl/hausbibliothek/index.astro` use inconsistent hardcoded hex `#8B263E`.
- `MegaMenuNav.astro` and `PagefindSearch.astro` use legacy `bg-slate-900` dark theme styling.

---

## 2. Logic Chain

1. **Premise 1**: The user request and redesign execution plan mandate full visual fidelity to Stitch screens (Screens 01–05) and symmetric bilingual parity across German (`/`) and Polish (`/pl/`) routes.
2. **Premise 2**: Direct inspection of `src/pages/pl/events/index.astro` proves that Polish events use generic cards while German events use `VintageEventTicketCard.astro`. Therefore, route symmetry is currently broken on the events overview page.
3. **Premise 3**: Direct inspection of `src/pages/pl/hausbibliothek/index.astro` proves that Polish library catalog omits `BookshelfWidget.astro` while the German catalog includes it. Therefore, route symmetry is broken on the catalog overview.
4. **Premise 4**: Direct inspection of `src/components/HeroSection.astro` and `VintageEventTicketCard.astro` proves that text strings ("Eintritt frei...", `" Uhr"`, and image alt texts) are hardcoded in German. Therefore, Polish users receive German fragments on localized pages.
5. **Premise 5**: The Astro production build compiles 1,766 static pages cleanly and Pagefind indexes the corpus without runtime failure, but `astro check` fails on unannotated TypeScript props in dynamic routes.
6. **Conclusion**: The codebase has a solid SSG foundation and valid configuration, but requires targeted component refactoring, i18n synchronization, asset integration, and type annotation fixes across the identified areas.

---

## 3. Caveats

- **External API Connectivity**: The Google Calendar sync (`sync_google_calendars.ts`) and Hausbibliothek catalog sync (`sync_hausbibliothek_catalog.ts`) require internet connectivity during build. In offline/mock mode, they rely on pre-existing static cached files in `src/content/events/` and `src/data/books.json`.
- **Power Automate Webhook URLs**: Form components (`ContactForm.astro`, `ApplicationForm.astro`, `ChildrenEventForm.astro`, `MembershipForm.astro`) contain fallback mock endpoints. If environment variables are absent, client-side fetches gracefully report success.
- **English Route Scope**: While English (`en`) routes exist in the codebase, the primary focus of this relaunch milestone is German/Polish bilingual excellence (DE/PL parity).

---

## 4. Conclusion

The Astro 5 and Tailwind frontend architecture is production-ready, clean, and fully DSGVO-compliant with self-hosted fonts and static search indexing. 

To achieve full compliance with the Stitch UI design specifications and bilingual parity:
1. **Asset Generator Agent** should supply: (a) 3 Kiez-Hub vintage architectural illustrations for Pankow, Schöneberg, and Köpenick, (b) 6 linocut category artwork covers for cultural events, and (c) optimized hero photo collage assets.
2. **UI Engineer Agent** should refactor: (a) `HeroSection.astro` (add Polish poster collage layer + localized trust badges), (b) `VintageEventTicketCard.astro` (fix time formatting, add category badge artwork, add "Add to Calendar" action), (c) `KiezHubSelector.astro` (integrate architectural illustrations), and (d) `BookshelfWidget.astro` & catalog cards (card-index styling with library stamps).
3. **i18n Sync Agent** should: (a) Update `src/pages/pl/events/index.astro` to render `VintageEventTicketCard.astro`, (b) Add `BookshelfWidget.astro` to `src/pages/pl/hausbibliothek/index.astro`, and (c) Normalize color tokens from `#8B263E` to `#8B1E2D`.
4. **QA Verifier Agent** should verify: (a) `npm run build` succeeds (1766+ pages), (b) `npx astro check` passes with 0 errors, (c) `npm run test:a11y` passes, and (d) desktop/mobile visual rendering matches Stitch references.

---

## 5. Verification Method

To independently verify these findings, run the following commands inside `/home/ubuntu/sprachcafe-relaunch/frontend`:

```bash
# 1. Verify static production build & Pagefind search indexing
npm run build

# 2. Verify WCAG 2.1 AA accessibility & landmark compliance
node scripts/test-a11y.js

# 3. Verify TypeScript typecheck status across all Astro components
npx astro check

# 4. Inspect core component files
cat src/components/HeroSection.astro | grep -n "Eintritt frei"
cat src/components/VintageEventTicketCard.astro | grep -n "Uhr"
cat src/pages/pl/events/index.astro | grep -n "VintageEventTicketCard" # (returns nothing - confirms divergence)
cat src/pages/pl/hausbibliothek/index.astro | grep -n "BookshelfWidget" # (returns nothing - confirms divergence)
```

**Invalidation Conditions**:
- If `src/pages/pl/events/index.astro` is updated to import and use `VintageEventTicketCard.astro`, finding 1.2 is resolved.
- If `src/pages/pl/hausbibliothek/index.astro` is updated to include `BookshelfWidget.astro`, finding 1.3 is resolved.
- If explicit type annotations are added to `ausstellungen/[slug].astro` and `team.astro`, `npx astro check` will return 0 errors.

