## 2026-08-26T12:14:21Z

You are Test Writer (Milestone 4: E2E Test Suite Creation).
Your working directory is: `/home/ubuntu/sprachcafe-relaunch/.agents/worker_test`
Project root: `/home/ubuntu/sprachcafe-relaunch`
Original request: `/home/ubuntu/sprachcafe-relaunch/.agents/ORIGINAL_REQUEST.md`
Project spec: `/home/ubuntu/sprachcafe-relaunch/PROJECT.md`
i18n & Testing Report: `/home/ubuntu/sprachcafe-relaunch/.agents/explorer_3/analysis.md`

Your tasks:
1. Read `/home/ubuntu/sprachcafe-relaunch/.agents/explorer_3/analysis.md` and `/home/ubuntu/sprachcafe-relaunch/PROJECT.md`.
2. Author a comprehensive, requirement-driven Playwright test suite in `/home/ubuntu/sprachcafe-relaunch/tests/redesign-fidelity.spec.ts` covering all 4 tiers:
   - **Tier 1: Symmetrical Route Parity & Link Isolation**:
     - Verify both `/` (German) and `/pl/` (Polish) versions of: Home, Events (`/events/` vs `/pl/events/`), Hausbibliothek (`/hausbibliothek/` vs `/pl/hausbibliothek/`), About Us (`/ueber-uns/` vs `/pl/ueber-uns/` or `/pl/o-nas/`), Contact (`/kontakt/` vs `/pl/kontakt/`).
     - Verify that all navigation links on `/pl/` pages preserve the Polish `/pl/` path prefix.
   - **Tier 2: Core Component Rendering & Stitch Visual Fidelity**:
     - Verify Homepage renders Hero 3-photo collage and Polish Poster accents.
     - Verify `/events/` and `/pl/events/` BOTH render `VintageEventTicketCard` with perforated notches, typewriter date stamps, and linocut category artwork.
     - Verify `/hausbibliothek/` and `/pl/hausbibliothek/` BOTH render `BookshelfWidget` 3D wooden shelf and catalog card stamps.
     - Verify Kiez Hub section renders all 3 location cards (Pankow, Schöneberg, Köpenick) with architectural illustrations.
   - **Tier 3: Responsive Viewports**:
     - Test Desktop viewport (1376x768 and 1920x1080).
     - Test Mobile viewport (375x667). Verify mobile hamburger navigation expands/collapses and components adapt gracefully without horizontal scroll overflow.
   - **Tier 4: Accessibility & Interactions**:
     - Run Axe-Core accessibility audits for WCAG 2.1 AA on the relaunched pages.
     - Verify contrast, alt texts on all illustrations/photos, ARIA labels on carousel/filters, and "Add to Calendar" / catalog search interactions.
3. Test runner verification: Verify syntax and compile status of the test suite.
4. Write your completion report to `/home/ubuntu/sprachcafe-relaunch/.agents/worker_test/handoff.md` and send a message when done.
