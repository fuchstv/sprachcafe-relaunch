# Handoff Report — Explorer 3: Bilingual i18n & E2E Testing Infrastructure

**Author**: Explorer 3 (Bilingual i18n & E2E Testing Infrastructure Investigator)  
**Date**: 2026-08-26  
**Type**: Hard Handoff (Investigation Complete)  
**Related Documents**: `/home/ubuntu/sprachcafe-relaunch/.agents/explorer_3/analysis.md`

---

## 1. Observation

1. **Astro i18n Configuration**:
   - `frontend/astro.config.mjs` lines 9-16:
     ```js
     i18n: {
       defaultLocale: 'de',
       locales: ['de', 'pl', 'en'],
       routing: {
         prefixDefaultLocale: false,
         redirectToDefaultLocale: true
       }
     }
     ```
   - German pages reside at root (`pages/`), Polish pages at `pages/pl/`, English pages at `pages/en/`.

2. **i18n Utility & Dictionary**:
   - `frontend/src/i18n/ui.ts` contains dictionary keys for `de`, `pl`, and `en` (130 lines total).
   - `frontend/src/i18n/utils.ts` contains `getLangFromUrl`, `useTranslations`, `getLocalizedPath`, and `getHreflangLinks`.
   - Hardcoded strings in components:
     - `frontend/src/components/HeroSection.astro` lines 78-91: Trust indicators ("Eintritt frei / Spendenbasis", "Bilingual Deutsch & Polnisch", "3 Standorte in Berlin") and image `alt` tags (lines 100, 103, 108) are hardcoded in German even when `lang="pl"` is passed.
     - `frontend/src/components/VintageEventTicketCard.astro` line 49: `{timeStr} Uhr` hardcodes German "Uhr".
     - `frontend/src/components/BookshelfWidget.astro` line 34: Section badge `<span>📚 Hausbibliothek</span>` and lines 50, 62: `aria-label="Vorherige Bücher"` / `aria-label="Nächste Bücher"` are hardcoded in German.
     - `frontend/src/components/MegaMenuNav.astro` lines 31-145: Navigation links are hardcoded to German URLs without `getLocalizedPath`.
     - `frontend/src/layouts/Layout.astro` lines 187, 201, 317: News links are hardcoded to `/news/` instead of `l('/news/')`.

3. **Page & Route Inventory**:
   - 115 page templates exist in `frontend/src/pages`.
   - German routes (`/`, `/events/`, `/hausbibliothek/`, `/ueber-uns/`, `/mitmachen/`, `/kontakt/`, `/barrierefreiheit/`, `/impressum/`, `/datenschutz/`, `/mehrsprachigkeit/`, `/posts/`, `/news/`).
   - Polish mirrored routes exist at `/pl/` matching every German canonical route.
   - Polish SEO aliases exist (`/pl/o-nas/...` -> `pages/pl/ueber-uns/...`, `/pl/dzialaj-z-nami/...` -> `pages/pl/mitmachen/...`, `/pl/ochrona-danych-osobowych/` -> `pages/pl/datenschutz.astro`, `/pl/wielojezycznosc/` -> `pages/pl/mehrsprachigkeit.astro`).
   - Component disparity observed:
     - `frontend/src/pages/hausbibliothek/index.astro` line 70 includes `<BookshelfWidget maxBooks={10} />`, while `frontend/src/pages/pl/hausbibliothek/index.astro` is missing `BookshelfWidget`.
     - `frontend/src/pages/events/index.astro` uses `<VintageEventTicketCard />`, while `frontend/src/pages/pl/events/index.astro` uses generic unstyled `<article>` cards.

4. **Build & Diagnostics**:
   - `npx astro build` generates 1,766 static HTML pages in ~25s.
   - `npx astro check` identifies:
     - `src/components/BookshelfWidget.astro:2:25`: TS error `Module '"../lib/cms-api"' has no exported member 'Book'` (`cms-api.ts` exports `BookItem`).
     - `src/pages/ueber-uns/ausstellungen/[slug].astro`: type inference on `entry.data`.
     - `src/components/HeroSection.astro:27:3`: warning unused `lang`.

