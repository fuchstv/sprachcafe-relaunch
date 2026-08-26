## 2026-08-26T10:22:18Z
Worker: UI Engineer & i18n Specialist (Milestone 2 & Milestone 3)
Tasks:
1. Revamp `frontend/src/components/HeroSection.astro`:
   - Warm salon `#FAF6EE` background, organic 3-photo collage using `/images/hero/` (`hero-collage-1.avif`, `hero-collage-2.avif`, `hero-collage-3.avif`), warm ambient glow, Polish Poster School cutout accents, fully localized trust indicators and CTA pills.
   - Symmetrically localize all `alt` texts and trust badges based on `lang` prop (`de`, `pl`, `en`).
2. Revamp `frontend/src/components/BookshelfWidget.astro` & Hausbibliothek catalog (`/hausbibliothek/` & `/pl/hausbibliothek/`):
   - Refactor `BookshelfWidget.astro` with 3D wooden shadowbox shelf depth, bevels, standing book covers from `/images/covers/` or `books.json`, interactive horizontal carousel, localized ARIA labels.
   - Fix TypeScript import (`import type { BookItem } from '../lib/cms-api'`).
   - Add library catalog card index styling with green "Verfügbar" and rose "Ausgeliehen" stamps (`/images/stamps/stamp-verfuegbar.svg` & `stamp-ausgeliehen.svg`) and torn paper search bar.
   - Ensure `<BookshelfWidget />` is included symmetrically in BOTH `src/pages/hausbibliothek/index.astro` AND `src/pages/pl/hausbibliothek/index.astro`.
3. Revamp `frontend/src/components/VintageEventTicketCard.astro` & Events pages (`/events/` & `/pl/events/`):
   - Implement perforated ticket stubs with scalloped top/bottom cutout punch holes (`mask-image` / CSS notch cutouts and dashed separator line).
   - Stamped typewriter date badge (`monthStr`, `dayStr`, localized time format: `{timeStr} Uhr` in DE, `godz. {timeStr}` in PL).
   - Integrate 6 Polish Poster School cultural linocuts from `/images/illustrations/` (`linocut-lesung.webp`, `linocut-jazz.webp`, `linocut-tandem.webp`, `linocut-kunst.webp`, `linocut-kinder.webp`, `linocut-film.webp`) mapped to event categories.
   - "Add to Calendar" / "Details ansehen" actions with localized labels.
   - Ensure `<VintageEventTicketCard />` is rendered symmetrically in BOTH `src/pages/events/index.astro` AND `src/pages/pl/events/index.astro`.
4. Revamp `frontend/src/components/KiezHubSelector.astro`:
   - 3-column architectural cards with the new Kiez illustrations (`/images/illustrations/kiez-pankow.webp`, `kiez-schoeneberg.webp`, `kiez-koepenick.webp`), themed header badges, transport badges, address, and local group listings.
   - Fully localized text and ARIA attributes for DE/PL/EN.
5. Bilingual i18n & Route Parity (`src/i18n/ui.ts`, `src/i18n/utils.ts`, `MegaMenuNav.astro`, `Layout.astro`):
   - Add all missing dictionary keys in `src/i18n/ui.ts` for trust badges, ticket stamps, bookshelf labels, calendar actions.
   - Fix hardcoded `/news/` links in `Layout.astro` and hardcoded German links in `MegaMenuNav.astro` to use localized path helper `l(...)`.
   - Normalize color token `#8B263E` to `#8B1E2D` across event and library pages.
6. TypeScript & Build Verification:
   - Fix any TypeScript errors in dynamic collection templates (`ausstellungen/[slug].astro`, `team.astro`) so `npx astro check` passes with 0 errors.
   - Run `npm run build` in `frontend/` to confirm 1,766 static HTML pages build cleanly and Pagefind search index completes.
   - Run `node scripts/test-a11y.js` to confirm WCAG 2.1 AA accessibility passes.
7. Write handoff report to `.agents/worker_ui_i18n/handoff.md` and send message to parent.
