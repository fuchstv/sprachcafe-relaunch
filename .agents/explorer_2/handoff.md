# Handoff Report — Explorer 2: Visual Asset Inventory & Design Reference Breakdown

**Agent**: Explorer 2 (`explorer_2`)  
**Mission**: Analyze Stitch design references, audit existing visual assets, and establish the visual requirements matrix and technical specifications for R1 & R2.  
**Deliverable Report**: [`analysis.md`](/home/ubuntu/sprachcafe-relaunch/.agents/explorer_2/analysis.md)  
**Date**: 2026-08-26  

---

## 1. Observation

1. **Stitch Reference Files**:
   - Inspected all 5 Stitch reference mockups in `/home/ubuntu/sprachcafe-relaunch/docs/stitch-designs/`:
     - `01_home_variant_1.png` (52 KB, 1376x768): Warm cultural salon, organic 3-4 photo collage, amber ambient glow, 3 bottom ticket-card teasers with rubber stamp watermarks.
     - `02_home_variant_2.png` (57 KB, 1376x768): Polish Poster School (Polska Szkoła Plakatu) hero masthead banner with ripped paper edges, cutout badge "POLSKA SZKOŁA PLAKATU", and stamped typewriter event mini-cards.
     - `03_hausbibliothek_katalog.png` (54 KB, 1376x768): 3D wooden shadowbox bookshelf with standing book covers, torn paper search bar and filter dropdowns, and vintage library card catalog slips (Karteikarten) featuring red "Verfügbar" rubber stamps and circular seal watermarks.
     - `04_programmkalender_events.png` (60 KB, 1376x768): Slate chalkboard navy canvas (`#1F2933`), 6 perforated vintage ticket stub cards with top/bottom scalloped cutout punch holes, dashed vertical perforation dividers, stamped typewriter date boxes, and 6 high-contrast Polish Poster School linocuts (Literatur, Jazz, Kinder, Kunst, Tandem, Film).
     - `05_standorte_kiez_hub.png` (52 KB, 1376x768): 3-column architectural cards with top & bottom vignettes (Pankow Panke stone bridge & green park, Schöneberg lively street cafe & Altbauten, Köpenick Schloss Baroque castle on Dahme river) in vintage ink drawing & watercolor wash style.

2. **Existing Image Asset Audit**:
   - Inspected `/home/ubuntu/sprachcafe-relaunch/frontend/public/images/`:
     - `/images/hero/`: High quality authentic community photographs (`hero-collage-1.avif`, `hero-collage-2.avif`, `hero-collage-3.avif`, `hero-collage-4.avif`, `homepage-hero.webp`, `header-general.jpg`).
     - `/images/library/`: `hausbibliothek-raum.webp` (authentic wide shot of Pankow salon and library shelves).
     - `/images/events/`: Authentic event photos (`event-sprachabend.webp`, `event-polish-breakfast.webp`, `event-geschichten.avif`, `event-literaturreise.avif`), but placeholder SVGs (`default-event.svg`, `pankow-event.svg`, `schoeneberg-event.svg`, `koepenick-event.svg`, `kinder-event.svg`) containing simple colored CSS gradient rectangles.
     - `/images/locations/`: Placeholder SVGs (`pankow.svg`, `schoeneberg.svg`, `koepenick.svg`) with simple linear gradients and text.
     - `/images/covers/`: 370+ real book cover images from the Hausbibliothek database.
     - `/brand-assets/`: Production-ready official logos, favicons, donation icons, and social SVG badges.

3. **Current Component Implementation**:
   - `HeroSection.astro` (lines 95-112): Uses a standard 2-column grid with rectangular cards rather than the organic nested cutout layout with paper accents.
   - `BookshelfWidget.astro` (lines 71-135): Implements dark container with basic gradient, but lacks the realistic 3D shadowbox top depth and bevels from Screen 3.
   - `VintageEventTicketCard.astro` (lines 35-76): Implements partial ticket notches with dashed divider, but lacks the scalloped top/bottom perforation punch holes and linocut artwork integration from Screen 4.
   - `KiezHubSelector.astro` (lines 173-258): Displays text and colored gradient header banners without the architectural illustrations from Screen 5.