5. **Playwright E2E Test Suite Execution**:
   - `playwright.config.ts` runs 2 projects (`chromium` and `mobile-chrome`) against `http://127.0.0.1:8089` (`python3 -m http.server 8089 -d frontend/dist`).
   - Executed `npx playwright test`: **62 passed** across 4 spec files (`accessibility.spec.ts`, `calendar-sync.spec.ts`, `domain-tls.spec.ts`, `membership-form.spec.ts`).

---

## 2. Logic Chain

1. **Premise**: The user request and redesign plan require full bilingual parity between German (`/`) and Polish (`/pl/`), authentic Polish Poster School collage styling, and automated regression testing.
2. **Analysis of i18n Architecture**:
   - Astro's SSG i18n setup correctly separates German at root and Polish under `/pl/`.
   - However, the absence of component-level localization in `HeroSection.astro`, `VintageEventTicketCard.astro`, `BookshelfWidget.astro`, and `MegaMenuNav.astro` leads to mixed-language pages when browsing under `/pl/`.
3. **Analysis of Route Parity**:
   - All required routes are structurally present, but component fidelity is uneven (e.g. Polish Events page lacks ticket cards; Polish Hausbibliothek lacks the Bookshelf widget).
4. **Analysis of Test Coverage**:
   - Existing E2E tests cover Accessibility (WCAG 2.1 AA via Axe-Core), Calendar Sync, TLS, and Membership Form.
   - What is missing is a dedicated automated test for:
     - Tier 1: Symmetrical route parity and link isolation (verifying no link on `/pl/` points to `/`).
     - Tier 2: Component rendering & Stitch UI visual elements across both language versions.
     - Tier 3: Mobile hamburger menu toggle and touch scrolling verification.
5. **Conclusion**: Resolving the localized component strings and adding the defined Tier 1-4 Playwright test suites ensures complete bilingual integrity and quality assurance for the redesign.

---

## 3. Caveats

- **External Webhooks**: Contact and Membership forms use Power Automate webhooks (`PUBLIC_POWER_AUTOMATE_CONTACT_WEBHOOK_URL`). In local test environments, network requests are gracefully mocked or handled by Playwright assertions.
- **Pagefind Search Indexing**: Pagefind is run post-build (`pagefind --site dist`). It must be executed whenever `dist/` is refreshed.
- **Calendar Data Dependency**: Google Calendar sync script (`scripts/sync_google_calendars.ts`) generates markdown files in `frontend/src/content/events/`. 146 events are currently cached and checked in.

---

## 4. Conclusion

The bilingual routing infrastructure and Playwright test setup are functional and stable. The multi-agent implementation should proceed with the following exact tasks:
1. **i18n & Content Sync**: Add dictionary keys to `src/i18n/ui.ts`; refactor `HeroSection.astro`, `VintageEventTicketCard.astro`, `BookshelfWidget.astro`, `MegaMenuNav.astro`, and `Layout.astro` to eliminate hardcoded German strings; mirror `<BookshelfWidget />` on `/pl/hausbibliothek/` and `<VintageEventTicketCard />` on `/pl/events/`.
2. **UI & Component Revamp**: Fix TypeScript import (`BookItem` in `BookshelfWidget.astro`); polish 4 core components according to Stitch design specifications.
3. **QA & Verification**: Add Playwright test specs covering Tier 1 (Route Parity) and Tier 2 (Component Rendering) and verify clean `astro check` and `npm run build`.

---

## 5. Verification Method

To verify these findings independently:

1. **Astro Production Build**:
   ```bash
   cd /home/ubuntu/sprachcafe-relaunch/frontend
   npm run build
   ```
   *Expected: Builds 1,766 static pages and exits with code 0.*

2. **TypeScript & Astro Diagnostic Check**:
   ```bash
   cd /home/ubuntu/sprachcafe-relaunch/frontend
   npx astro check
   ```
   *Inspect the reported `Book` vs `BookItem` import and unused variable warnings.*

3. **Playwright E2E Test Suite**:
   ```bash
   cd /home/ubuntu/sprachcafe-relaunch
   npx playwright test
   ```
   *Expected: 62 tests pass cleanly across Desktop and Mobile viewports.*

4. **Verify Analysis Report**:
   ```bash
   cat /home/ubuntu/sprachcafe-relaunch/.agents/explorer_3/analysis.md
   ```
