# Design-Entscheidungsprotokoll (Design Decisions)

Dieses Dokument bewertet die im Design-Audit ([`docs/design-audit.md`](./design-audit.md)) identifizierten UI-Muster der bestehenden WordPress-Website gegenüber den neuen technischen Vorgaben (Astro 5 SSG, Zero-JS-First, WCAG 2.1 AA, DSGVO-Konformität, LCP < 1,5s, PageSpeed Score ≥ 95).

Jedes betroffene Muster wird analysiert und mit einer verbindlichen architektonischen Entscheidung versehen (**Originalgetreu nachbauen** vs. **Leicht modernisieren**).

---

## 🛡️ Unveränderliche Kern-Identität (Brand Guarantee)

Folgende Markenelemente bleiben in **jedem Fall strikt unverändert**:
- 🎨 **Markenfarben**: Primär-Rot (Polnisch-Rot `#D4213D`) und Sekundär-Blau (Ozeanblau `#007bb6`).
- 🦅 **Vereinslogo & Favicon**: Offizielles Wappen und Wort-Bild-Marke.
- 💬 **Tonalität & Sprachen**: Dreisprachigkeit (Deutsch, Polnisch, Englisch).

---

## 📋 Übersicht der Design-Entscheidungen

| UI-Muster | Befund in bestehender Site | Konflikt mit neuen Vorgaben | Entscheidung & Begründung | Neugestaltung / Lösung |
|-----------|----------------------------|-----------------------------|---------------------------|------------------------|
| **1. Cookie Banner UI** | Drittanbieter-Cookie-Popup für Google Analytics & Tracking | Entfällt im Zielsystem vollkommen (Vorgabe 9.10) | **Entfällt ersatzlos** | Das Relaunch-Portal verzichtet zu 100% auf Tracking-Cookies. Kein nerviges Banner nötig, maximale Nutzerfreundlichkeit & DSGVO-Konformität. |
| **2. Heavy Slider / Carousel Plugins** | Schwerfälliges JavaScript-Slider Plugin (SwiperJS/Slick) | Widerspricht Zero-JS-First Ansatz, erhöht LCP und TBT | **Leicht modernisieren** | Ersetzung durch **CSS Grid / CSS Scroll Snap**. Barrierefrei, tastaturbedienbar und 0 KB JavaScript-Overhead. |
| **3. External Google Maps Embeds** | Drittanbieter Google Maps iFrame auf Kontakt- & Standortseiten | Überträgt IP-Adressen ohne vorherige Einwilligung an Google | **Leicht modernisieren** | Ersetzung durch **DSGVO-konforme statische Vorschaukarten** mit explizitem Click-to-Load Link (OpenStreetMap / Router). |
| **4. Mega-Menü Navigation** | Schweres jQuery-Drop-Down-Menü | Erfordert große Skripte, schlechte Mobile-Performance | **Leicht modernisieren** | Umstellung auf **Pure CSS Hover & HTML `<details>`/`<summary>`**. Tastatur-Fokusringe gemäß WCAG 2.1 AA. |
| **5. Event- & Magazin-Karten Grid** | Uneinheitliche WordPress-Karten mit Ad-hoc Inline-Styles | Fehlen klarer Design-Tokens, schwache Kontraste | **Leicht modernisieren** | Einheitliche Nutzung von Tailwind Design-Tokens (`brand.card`, `brand.primary`). WCAG 2.1 AA Kontrast von mindestens 4.5:1. |
| **6. Zitat- & Testimonial-Sektion** | Statische Textblöcke ohne klare visuelle Führung | Fehlende Barrierefreiheit, unzureichender Kontrast | **Originalgetreu nachbauen & barrierefrei verfeinern** | Erhalt der bekannten Zitat-Stimmen aus der Community, aufgewertet mit Tailwind Slate-Surfaces & `brand.primary-light` Akzenten. |

---

## 🎯 Detail-Begründungen der Entscheidungen

### 1. Ersatzloser Entfall des Cookie-Banners
- **Hintergrund**: Auf der alten Website blockierte ein modales Cookie-Banner den Bildschirm beim ersten Betreten.
- **Entscheidung**: Da das neue Astro-System rein statisch (SSG) betrieben wird und weder externe Tracking-Pixel noch Marketing-Cookies setzt, wird **kein Cookie-Banner** benötigt.
- **Vorteil**: Erhöht den PageSpeed-Wert sofort um mehrere Punkte und sorgt für ein ungestörtes Nutzererlebnis.

### 2. Modernisierung der Slider zu CSS Scroll Snap
- **Hintergrund**: Slider-Plugins laden oft >100 KB JavaScript, blockieren den Hauptthread und verursachen Layout-Shifts (CLS).
- **Entscheidung**: Galerien und Event-Previews nutzen natives `overflow-x: auto; scroll-snap-type: x mandatory`.
- **Vorteil**: Flüssiges Wischen auf Smartphones, 0 KB JS-Overhead, perfekte Zugänglichkeit für Screenreader.

### 3. DSGVO-Kartenintegration statt iFrames
- **Hintergrund**: Direkte iFrame-Einbindungen von Google Maps verstoßen ohne Vorab-Einwilligung gegen die DSGVO.
- **Entscheidung**: Die Standort-Karten (`LocationOpeningHoursCard.astro`) zeigen ein lokales Kartenbild und einen klaren Link `Route planen &rarr;`.
- **Vorteil**: Kein Risiko von Abmahnungen, schnellere Ladezeit (LCP < 1,5s).