---

## 2. Logic Chain

1. **Premise 1**: The user request and design plan establish a hybrid design system combining the warm salon baseline (`#FAF6EE` background, `#8B1E2D` primary, Literata typography) with authentic Polish Poster School artistic accents (torn paper, stamps, woodcuts).
2. **Premise 2**: Direct inspection of `/docs/stitch-designs/` shows specific visual requirements for 4 core UI sections:
   - Standorte & Kiez-Hub requires 3 distinct architectural illustrations (Pankow, Schöneberg, Köpenick) in vintage ink/watercolor style.
   - Programmkalender requires 6 distinct linocut cultural illustrations for event categories (Literatur, Jazz, Tandem, Kunst, Familie, Film).
   - Hausbibliothek requires a 3D wooden shelf, torn paper search bar, and library catalog card styling with rubber stamps.
   - Hero requires a 3-4 photo organic collage utilizing real community photography with subtle paper cutout accents.
3. **Premise 3**: Direct inspection of `/frontend/public/images/` confirms that authentic community photography is already available and high-resolution, but the location SVGs and event SVGs are rudimentary gradient placeholders that must be replaced.
4. **Premise 4**: Modern CSS (`mask-image` with radial-gradient, clip-path polygons, CSS transform and border effects) provides lightweight, performant, and zero-JS implementations for the perforated ticket notches, torn paper search edges, and 3D shelf depth.
5. **Conclusion**: By generating the 3 Kiez illustrations, 6 Polish Poster School linocuts, and SVG stamp/texture masks, and updating the 4 Astro components with the specified CSS recipes, the site will achieve 100% visual fidelity with the Stitch design reference screens.

---

## 3. Caveats

1. **AI Image Generation Tooling**: In Phase 1, `generate_image` or external asset pipelines should generate WebP/PNG illustrations at 600x600 px (events) and 800x500 px (Kiez hubs) and optimize them under 120 KB to maintain fast Core Web Vitals.
2. **Dynamic Live Availability**: In `frontend/src/pages/hausbibliothek/index.astro`, the client-side availability script fetches live status from `https://hausbibliothek.org/api/export/books`. The "Verfügbar" stamp styling must dynamically update between green (`Verfügbar`) and rose (`Ausgeliehen`).
3. **Dark Mode Adaptation**: The perforated ticket cards and torn paper elements must invert/adapt their cutout backdrop masks in dark mode (`#181615` / `#24201E`).

---

## 4. Conclusion

The visual audit is complete. All reference mockups, existing assets, component implementations, and CSS technique specifications have been systematically cataloged in [`analysis.md`](/home/ubuntu/sprachcafe-relaunch/.agents/explorer_2/analysis.md). The roadmap provides the exact asset list, file paths, dimensions, color palettes, and CSS recipes required for `asset-generator` (Phase 1) and `ui-engineer` (Phase 2).

---

## 5. Verification Method

1. **Inspect Visual Report**:
   ```bash
   view_file /home/ubuntu/sprachcafe-relaunch/.agents/explorer_2/analysis.md
   ```
2. **Verify Reference Screen Existence**:
   ```bash
   ls -la /home/ubuntu/sprachcafe-relaunch/docs/stitch-designs/
   ```
3. **Verify Existing Image Assets**:
   ```bash
   ls -la /home/ubuntu/sprachcafe-relaunch/frontend/public/images/hero/ /home/ubuntu/sprachcafe-relaunch/frontend/public/images/events/
   ```
4. **Invalidation Condition**: If any required asset file path, CSS mask recipe, or Stitch screen requirement is missing from `analysis.md`.
