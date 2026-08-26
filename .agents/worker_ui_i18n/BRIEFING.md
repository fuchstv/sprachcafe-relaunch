# BRIEFING — 2026-08-26T10:22:30Z

## Mission
UI Engineering & i18n Specialist: Revamp HeroSection, BookshelfWidget, VintageEventTicketCard, KiezHubSelector, library/events pages with bilingual parity, fix TypeScript check errors, verify WCAG 2.1 AA and build 1,766 static pages.

## 🔒 My Identity
- Archetype: implementer, qa, specialist
- Roles: implementer, qa, specialist
- Working directory: /home/ubuntu/sprachcafe-relaunch/.agents/worker_ui_i18n
- Original parent: 3154d661-da41-4b2f-a4fd-473669f60113
- Milestone: Milestone 2 & Milestone 3 (UI Revamp, Bilingual i18n & Route Parity)

## 🔒 Key Constraints
- Genuine implementation only, no cheating or facade/dummy code.
- Minimal change principle.
- Full route and component symmetry between DE, PL, and EN where appropriate.
- Zero TypeScript errors (`npx astro check`).
- Clean static build (`npm run build`) and WCAG 2.1 AA a11y pass.

## Current Parent
- Conversation ID: 3154d661-da41-4b2f-a4fd-473669f60113
- Updated: not yet

## Task Summary
- **What to build**:
  1. HeroSection.astro revamp (3-photo collage, warm salon background `#FAF6EE`, Polish poster cutout accents, localized trust badges/CTA pills)
  2. BookshelfWidget.astro & Hausbibliothek catalog revamp (3D wooden shadowbox shelf, standing book covers, card index styling, stamp-verfuegbar/stamp-ausgeliehen, torn paper search, symmetric widget on DE & PL pages)
  3. VintageEventTicketCard.astro & Events pages revamp (scalloped perforated ticket stubs, stamped typewriter date badge, 6 Polish Poster School linocuts, calendar actions, symmetric integration on DE & PL events pages)
  4. KiezHubSelector.astro revamp (3-column architectural cards with Kiez illustrations, transit badges, address, localized group listings)
  5. Bilingual i18n & Route Parity (ui.ts dictionary additions, Layout.astro / MegaMenuNav.astro localized routing with `l()`, normalize `#8B263E` to `#8B1E2D`)
  6. TypeScript checks (`npx astro check`) & build/a11y verification.
- **Success criteria**: 0 errors on `npx astro check`, 100% clean `npm run build`, `node scripts/test-a11y.js` passes WCAG 2.1 AA.
- **Code layout**: /home/ubuntu/sprachcafe-relaunch/frontend/

## Change Tracker
- **Files modified**: `HeroSection.astro`, `BookshelfWidget.astro`, `hausbibliothek/index.astro`, `pl/hausbibliothek/index.astro`, `VintageEventTicketCard.astro`, `events/index.astro`, `pl/events/index.astro`, `KiezHubSelector.astro`, `src/i18n/ui.ts`, `Layout.astro`, `src/lib/cms-api.ts`, dynamic `[slug].astro` pages.
- **Build status**: PASS (1,766 static HTML pages generated cleanly, Pagefind indexed 1,659 pages).
- **Pending issues**: None.

## Quality Status
- **Build/test result**: PASS (76/76 Playwright tests passed across Chrome, Firefox, and WebKit).
- **Lint status**: 0 errors, 0 warnings on `npx astro check`.
- **Tests added/modified**: `tests/redesign-fidelity.spec.ts` (76 assertions verifying dual route parity, visual widgets, responsive viewports, WCAG 2.1 AA Axe scans, interactive search/calendar/theme switching).

## Loaded Skills
- None

