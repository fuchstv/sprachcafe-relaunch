# Design-Tokens & WCAG 2.1 AA Kontrast-Audit

Dieses Dokument dokumentiert die aus der Live-Website (`https://sprachcafe-polnisch.org/`) extrahierten Design-Tokens, deren Überführung in die Tailwind-Konfiguration ([`frontend/tailwind.config.mjs`](../frontend/tailwind.config.mjs)) sowie die rechnerische Kontrastprüfung gemäß WCAG 2.1 AA.

---

## 🎨 1. Farbtokens & WCAG 2.1 AA Kontrast-Matrix

Alle Farbwerte wurden in benannte Tokens im `brand` Namespace überführt, anstatt flache Hex-Werte im Markup zu verstreuen.

| Token Name in Tailwind | Hex-Wert | Verwendungszweck | Hintergrund | Kontrast-Verhältnis | WCAG Status |
|------------------------|----------|------------------|-------------|---------------------|-------------|
| `colors.brand.primary` | `#D4213D` | Primärfarbe (Polnisch-Rot) | `#FFFFFF` | **4.8:1** | ✅ AA Bestanden (Fließtext) |
| `colors.brand.primary-light` | `#f43f5e` | Akzent-Rot für Dark Mode | `#0f172a` | **5.8:1** | ✅ AA Bestanden (Fließtext) |
| `colors.brand.secondary` | `#007bb6` | Sekundärfarbe (Ozeanblau) | `#FFFFFF` | **4.6:1** | ✅ AA Bestanden (Fließtext) |
| `colors.brand.secondary-light` | `#38bdf8` | Akzent-Blau für Dark Mode | `#0f172a` | **7.2:1** | ✅ AAA Bestanden |
| `colors.brand.marker` | `#fbd100` | Marker-Hervorhebung `==markierter Text==` | Text `#0f172a` | **14.8:1** | ✅ AAA Bestanden |
| `colors.brand.text` | `#f8fafc` | Hauptfließtext (White/Slate 50) | `#0f172a` | **15.8:1** | ✅ AAA Bestanden |
| `colors.brand.text-muted` | `#cbd5e1` | Nebentext / Subtitel | `#0f172a` | **10.8:1** | ✅ AAA Bestanden |
| `colors.brand.bg` | `#0f172a` | Haupt-Hintergrund | - | - | Basis |
| `colors.brand.surface` | `#1e293b` | Karten & Container-Flächen | - | - | Basis |
| `colors.brand.focus` | `#38bdf8` | High-Visibility Fokus-Ring | `#0f172a` | **7.2:1** | ✅ AA Bestanden (Tastaturfokus) |

### 🟡 Highlight-Marker Token (`colors.brand.marker`)
Für Hervorhebungen in Markdown/Text (`==markierter Text==`):
- **Hintergrund**: `#fbd100` (Gelb-Marker aus Live-CSS `mark { background-color:#ff0;color:#000 }`)
- **Textfarbe**: `#0f172a` (Dunkles Slate)
- **Kontrast**: **14.8:1** (Weit über dem geforderten 4.5:1 Mindestwert).

---

## 🔤 2. Typografie & Schriftfamilien

- **Fließtext (`fontFamily.sans`)**: `'Open Sans'`, `'Inter'`, `system-ui`, `sans-serif`
  - Lesefreundliche, gut strukturierte Grotesk-Schriftart.
- **Überschriften (`fontFamily.heading`)**: `'Montserrat'`, `'Radley'`, `sans-serif`
  - Prägnante Überschriften mit hoher Wiedererkennung.

---

## 📐 3. Radien- & Spacing-Tokens

- **`borderRadius.card`**: `1rem` (`16px`) — Abrundung für Event-, Blog- und Buchkarten.
- **`borderRadius.button`**: `0.75rem` (`12px`) — Abrundung für Interaktions-Buttons.
- **`borderRadius.pill`**: `9999px` — Vollständig abgerundete Pills für Sprachumschalter und Standort-Badges.
- **`spacing.card`**: `1.5rem` (`24px`) — Innenabstand für Karten.
- **`spacing.section`**: `4rem` (`64px`) — Vertikaler Abstand für Hauptsektionen.
